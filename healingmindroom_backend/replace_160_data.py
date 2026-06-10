import random
import codecs
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

# --- 1. 160개 데이터 CSV 생성 ---
random.seed(42)
regions = [
    ("경기도", "양평군", "031"), ("경기도", "가평군", "031"), ("경기도", "포천시", "031"),
    ("강원도", "평창군", "033"), ("강원도", "홍천군", "033"), ("강원도", "춘천시", "033"), ("강원도", "정선군", "033"),
    ("충청남도", "부여군", "041"), ("충청남도", "공주시", "041"), ("충청북도", "제천시", "043"),
    ("전라남도", "담양군", "061"), ("전라남도", "순천시", "061"), ("전라남도", "보성군", "061"),
    ("전라북도", "순창군", "063"), ("전라북도", "완주군", "063"),
    ("경상북도", "안동시", "054"), ("경상북도", "문경시", "054"), ("경상북도", "영주시", "054"),
    ("경상남도", "남해군", "055"), ("경상남도", "하동군", "055"),
    ("제주특별자치도", "서귀포시", "064"), ("제주특별자치도", "제주시", "064")
]

farm_prefixes = ["푸른", "별빛", "마음", "자연", "햇살", "바람", "초록", "하늘", "은빛", "황금", "청정", "달빛", "소나무", "구름", "이슬"]
farm_suffixes = ["치유농장", "치유의숲", "농원", "힐링센터", "쉼터", "체험마을", "수목원", "스테이", "에코팜", "산림치유원"]
road_names = ["퇴계로", "평화로", "산림로", "청정로", "자연로", "힐링로", "수목원로", "별빛로", "햇살로", "구름로"]
data = []
id_counter = 1

def generate_phone(prefix):
    return f"{prefix}-{random.randint(100, 9999)}-{random.randint(1000, 9999)}"

desc_prog = [
    ("[30대 맞춤] 치열한 경쟁과 직장 생활의 압박으로 지친 30대를 위한 공간입니다. 다이나믹한 액티비티와 몰입형 명상 프로그램을 통해 스트레스를 해소하고 새로운 활력을 충전할 수 있습니다.", ["스트레스 완화 명상 및 허브차 체험", "산악 트레킹 및 숲속 액티비티", "청년 리프레시 캠프", "자연 속 크로스핏 및 요가", "수제 맥주 양조 및 바비큐 파티"]),
    ("[40대 맞춤] 끊임없는 업무와 복잡한 인간관계로 번아웃에 빠진 40대를 위해 준비되었습니다. 고요한 자연 속에서의 완전한 고립과 깊은 휴식을 통해 무거운 짐을 내려놓고 재충전의 시간을 가집니다.", ["번아웃 극복 요가 및 감귤 수확", "디지털 디톡스 및 숲속 멍때리기", "가족 단위 주말 농장 체험", "싱잉볼 명상 및 다도 체험", "심신 안정 아로마 테라피"]),
    ("[50대 맞춤] 은퇴를 앞두고 제2의 인생을 고민하는 50대에게 최적화된 곳입니다. 농촌 생활을 미리 경험해보고 흙을 만지며 마음의 평안과 새로운 삶의 방향성을 탐색해 봅니다.", ["귀농귀촌 기초 교육 및 텃밭 가꾸기", "자연 밥상 요리 교실 및 산책", "제2의 인생 설계 멘토링 캠프", "목공예 체험 및 전원생활 실습", "숲 해설가 동반 심층 트레킹"]),
    ("[60대 맞춤] 은퇴 후 찾아오는 외로움과 신체적 변화로 힘들어하시는 60대 어르신들을 위한 힐링 공간입니다. 원예 치료와 가벼운 산책을 통해 정서적 안정감과 삶의 활력을 되찾아 드립니다.", ["시니어 건강 증진 산책 및 원예 치료", "전통 장 담그기 및 한방 족욕", "반려식물 키우기 및 미술 치료", "어르신 맞춤형 온천 테라피", "추억 회상 및 힐링 음악회"])
]

for cat_idx in range(4):
    for i in range(40): # 카테고리당 40개씩 총 160개
        region = random.choice(regions)
        farm_name = f"{random.choice(farm_prefixes)}{random.choice(farm_prefixes)} {random.choice(farm_suffixes)}"
        location = f"{region[0]} {region[1]} {random.choice(road_names)} {random.randint(1, 999)}"
        phone = generate_phone(region[2])
        desc = desc_prog[cat_idx][0]
        prog = random.choice(desc_prog[cat_idx][1])
        data.append((id_counter, cat_idx+1, farm_name, location, phone, desc, prog))
        id_counter += 1

csv_lines = ["id,category_id,farm_name,location,phone,description,original_program"]
for row in data:
    csv_lines.append(f"{row[0]},{row[1]},{row[2]},{row[3]},{row[4]},\"{row[5]}\",\"{row[6]}\"")

csv_path = os.path.join(os.path.dirname(__file__), "healing_farms_160_records.csv")
with codecs.open(csv_path, 'w', 'utf-8-sig') as f:
    f.write("\n".join(csv_lines))

print("[STEP 1] 160 records CSV file created successfully.")

# --- 2. 파이어베이스 기존 데이터 삭제 및 새 데이터 업로드 ---
key_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

if not os.path.exists(key_path):
    print("Error: serviceAccountKey.json not found.")
    exit(1)

# Initialize Firebase app only if it hasn't been initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
collection_ref = db.collection("healing_farms")

print("[STEP 2] Firebase connected. Deleting existing data...")

# Delete all existing documents in the collection
docs = collection_ref.stream()
batch = db.batch()
delete_count = 0

for doc in docs:
    batch.delete(doc.reference)
    delete_count += 1
    if delete_count % 400 == 0:
        batch.commit()
        batch = db.batch()

if delete_count > 0:
    batch.commit()
    print(f"Deleted {delete_count} existing records.")
else:
    print("No existing records found.")

print("[STEP 3] Uploading 160 new records...")
df = pd.read_csv(csv_path)
df = df.fillna("")

batch = db.batch()
upload_count = 0

for index, row in df.iterrows():
    doc_id = f"farm_{int(row['id']):03d}"
    data_dict = {
        "id": int(row['id']),
        "category_id": int(row['category_id']),
        "farm_name": str(row['farm_name']),
        "location": str(row['location']),
        "phone": str(row['phone']),
        "description": str(row['description']),
        "original_program": str(row['original_program'])
    }
    
    doc_ref = collection_ref.document(doc_id)
    batch.set(doc_ref, data_dict)
    upload_count += 1
    
    if upload_count % 40 == 0:
        batch.commit()
        print(f"Progress: ({upload_count}/160) uploaded.")
        batch = db.batch()

# 남은 배치 커밋
if upload_count % 40 != 0:
    batch.commit()
    print(f"Progress: ({upload_count}/160) uploaded.")

print("[DONE] Successfully replaced Firebase data with 160 new records!")
