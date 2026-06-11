import pandas as pd
import json
import os

csv_path = r"c:\Users\User\Desktop\Healing Mindroom\healingmindroom_backend\healing_farms_160_v2.csv"
json_path = r"c:\Users\User\Desktop\Healing Mindroom\healingmindroom_frontend\src\data\farms.json"

df = pd.read_csv(csv_path)
df = df.fillna("")

farms = []
for index, row in df.iterrows():
    rawIdNum = int(row['id'])
    categoryId = int(row['category_id'])
    
    # 지역 파싱
    location = str(row['location'])
    area = '경기'
    if '경기' in location: area = '경기'
    elif '강원' in location: area = '강원'
    elif any(x in location for x in ['충청', '대전', '세종']): area = '충청'
    elif any(x in location for x in ['전라', '광주']): area = '전라'
    elif any(x in location for x in ['경상', '부산', '대구', '울산']): area = '경상'
    elif '제주' in location: area = '제주'
        
    # 연령대 매핑
    targetAges = ['30s'] if categoryId == 1 else \
                 ['40s'] if categoryId == 2 else \
                 ['50s'] if categoryId == 3 else ['60s']
                 
    # 우세 뇌파 매핑
    waveType = 'theta' if categoryId in [1, 3] else 'alpha'
    
    # 테마 매핑
    themes = ['활동', '자연'] if categoryId == 1 else \
             ['안정', '자연'] if categoryId == 2 else \
             ['자연', '활동'] if categoryId == 3 else ['안정', '자연']
             
    # 프로그램 배열 파싱
    originalProgram = str(row['original_program'])
    import re
    programs = [p.strip() for p in re.split(r' 및 |,', originalProgram) if p.strip()]
    
    farm = {
        "id": f"farm-{str(rawIdNum).zfill(3)}",
        "name": str(row['farm_name']),
        "location": location,
        "area": area,
        "description": str(row['description']),
        "imageUrl": str(row['imageUrl']),
        "themes": themes,
        "targetAges": targetAges,
        "waveType": waveType,
        "programs": programs,
        "contact": str(row['phone']),
        "categoryId": categoryId
    }
    farms.append(farm)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(farms, f, ensure_ascii=False, indent=2)

print("farms.json updated successfully!")
