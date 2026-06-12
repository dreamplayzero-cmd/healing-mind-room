import json
import random

json_path = r"c:\Users\User\Desktop\Healing Mindroom\healingmindroom_frontend\src\data\farms.json"

with open(json_path, 'r', encoding='utf-8') as f:
    farms = json.load(f)

images = {
    "campfire": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F30s%2FCampfire_in_Korean_forest_202606101707.jpeg?alt=media&token=b3fb9681-8c9b-4770-acec-345cd6b8b5b4",
    "herbs": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F30s%2FPeople_picking_herbs_garden_202606120024.jpeg?alt=media&token=18b98faa-f806-433a-b7bc-021c008528c9",
    "yoga": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F30s%2FPerson_doing_yoga_wooden_deck_202606120024.jpeg?alt=media&token=df68efdf-39d7-45b5-9eed-368ff93f9106",
    "hiking": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F30s%2FYoung_adults_hiking_Korean_forest_202606111710.jpeg?alt=media&token=b1db42d2-a8f0-4c02-aeb1-d7de28dae37e",
    "lake": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F40s%2FCalm_lake_surrounded_by_mountains_202606101707.jpeg?alt=media&token=bb495b08-1ec8-4a0b-b73c-6b3d5c209ab2",
    "tea": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F40s%2FPerson_sitting_in_tea_room_202606101707.jpeg?alt=media&token=c4e3d33e-d469-4c58-b191-890bd50d596a",
    "tangerine": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F40s%2FTangerine_orchard_in_sunlight_202606101707.jpeg?alt=media&token=25d291e1-958b-4cd7-907f-157d8bce50d9",
    "cabin": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F40s%2FWooden_cabin_in_Korean_forest_202606101707.jpeg?alt=media&token=b82dd082-1554-4470-aa20-9146f19da410",
    "country": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F50s%2FKorean_country_house_blooming_ga%E2%80%A6_202606101708.jpeg?alt=media&token=6eda870e-e9f9-4e24-8df6-12b0a33809f3",
    "dining": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F50s%2FOutdoor_dining_table_Korean_food_202606101708.jpeg?alt=media&token=08ea7124-68bf-4102-9fd6-0980b450dbc7",
    "vegetable": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F50s%2FPerson_tending_vegetable_garden_202606101707.jpeg?alt=media&token=f04cfc54-3fb0-48d1-904c-8b277338d4c6",
    "wood": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F50s%2FRustic_woodworking_studio_rural_%E2%80%A6_202606101708.jpeg?alt=media&token=847fa6e0-241b-42b7-ab50-c0a5a87e9a6b",
    "seeds": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F60s%2FElderly_person_planting_seeds_gr%E2%80%A6_202606101708.jpeg?alt=media&token=8c88c6ee-a1a6-4e75-bd4a-5211001fe832",
    "spa": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F60s%2FOutdoor_foot_spa_healing_garden_202606101708.jpeg?alt=media&token=e28fc6a7-e349-459c-80f2-8be6ce66b013",
    "hanok": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F60s%2FSunny_backyard_Hanok_house_Jangd%E2%80%A6_202606101708.jpeg?alt=media&token=54f1b3f6-46e5-4f3b-a3f1-a6d9599bfa26",
    "walk": "https://firebasestorage.googleapis.com/v0/b/healing-mind-2026.firebasestorage.app/o/healing-images%2F60s%2FWalking_path_through_autumn_forest_202606101708.jpeg?alt=media&token=850af6f3-0c87-4047-aada-07c41037ef7a"
}

keywords_map = {
    "campfire": ["캠프", "불", "별", "야영", "바베큐", "밤", "캠핑"],
    "yoga": ["요가", "명상", "수련", "치유", "데크"],
    "hiking": ["등산", "트래킹", "산", "오름", "숲길"],
    "lake": ["호수", "물", "연못", "수변", "계곡"],
    "tea": ["다도", "차", "녹차", "명상", "휴식", "정신"],
    "tangerine": ["과일", "과수원", "귤", "딸기", "수확", "따기", "농장"],
    "cabin": ["오두막", "펜션", "숙박", "황토", "스테이"],
    "country": ["마을", "시골", "정원", "꽃", "야생화", "농원", "자연"],
    "dining": ["식사", "음식", "로컬푸드", "밥상", "요리"],
    "vegetable": ["텃밭", "채소", "가꾸기", "유기농"],
    "wood": ["목공", "만들기", "공예", "체험", "도자기"],
    "seeds": ["씨앗", "파종", "농작물", "원예"],
    "spa": ["족욕", "스파", "테라피", "찜질"],
    "hanok": ["한옥", "전통", "장독대", "된장", "장", "고택"],
    "walk": ["산책", "둘레길", "가을", "단풍", "수목원", "걷기"],
    "herbs": ["허브", "향", "식물", "치유농업", "농장"]
}

for farm in farms:
    text = (farm.get('name', '') + " " + farm.get('description', '') + " " + " ".join(farm.get('programs', []))).lower()
    best_match = None
    best_score = 0
    
    # Keyword matching
    for key, words in keywords_map.items():
        score = sum(1 for w in words if w in text)
        if score > best_score:
            best_score = score
            best_match = key
            
    if best_match:
        farm['imageUrl'] = images[best_match]
    else:
        # Fallback to random if no keyword matches, but avoid consecutive duplicates by keeping state
        farm['imageUrl'] = random.choice(list(images.values()))

# Ensure no two adjacent farms have the exact same image to avoid visual duplication
for i in range(1, len(farms)):
    if farms[i]['imageUrl'] == farms[i-1]['imageUrl']:
        available = [url for url in images.values() if url != farms[i-1]['imageUrl']]
        farms[i]['imageUrl'] = random.choice(available)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(farms, f, ensure_ascii=False, indent=2)

print("farms.json updated with intelligent image assignments!")
