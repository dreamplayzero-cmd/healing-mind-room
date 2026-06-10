import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// Firebase Config 로드 (.env 환경 변수가 process.env에 주입됨)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase API key is missing! Please make sure your .env has VITE_FIREBASE_API_KEY.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// farms.json 데이터 로드
const farmsData = JSON.parse(fs.readFileSync("src/data/farms.json", "utf8"));

async function migrate() {
  console.log(`📡 Starting migration of ${farmsData.length} farms to Firestore...`);
  
  for (const farm of farmsData) {
    const rawIdNum = parseInt(farm.id.replace(/[^0-9]/g, '')) || 0;
    const docId = `farm-${String(rawIdNum).padStart(3, '0')}`;
    
    // Firestore 규격(normalizeFarmData에서 정상 파싱 가능한 형태)으로 가공하여 삽입
    const docData = {
      category_id: farm.categoryId,
      farm_name: farm.name,
      location: farm.location,
      description: farm.description,
      imageUrl: farm.imageUrl,
      themes: farm.themes,
      targetAges: farm.targetAges,
      waveType: farm.waveType,
      original_program: farm.programs.join(', '),
      phone: farm.contact
    };
    
    try {
      await setDoc(doc(db, "healing_farms", docId), docData);
      console.log(`✅ Uploaded: ${docId} - ${farm.name}`);
    } catch (e) {
      console.error(`❌ Failed to upload: ${docId}`, e);
    }
  }
  console.log("🎯 Migration complete successfully!");
}

migrate();
