import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import type { Farm } from '../types';
import localFarms from '../data/farms.json'; // 120개 마이그레이션된 정적 데이터

const enableFirestore = import.meta.env.VITE_ENABLE_FIRESTORE === 'true';

/**
 * Promise가 지정된 시간(ms) 내에 완료되지 않으면 타임아웃 오류를 던지는 헬퍼
 */
function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms}ms`)), ms)
    )
  ]);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healing-mind-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Firestore 초기화 지연 처리 (환경변수 활성화 시에만 기동)
let db: any = null;
if (enableFirestore && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key_here') {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase 및 Firestore 연동 성공");
  } catch (error) {
    console.error("❌ Firebase 초기화 에러:", error);
  }
}

/**
 * Firestore 농장 스키마 데이터를 프론트엔드 'Farm' 타입 규격으로 정규화하는 헬퍼 함수
 */
function normalizeFarmData(id: string, data: any): Farm {
  // Unsplash 정적 이미지 풀
  const imageUrls = [
    "https://images.unsplash.com/photo-1546842931-886c185b4c8c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545231027-637d2f6210f8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop"
  ];

  const categoryId = Number(data.category_id);
  const rawIdNum = parseInt(id.replace(/[^0-9]/g, '')) || 0;

  // 지역 파싱
  const location = data.location || "";
  let area = '경기';
  if (location.includes('경기')) area = '경기';
  else if (location.includes('강원')) area = '강원';
  else if (location.includes('충청') || location.includes('대전') || location.includes('세종')) area = '충청';
  else if (location.includes('전라') || location.includes('광주')) area = '전라';
  else if (location.includes('경상') || location.includes('부산') || location.includes('대구') || location.includes('울산')) area = '경상';
  else if (location.includes('제주')) area = '제주';

  // 연령대 매핑
  const targetAges = categoryId === 1 ? ['30s']
                   : categoryId === 2 ? ['40s']
                   : categoryId === 3 ? ['50s']
                   : ['60s'];

  // 우세 뇌파 매핑
  const waveType = (categoryId === 1 || categoryId === 3) ? 'theta' : 'alpha';

  // 테마 매핑
  const themes = categoryId === 1 ? ['활동', '자연']
               : categoryId === 2 ? ['안정', '자연']
               : categoryId === 3 ? ['자연', '활동']
               : ['안정', '자연'];

  // 프로그램 배열 파싱
  const originalProgram = data.original_program || "";
  const programs = originalProgram
    .split(/ 및 |,/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  return {
    id: `farm-${String(rawIdNum).padStart(3, '0')}`,
    name: data.farm_name || data.name || "",
    location: location,
    area: area,
    description: data.description || "",
    imageUrl: data.imageUrl || imageUrls[rawIdNum % imageUrls.length],
    themes: data.themes || themes,
    targetAges: data.targetAges || targetAges,
    waveType: data.waveType || waveType,
    programs: data.programs || programs,
    contact: data.phone || data.contact || "",
    categoryId: categoryId
  };
}

/**
 * 2단계 자가진단 뇌파 분석 카테고리 ID를 바탕으로 Firestore 실시간 매칭 농장 로드
 * (Firestore 비활성화 시 로컬 farms.json 백업 데이터 폴백 지원)
 */
export async function getMatchingFarms(categoryId: number): Promise<Farm[]> {
  // 1. 로컬 폴백 분기
  if (!db) {
    console.log(`📡 [Mock Firestore] ${categoryId}번 카테고리 로컬 농장 로드 시작`);
    return (localFarms as Farm[]).filter(f => f.categoryId === categoryId);
  }

  try {
    const farmsRef = collection(db, "healing_farms");
    
    // [보안 방어 대책 1] category_id가 숫자형일 경우로 1차 조회 시도
    let q = query(farmsRef, where("category_id", "==", Number(categoryId)));
    let querySnapshot = await withTimeout(getDocs(q), 3000);
    let farmsList: Farm[] = [];
    
    querySnapshot.forEach((doc) => {
      farmsList.push(normalizeFarmData(doc.id, doc.data()));
    });
    
    // [보안 방어 대책 2] 결과가 0개인 경우, DB에 문자열(String) 타입으로 저장되어 있는지 재시도 쿼리 실행
    if (farmsList.length === 0) {
      console.log(`⚠️ category_id 숫자형 쿼리 결과가 0개입니다. 문자열형("category_id" == "${categoryId}")으로 재시도합니다.`);
      q = query(farmsRef, where("category_id", "==", String(categoryId)));
      querySnapshot = await withTimeout(getDocs(q), 3000);
      querySnapshot.forEach((doc) => {
        farmsList.push(normalizeFarmData(doc.id, doc.data()));
      });
    }

    // [보안 방어 대책 3] 쿼리 결과가 여전히 0개라면, UI 깨짐(공백 노출) 방지를 위해 로컬 farms.json 백업 데이터로 즉시 폴백
    if (farmsList.length === 0) {
      console.warn(`⚠️ Firestore에서 ${categoryId}번 카테고리 실시간 데이터를 찾을 수 없어 로컬 백업 데이터로 폴백합니다.`);
      return (localFarms as Farm[]).filter(f => f.categoryId === categoryId);
    }
    
    console.log(`🎯 ${categoryId}번 카테고리 매칭 완료: 총 ${farmsList.length}개의 치유농장 로드 성공`);
    return farmsList;
  } catch (error) {
    console.error("❌ 치유농장 데이터 연동 중 오류 발생, 로컬 데이터로 폴백합니다:", error);
    // 에러 발생 시 로컬 백업 반환
    return (localFarms as Farm[]).filter(f => f.categoryId === categoryId);
  }
}

/**
 * 치유농장 전체 리스트를 Firestore에서 로드
 * (Firestore 비활성화 시 로컬 farms.json 백업 데이터 전체 반환)
 */
export async function getAllFarmsFromFirestore(): Promise<Farm[]> {
  if (!db) {
    console.log(`📡 [Mock Firestore] 전체 로컬 농장 데이터(${localFarms.length}개) 로드 완료`);
    return localFarms as Farm[];
  }

  try {
    const farmsRef = collection(db, "healing_farms");
    const querySnapshot = await withTimeout(getDocs(farmsRef), 3000);
    const farmsList: Farm[] = [];
    
    querySnapshot.forEach((doc) => {
      farmsList.push(normalizeFarmData(doc.id, doc.data()));
    });
    
    // [보안 방어 대책] 만약 Firestore 'healing_farms' 컬렉션 자체가 비어 있다면 로컬 백업 데이터 반환
    if (farmsList.length === 0) {
      console.warn("⚠️ Firestore 컬렉션 문서가 0개이므로 로컬 백업 데이터를 리턴합니다.");
      return localFarms as Farm[];
    }

    console.log(`🎯 전체 치유농장 로드 완료: 총 ${farmsList.length}개 로드 성공`);
    return farmsList;
  } catch (error) {
    console.error("❌ 전체 치유농장 데이터 로드 중 오류 발생, 로컬 데이터를 활용합니다:", error);
    return localFarms as Farm[];
  }
}
