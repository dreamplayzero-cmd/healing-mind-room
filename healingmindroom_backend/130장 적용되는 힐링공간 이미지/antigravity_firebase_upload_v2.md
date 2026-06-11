# Antigravity 프롬프트 — Firebase Storage 이미지 업로드

아래 프롬프트를 Antigravity 대화창에 그대로 붙여넣기 하세요.

---

## 📋 붙여넣기용 프롬프트

```
아래 작업을 순서대로 진행해줘.

## 작업 목표
Healing Mind Room 치유농장 이미지 16장을
Firebase Storage에 업로드하고
Firestore healing_farms 컬렉션에 imageUrl 필드를 추가한다.

---

## 이미지 파일 목록 (총 16장)

### 30대 폴더 → healing-images/30s/ (4장)
1. Campfire_in_Korean_forest_202606101707.jpeg
2. People_picking_herbs_garden_202606120024.jpeg
3. Person_doing_yoga_wooden_deck_202606120024.jpeg
4. Young_adults_hiking_Korean_forest_202606111710.jpeg

### 40대 폴더 → healing-images/40s/ (4장)
5. Calm_lake_surrounded_by_mountains_202606101707.jpeg
6. Person_sitting_in_tea_room_202606101707.jpeg
7. Tangerine_orchard_in_sunlight_202606101707.jpeg
8. Wooden_cabin_in_Korean_forest_202606101707.jpeg

### 50대 폴더 → healing-images/50s/ (4장)
9. Korean_country_house_blooming_ga_202606101708.jpeg
10. Outdoor_dining_table_Korean_food_202606101708.jpeg
11. Person_tending_vegetable_garden_202606101707.jpeg
12. Rustic_woodworking_studio_rural_202606101708.jpeg

### 60대 폴더 → healing-images/60s/ (4장)
13. Elderly_person_planting_seeds_202606101708.jpeg
14. Outdoor_foot_spa_healing_garden_202606101708.jpeg
15. Sunny_backyard_Hanok_house_202606101708.jpeg
16. Walking_path_through_autumn_forest_202606101708.jpeg

---

## STEP 1. Firebase Storage 업로드 스크립트

아래 조건으로 이미지 업로드 스크립트를 작성해줘.

- firebase/storage 사용
- 폴더 구조: healing-images/30s/, 40s/, 50s/, 60s/
- 업로드 후 getDownloadURL()로 공개 URL 반환
- 각 이미지 업로드 완료 시 파일명과 URL 콘솔 출력
- try/catch 에러 처리 포함

```javascript
// 결과물 예시
// 업로드 완료: 30s/Campfire_in_Korean_forest.jpeg
// URL: https://firebasestorage.googleapis.com/...
```

---

## STEP 2. Firestore imageUrl 필드 일괄 업데이트

category_id 기준으로 각 농장 문서에 imageUrl을 랜덤 배치하는
배치 업데이트 스크립트를 작성해줘.

조건:
- category_id 1 → 30s 이미지 4장 중 랜덤
- category_id 2 → 40s 이미지 4장 중 랜덤
- category_id 3 → 50s 이미지 4장 중 랜덤
- category_id 4 → 60s 이미지 4장 중 랜덤
- Firestore batch write 사용 (500개 단위)
- 완료 후 업데이트된 총 문서 수 출력

---

## STEP 3. 프론트엔드 이미지 표시 코드

치유농장 추천 카드에서 imageUrl을 표시하는
React 컴포넌트 코드를 작성해줘.

조건:
- imageUrl이 없을 경우 기본 placeholder 이미지 표시
- 이미지 로딩 중 스켈레톤 UI 표시
- 모바일에서도 비율 유지 (aspect-ratio: 16/9)
- alt 텍스트는 farm_name 사용
```

---

## 💡 수동 업로드 방법 (코드 없이 더 빠른 방법)

Antigravity 대신 Firebase 콘솔에서 직접 하고 싶다면:

**1단계** Firebase 콘솔 → Storage → 시작하기

**2단계** 폴더 4개 생성
```
healing-images/
├── 30s/
├── 40s/
├── 50s/
└── 60s/
```

**3단계** 각 폴더에 해당 이미지 4장씩 드래그앤드롭 업로드

**4단계** 각 이미지 클릭 → **파일 URL 복사**

**5단계** 복사한 URL을 아래 매핑표에 정리

---

## 📋 URL 정리표 (수동 업로드 시 여기에 메모)

### 30대 이미지 URL
```
30s_image_1 = ""  // Campfire
30s_image_2 = ""  // Herbs garden
30s_image_3 = ""  // Yoga
30s_image_4 = ""  // Hiking
```

### 40대 이미지 URL
```
40s_image_1 = ""  // Lake
40s_image_2 = ""  // Tea room
40s_image_3 = ""  // Tangerine
40s_image_4 = ""  // Cabin
```

### 50대 이미지 URL
```
50s_image_1 = ""  // Country house
50s_image_2 = ""  // Dining table
50s_image_3 = ""  // Vegetable garden
50s_image_4 = ""  // Woodworking
```

### 60대 이미지 URL
```
60s_image_1 = ""  // Greenhouse
60s_image_2 = ""  // Foot spa
60s_image_3 = ""  // Hanok
60s_image_4 = ""  // Autumn walk
```

---

## ✅ 완료 체크리스트

- [ ] Firebase Storage에 16장 업로드 완료
- [ ] 각 이미지 공개 URL 확인
- [ ] Firestore healing_farms 컬렉션 imageUrl 필드 추가
- [ ] 화면에서 치유농장 카드에 이미지 정상 표시
- [ ] 모바일에서도 이미지 깨짐 없이 표시

---

*작성일: 2026년 6월*
*이미지 총 16장 | 할루시네이션 없음 확인 완료*
*확정권자: 팀장 (테크니컬 PM)*
