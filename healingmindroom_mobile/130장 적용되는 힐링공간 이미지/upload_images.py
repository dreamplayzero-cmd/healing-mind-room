import os
import random
import urllib.parse
from uuid import uuid4
import time
import datetime
import urllib.request
from email.utils import parsedate_to_datetime

def get_google_time_offset():
    try:
        res = urllib.request.urlopen('http://google.com')
        date_str = res.headers['Date']
        google_time = parsedate_to_datetime(date_str).timestamp()
        system_time = time.time()
        return google_time - system_time
    except Exception as e:
        print(f"Time offset error: {e}")
        return 0

offset = get_google_time_offset()

import google.auth._helpers
original_utcnow = google.auth._helpers.utcnow

def patched_utcnow():
    return original_utcnow() + datetime.timedelta(seconds=offset)

google.auth._helpers.utcnow = patched_utcnow

import google.auth.jwt
if hasattr(google.auth.jwt, 'datetime'):
    class PatchedDatetime(datetime.datetime):
        @classmethod
        def utcnow(cls):
            return super().utcnow() + datetime.timedelta(seconds=offset)
    google.auth.jwt.datetime = PatchedDatetime

import firebase_admin
from firebase_admin import credentials, firestore, storage

# Paths
base_dir = r"C:\Users\User\Desktop\130장 적용되는 힐링공간 이미지"
key_path = r"C:\Users\User\Desktop\Healing Mindroom\serviceAccountKey.json"

folder_map = {
    1: ("30대 - 액티비티 (32개 랜덤배치)", "30s"),
    2: ("40대 - 깊은 휴식 (34개 랜덤배치)", "40s"),
    3: ("50대 - 귀농 탐색 (31개 랜덤배치)", "50s"),
    4: ("60대 - 실버 힐링 (33개 랜덤배치)", "60s")
}

def main():
    print("🔗 파이어베이스 연결 중...")
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'healing-mind-2026.firebasestorage.app'
    })
    db = firestore.client()
    bucket = storage.bucket()

    category_urls = {1: [], 2: [], 3: [], 4: []}

    print("🚀 이미지 업로드 시작...")
    # Step 1: Upload images
    for cat_id, (folder_name, target_folder) in folder_map.items():
        folder_path = os.path.join(base_dir, folder_name)
        if not os.path.exists(folder_path):
            print(f"Warning: Folder not found {folder_path}")
            continue

        for filename in os.listdir(folder_path):
            if filename.endswith(".jpeg") or filename.endswith(".jpg") or filename.endswith(".png"):
                local_path = os.path.join(folder_path, filename)
                blob_name = f"healing-images/{target_folder}/{filename}"
                blob = bucket.blob(blob_name)
                
                # Generate a download token
                new_token = uuid4()
                metadata  = {"firebaseStorageDownloadTokens": str(new_token)}
                blob.metadata = metadata
                
                blob.upload_from_filename(local_path)
                
                # Construct the download URL
                encoded_name = urllib.parse.quote(blob_name, safe='')
                download_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_name}?alt=media&token={new_token}"
                
                print(f"업로드 완료: {target_folder}/{filename}")
                print(f"URL: {download_url}")
                
                category_urls[cat_id].append(download_url)

    print("\n🚀 Firestore 업데이트 시작...")
    # Step 2: Update Firestore
    collection_ref = db.collection('healing_farms')
    docs = collection_ref.stream()
    
    batch = db.batch()
    update_count = 0
    batch_count = 0

    for doc in docs:
        data = doc.to_dict()
        cat_id = data.get('category_id')
        
        if cat_id in category_urls and category_urls[cat_id]:
            selected_url = random.choice(category_urls[cat_id])
            batch.update(doc.reference, {'imageUrl': selected_url})
            update_count += 1
            batch_count += 1
            
            if batch_count == 500:
                batch.commit()
                batch = db.batch()
                batch_count = 0

    if batch_count > 0:
        batch.commit()

    print(f"\n🎉 업데이트 완료: 총 {update_count}개 문서에 imageUrl 필드가 추가/업데이트 되었습니다.")

if __name__ == "__main__":
    main()
