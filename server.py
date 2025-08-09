# test_server.py - 테스트용 더미 VTON 서버 (수정된 버전)
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import time
import random
import requests  # 추가

app = FastAPI(title="Test VTON API Server")

# CORS 설정 (더 구체적으로)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # 모든 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

def create_dummy_result_image(person_size=(512, 768)):
    """더미 결과 이미지 생성 - 더 현실적인 VTON 결과처럼 보이게"""
    width, height = person_size
    
    # 그라데이션 배경 생성 (하늘색에서 흰색으로)
    img = Image.new('RGB', (width, height), color=(135, 206, 235))  # 하늘색
    draw = ImageDraw.Draw(img)
    
    # 그라데이션 효과
    for y in range(height):
        alpha = y / height
        color_r = int(135 * (1 - alpha) + 255 * alpha)
        color_g = int(206 * (1 - alpha) + 255 * alpha)
        color_b = int(235 * (1 - alpha) + 255 * alpha)
        draw.line([(0, y), (width, y)], fill=(color_r, color_g, color_b))
    
    # 가상의 인물 실루엣 그리기
    person_width = width // 3
    person_height = height // 2
    person_x = (width - person_width) // 2
    person_y = height // 4
    
    # 머리 (타원)
    head_size = person_width // 3
    head_x = person_x + (person_width - head_size) // 2
    head_y = person_y
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], 
                fill=(255, 220, 177), outline=(0, 0, 0), width=2)  # 살색
    
    # 몸통 (사각형)
    body_y = head_y + head_size
    body_height = person_height - head_size
    
    # 셔츠 영역 (파란색 계열로 garment 표현)
    shirt_height = body_height // 2
    draw.rectangle([person_x, body_y, person_x + person_width, body_y + shirt_height], 
                  fill=(70, 130, 180), outline=(0, 0, 0), width=2)  # 스틸블루
    
    # 바지 영역
    pants_y = body_y + shirt_height
    pants_height = body_height - shirt_height
    draw.rectangle([person_x, pants_y, person_x + person_width, pants_y + pants_height], 
                  fill=(25, 25, 112), outline=(0, 0, 0), width=2)  # 미드나잇블루
    
    # 팔 (선)
    arm_y = body_y + 20
    draw.line([(person_x, arm_y), (person_x - 30, arm_y + 60)], fill=(255, 220, 177), width=8)
    draw.line([(person_x + person_width, arm_y), (person_x + person_width + 30, arm_y + 60)], 
             fill=(255, 220, 177), width=8)
    
    # 텍스트 추가
    try:
        # 시스템 폰트 시도
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/System/Library/Fonts/Arial.ttf",  # macOS
            "C:/Windows/Fonts/arial.ttf",  # Windows
        ]
        font = None
        for font_path in font_paths:
            try:
                font = ImageFont.truetype(font_path, 24)
                break
            except:
                continue
        
        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # 상단에 제목
    title = "✨ VIRTUAL TRY-ON RESULT ✨"
    bbox = draw.textbbox((0, 0), title, font=font)
    title_width = bbox[2] - bbox[0]
    title_x = (width - title_width) // 2
    
    # 텍스트 그림자
    draw.text((title_x + 2, 22), title, fill=(0, 0, 0), font=font)
    draw.text((title_x, 20), title, fill=(255, 255, 255), font=font)
    
    # 하단에 정보
    info_lines = [
        f"Generated at {time.strftime('%H:%M:%S')}",
        f"Size: {width}x{height}",
        "✓ Person: Processed",
        "✓ Garment: Applied", 
        "Status: SUCCESS"
    ]
    
    y_offset = height - 150
    for line in info_lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        
        # 그림자 효과
        draw.text((x + 1, y_offset + 1), line, fill=(0, 0, 0, 128), font=font)
        draw.text((x, y_offset), line, fill=(255, 255, 255), font=font)
        
        y_offset += 25
    
    # 테두리 추가
    draw.rectangle([0, 0, width-1, height-1], outline=(0, 0, 0), width=3)
    
    return img

@app.post("/v1/vton/idm")
async def vton_idm(
    person: UploadFile = File(None),
    garment: UploadFile = File(None),
    person_url: str = Form(None),
    garment_url: str = Form(None)
):
    try:
        print(f"Received VTON request:")
        print(f"  - person file: {person.filename if person else None}")
        print(f"  - garment file: {garment.filename if garment else None}")
        print(f"  - person_url: {person_url}")
        print(f"  - garment_url: {garment_url}")
        
        # 입력 검증
        if not (person or person_url):
            raise HTTPException(status_code=400, detail="person or person_url required")
        
        if not (garment or garment_url):
            raise HTTPException(status_code=400, detail="garment or garment_url required")
        
        # 처리 시뮬레이션 (2-3초 대기)
        processing_time = random.uniform(2.0, 3.5)
        print(f"Simulating processing for {processing_time:.1f} seconds...")
        time.sleep(processing_time)
        
        # person 이미지 처리
        person_size = (512, 768)  # 기본 크기
        if person:
            try:
                person_data = await person.read()
                print(f"Person data size: {len(person_data)} bytes")
                person_img = Image.open(io.BytesIO(person_data))
                person_size = person_img.size
                print(f"Person image size: {person_size}")
            except Exception as e:
                print(f"Error processing person image: {e}")
                # 에러가 있어도 계속 진행 (테스트용)
        else:
            # person_url에서 다운로드
            try:
                import requests
                response = requests.get(person_url, timeout=10)
                response.raise_for_status()
                person_data = response.content
                person_img = Image.open(io.BytesIO(person_data))
                person_size = person_img.size
                print(f"Downloaded person image size: {person_size}")
            except Exception as e:
                print(f"Error downloading person image: {e}")
        
        # garment 이미지 처리
        if garment:
            try:
                garment_data = await garment.read()
                print(f"Garment data size: {len(garment_data)} bytes")
                garment_img = Image.open(io.BytesIO(garment_data))
                print(f"Garment image size: {garment_img.size}")
            except Exception as e:
                print(f"Error processing garment image: {e}")
        else:
            # garment_url에서 다운로드
            try:
                import requests
                response = requests.get(garment_url, timeout=10)
                response.raise_for_status()
                garment_data = response.content
                garment_img = Image.open(io.BytesIO(garment_data))
                print(f"Downloaded garment image size: {garment_img.size}")
            except Exception as e:
                print(f"Error downloading garment image: {e}")
        
        # 실제 IDM-VTON 모델 실행 (주석 해제하고 경로 수정 필요)
        # result_base64 = await run_local_idm_vton(person_data, garment_data)
        # return {"image_base64": result_base64}
        
        # 임시: 더미 응답 (실제 모델 연동 전까지)
        print("⚠️  현재 더미 이미지를 반환하고 있습니다. 실제 VTON 모델을 연동하세요.")
        result_img = create_dummy_result_image(person_size)
        
        # 항상 base64로 응답 (URL 의존성 제거)
        buffer = io.BytesIO()
        result_img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        print(f"Generated result image: {person_size}, base64 length: {len(img_base64)}")
        return {"image_base64": img_base64}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "service": "Test VTON API",
        "timestamp": time.time()
    }

@app.get("/")
async def root():
    return {
        "message": "Test VTON API Server",
        "endpoints": {
            "vton": "POST /v1/vton/idm",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Test VTON API Server...")
    print("This server generates dummy VTON results for testing purposes.")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
