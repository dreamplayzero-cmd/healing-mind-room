import pandas as pd
import os

# 파일 경로 설정
csv_path = os.path.join(os.path.dirname(__file__), "healing_farms_160_v2.csv")
sql_path = os.path.join(os.path.dirname(__file__), "healing_farms_160_v2.sql")

if not os.path.exists(csv_path):
    print(f"Error: CSV file not found at {csv_path}")
    exit(1)

# CSV 읽기
df = pd.read_csv(csv_path)
df = df.fillna("")

sql_lines = []
sql_lines.append("-- Healing Mind Room 160 Farms Data (v2: Real 30 + Dummy 130 + Images)")
sql_lines.append("CREATE TABLE IF NOT EXISTS \"HealingFarm\" (")
sql_lines.append("    id SERIAL PRIMARY KEY,")
sql_lines.append("    category_id INTEGER,")
sql_lines.append("    farm_name VARCHAR(255),")
sql_lines.append("    location VARCHAR(255),")
sql_lines.append("    phone VARCHAR(50),")
sql_lines.append("    description TEXT,")
sql_lines.append("    original_program TEXT,")
sql_lines.append("    region_zone VARCHAR(100),")
sql_lines.append("    distance_guide VARCHAR(255),")
sql_lines.append("    image_url TEXT,")
sql_lines.append("    is_real VARCHAR(50)")
sql_lines.append(");")
sql_lines.append("")
sql_lines.append("TRUNCATE TABLE \"HealingFarm\" RESTART IDENTITY CASCADE;")
sql_lines.append("")

# INSERT 구문 생성
for index, row in df.iterrows():
    desc = str(row['description']).replace("'", "''")
    prog = str(row['original_program']).replace("'", "''")
    farm_name = str(row['farm_name']).replace("'", "''")
    location = str(row['location']).replace("'", "''")
    
    insert_stmt = f"INSERT INTO \"HealingFarm\" (id, category_id, farm_name, location, phone, description, original_program, region_zone, distance_guide, image_url, is_real) " \
                  f"VALUES ({int(row['id'])}, {int(row['category_id'])}, '{farm_name}', '{location}', '{row['phone']}', '{desc}', '{prog}', '{row['region_zone']}', '{row['distance_guide']}', '{row['imageUrl']}', '{row['is_real']}');"
    sql_lines.append(insert_stmt)

# SQL 파일 저장
with open(sql_path, 'w', encoding='utf-8-sig') as f:
    f.write("\n".join(sql_lines))

print(f"Successfully generated SQL file: {sql_path}")
