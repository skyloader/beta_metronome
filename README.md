# Beta Metronome

Tastytrade Dashboard - 자금 규모 계산 및 QQQ Put Option 헤징 추천

## 개요

이 프로젝트는 Tastytrade 계정의 자금 규모를 계산하고, 이를 바탕으로 QQQ Put Option을 몇 개 사야 하는지 실시간으로 계산하여 보여주는 대시보드입니다.

## 기능

- **자금 규모 계산**: Tastytrade 계정의 현재 자금 규모 계산
  - Stock: (stock number × stock price)
  - Deep ITM Call: Number × 100 × Delta
  - Total: Sum of all positions

- **QQQ Put Option Hedge 추천**: 계산된 자금 규모에 따라 QQQ Put Option 권장 개수 제공

- **다중 계정 지원**: 콤보박스로 계정 선택 가능

- **실시간 대시보드**: React 기반 웹 대시보드

## 설치

```bash
npm install
```

## 설정

`token.info` 파일에 Tastytrade API credentials을 추가하세요:

```
client_secret: YOUR_CLIENT_SECRET
client_ID: YOUR_CLIENT_ID
refresh_token: YOUR_REFRESH_TOKEN
```

## 실행

```bash
# 전체 실행 (서버 + 프론트엔드)
npm run start:all

# 개별 실행
npm run dev:server      # 백엔드 서버 (포트 3001)
npm run dev             # 프론트엔드 개발 서버 (포트 5173)

# 빌드
npm run build

# 실행
npm start
```

## 구조

```
beta_metronome/
├── src/
│   ├── client.ts      # Tastytrade API 클라이언트
│   ├── index.ts       # CLI 실행 파일
│   ├── server.ts      # Express 백엔드 서버
│   ├── positions.ts   # 포지션 조회 로직
│   ├── funding.ts     # 자금 규모 계산 로직
│   └── hedge.ts       # QQQ Put Hedge 계산 로직
├── frontend/
│   ├── src/
│   │   ├── App.tsx    # 메인 React 앱
│   │   ├── main.tsx   # 엔트리 포인트
│   │   └── index.css  # Tailwind CSS
│   └── vite.config.ts # Vite 설정
└── package.json
```

## API Reference

[Tastytrade API Docs](https://developer.tastytrade.com/)
