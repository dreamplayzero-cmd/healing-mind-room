import random
import codecs
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

random.seed(123)

# 1. 지역 배분 설정
real_farm_distribution = [
    # 경기도 6 (30대2 / 40대2 / 50대1 / 60대1)
    {"region": ("경기도", "양평군", "031"), "cat": 1, "name": "양평 산음 힐링의숲"},
    {"region": ("경기도", "가평군", "031"), "cat": 1, "name": "가평 잣향기 푸른숲"},
    {"region": ("경기도", "포천시", "031"), "cat": 2, "name": "포천 평강랜드 치유농장"},
    {"region": ("경기도", "남양주시", "031"), "cat": 2, "name": "남양주 다산 생태농원"},
    {"region": ("경기도", "여주시", "031"), "cat": 3, "name": "여주 은아목장"},
    {"region": ("경기도", "연천군", "031"), "cat": 4, "name": "연천 애심목장 치유센터"},
    # 강원도 6 (30대2 / 40대1 / 50대2 / 60대1)
    {"region": ("강원도", "평창군", "033"), "cat": 1, "name": "평창 청옥산 잣나무숲"},
    {"region": ("강원도", "정선군", "033"), "cat": 1, "name": "정선 파크로쉬 웰니스"},
    {"region": ("강원도", "홍천군", "033"), "cat": 2, "name": "홍천 힐리언스 선마을"},
    {"region": ("강원도", "춘천시", "033"), "cat": 3, "name": "춘천 해피초원 치유농장"},
    {"region": ("강원도", "원주시", "033"), "cat": 3, "name": "원주 돼지문화원"},
    {"region": ("강원도", "영월군", "033"), "cat": 4, "name": "영월 동강 치유마을"},
    # 충청남도 4 (30대1 / 40대1 / 50대1 / 60대1)
    {"region": ("충청남도", "부여군", "041"), "cat": 1, "name": "부여 기와마을 치유농장"},
    {"region": ("충청남도", "공주시", "041"), "cat": 2, "name": "공주 계룡산 허브농원"},
    {"region": ("충청남도", "보령시", "041"), "cat": 3, "name": "보령 하늘맞이 농장"},
    {"region": ("충청남도", "서천군", "041"), "cat": 4, "name": "서천 치유의 숲"},
    # 충청북도 4 (30대1 / 40대1 / 50대1 / 60대1)
    {"region": ("충청북도", "제천시", "043"), "cat": 1, "name": "제천 한방 엑스포공원 치유원"},
    {"region": ("충청북도", "충주시", "043"), "cat": 2, "name": "충주 깊은산속 옹달샘"},
    {"region": ("충청북도", "단양군", "043"), "cat": 3, "name": "단양 소백산 자연휴양림"},
    {"region": ("충청북도", "보은군", "043"), "cat": 4, "name": "보은 속리산 테마파크"},
    # 전라남도 4 (30대1 / 40대1 / 50대1 / 60대1)
    {"region": ("전라남도", "순천시", "061"), "cat": 1, "name": "순천만 국가정원 치유센터"},
    {"region": ("전라남도", "담양군", "061"), "cat": 2, "name": "담양 죽녹원 힐링센터"},
    {"region": ("전라남도", "보성군", "061"), "cat": 3, "name": "보성 차밭 명상농원"},
    {"region": ("전라남도", "장흥군", "061"), "cat": 4, "name": "장흥 정남진 편백숲"},
    # 전라북도 3 (40대1 / 50대1 / 60대1)
    {"region": ("전라북도", "완주군", "063"), "cat": 2, "name": "완주 오성 한옥치유마을"},
    {"region": ("전라북도", "순창군", "063"), "cat": 3, "name": "순창 쉴랜드 치유농장"},
    {"region": ("전라북도", "남원시", "063"), "cat": 4, "name": "남원 지리산 허브밸리"},
    # 경상남도 3 (30대1 / 40대1 / 60대1)
    {"region": ("경상남도", "남해군", "055"), "cat": 1, "name": "남해 편백 자연휴양림"},
    {"region": ("경상남도", "하동군", "055"), "cat": 2, "name": "하동 야생차 치유농원"},
    {"region": ("경상남도", "산청군", "055"), "cat": 4, "name": "산청 동의보감촌 치유의숲"}
]

dummy_regions = [
    ("경기도", "이천시", "031"), ("경기도", "안성시", "031"), ("강원도", "강릉시", "033"),
    ("충청남도", "아산시", "041"), ("충청북도", "청주시", "043"), ("전라남도", "나주시", "061"),
    ("전라북도", "전주시", "063"), ("경상북도", "안동시", "054"), ("경상북도", "영주시", "054"),
    ("제주특별자치도", "서귀포시", "064")
]
farm_prefixes = ["푸른", "별빛", "마음", "자연", "햇살", "바람", "초록", "하늘", "은빛", "황금", "청정"]
farm_suffixes = ["치유농장", "치유의숲", "농원", "힐링센터", "쉼터", "체험마을", "수목원"]
road_names = ["퇴계로", "평화로", "산림로", "청정로", "자연로", "힐링로", "수목원로", "별빛로"]

desc_prog = [
    ("[30대 맞춤] 다이나믹한 액티비티와 몰입형 명상 프로그램을 통해 스트레스를 해소하고 새로운 활력을 충전할 수 있습니다.", ["스트레스 완화 명상 및 허브차 체험", "산악 트레킹 및 숲속 액티비티", "자연 속 크로스핏 및 요가"]),
    ("[40대 맞춤] 고요한 자연 속에서의 완전한 고립과 깊은 휴식을 통해 무거운 짐을 내려놓고 재충전의 시간을 가집니다.", ["번아웃 극복 요가 및 감귤 수확", "디지털 디톡스 및 숲속 멍때리기", "싱잉볼 명상 및 다도 체험"]),
    ("[50대 맞춤] 농촌 생활을 미리 경험해보고 흙을 만지며 마음의 평안과 새로운 삶의 방향성을 탐색해 봅니다.", ["귀농귀촌 기초 교육 및 텃밭 가꾸기", "자연 밥상 요리 교실 및 산책", "목공예 체험 및 전원생활 실습"]),
    ("[60대 맞춤] 원예 치료와 가벼운 산책을 통해 정서적 안정감과 삶의 활력을 되찾아 드립니다.", ["시니어 건강 증진 산책 및 원예 치료", "전통 장 담그기 및 한방 족욕", "반려식물 키우기 및 미술 치료"])
]

data = []
id_counter = 1

def generate_phone(prefix):
    return f"{prefix}-{random.randint(100, 9999)}-{random.randint(1000, 9999)}"

def get_region_zone_info(sido):
    if sido in ["경기도", "충청북도"]:
        return "가까운 힐링", "당일~1박2일 추천 코스"
    else:
        return "힐링 여행", "1박2일~2박3일 여행 코스"

# 1. 실제 데이터 30개 추가
for item in real_farm_distribution:
    region = item["region"]
    sido, sigungu, prefix = region
    farm_name = item["name"]
    location = f"{sido} {sigungu} {random.choice(road_names)} {random.randint(1, 999)}"
    phone = generate_phone(prefix)
    cat_idx = item["cat"] - 1
    desc = desc_prog[cat_idx][0]
    prog = random.choice(desc_prog[cat_idx][1])
    region_zone, distance_guide = get_region_zone_info(sido)
    # 실제 이미지는 loremflickr 사용
    image_url = f"https://loremflickr.com/800/600/farm,nature/all?lock={id_counter}"
    
    data.append((id_counter, item["cat"], farm_name, location, phone, desc, prog, region_zone, distance_guide, image_url, "real"))
    id_counter += 1

# 2. 더미 데이터 130개 추가 (목표: 각 카테고리별 40개가 되도록)
# 현재 카테고리별 개수 카운트
cat_counts = {1: 0, 2: 0, 3: 0, 4: 0}
for item in real_farm_distribution:
    cat_counts[item["cat"]] += 1

for cat_id in range(1, 5):
    needed = 40 - cat_counts[cat_id]
    for _ in range(needed):
        region = random.choice(dummy_regions)
        sido, sigungu, prefix = region
        farm_name = f"{random.choice(farm_prefixes)}{random.choice(farm_prefixes)} {random.choice(farm_suffixes)}"
        location = f"{sido} {sigungu} {random.choice(road_names)} {random.randint(1, 999)}"
        phone = generate_phone(prefix)
        cat_idx = cat_id - 1
        desc = desc_prog[cat_idx][0]
        prog = random.choice(desc_prog[cat_idx][1])
        region_zone, distance_guide = get_region_zone_info(sido)
        # 더미 이미지 (추후 Flow AI 원화로 교체될 예정)
        image_url = f"https://loremflickr.com/800/600/forest,healing/all?lock={id_counter}"
        
        data.append((id_counter, cat_id, farm_name, location, phone, desc, prog, region_zone, distance_guide, image_url, "dummy"))
        id_counter += 1

csv_lines = ["id,category_id,farm_name,location,phone,description,original_program,region_zone,distance_guide,imageUrl,is_real"]
for row in data:
    csv_lines.append(f"{row[0]},{row[1]},{row[2]},{row[3]},{row[4]},\"{row[5]}\",\"{row[6]}\",\"{row[7]}\",\"{row[8]}\",\"{row[9]}\",\"{row[10]}\"")

csv_path = os.path.join(os.path.dirname(__file__), "healing_farms_160_v2.csv")
with codecs.open(csv_path, 'w', 'utf-8-sig') as f:
    f.write("\n".join(csv_lines))

print("[STEP 1] 160 records (30 real + 130 dummy) CSV generated.")

# --- 파이어베이스 연동 및 업로드 ---
key_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")

if not os.path.exists(key_path):
    print("Error: serviceAccountKey.json not found.")
    exit(1)

if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
collection_ref = db.collection("healing_farms")

print("[STEP 2] Firebase connected. Deleting existing data...")

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

print("[STEP 3] Uploading 160 new records with imageUrl and region_zone...")
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
        "original_program": str(row['original_program']),
        "region_zone": str(row['region_zone']),
        "distance_guide": str(row['distance_guide']),
        "imageUrl": str(row['imageUrl']),
        "is_real": str(row['is_real'])
    }
    
    doc_ref = collection_ref.document(doc_id)
    batch.set(doc_ref, data_dict)
    upload_count += 1
    
    if upload_count % 40 == 0:
        batch.commit()
        print(f"Progress: ({upload_count}/160) uploaded.")
        batch = db.batch()

if upload_count % 40 != 0:
    batch.commit()
    print(f"Progress: ({upload_count}/160) uploaded.")

print("[DONE] Firebase update complete!")
