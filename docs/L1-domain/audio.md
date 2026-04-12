# L1: 음성/음악

## 역할
production-spec.json 기반으로 TTS 음성 + BGM 생성

## L2 구성
- **TTS 음성**: 캐릭터 음성 생성, 나레이션 생성, 엔진 전환 (Qwen3-TTS / GPT-SoVITS)
- **BGM/OST**: ACE-Step 1.5XL 로컬 GPU 생성, 볼륨/페이드 제어

## 담당
실행 에이전트 (Production Engineer)

## 기술
- TTS: Qwen3-TTS (localhost:8002) / GPT-SoVITS (localhost:8003) — 추상화 인터페이스
- BGM: ACE-Step 1.5XL (localhost:8001) — 로컬 GPU

## 출력
assets/voices/, assets/bgm/
