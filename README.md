# 🏫 스마트 클래스 (Smart Class Hub)
> Firebase Authentication & Cloud Firestore 기반의 반응형 출석 및 미니 퀴즈 대시보드 웹 애플리케이션

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite)

---

## 🌟 주요 기능 소개

1. **Firebase 인증 (Authentication)**
   - **구글 원클릭 로그인**: Google 계정으로 간편하게 출석 및 퀴즈 참여
   - **이메일/비밀번호 로그인 & 회원가입**: 학교 또는 개인 이메일로 계정 등록
   - **초보자 친화적 데모 모드**: Firebase 키 없이도 버튼 클릭 한 번으로 체험 가능

2. **오늘의 출석 체크 카드**
   - 오늘 날짜 기준 **1인 1회 출석 체크** 보장 (중복 출석 방지)
   - 출석 시 축하 폭죽(Confetti) 효과 🎉
   - 오늘 출석한 학생들의 실시간 출석 현황 목록 및 출석 시간 표시

3. **스마트 미니 퀴즈 (3문항)**
   - 웹 및 IT 기초 핵심 개념 3문항 (JavaScript, Firebase, HTML)
   - 문항별 답안 선택 및 즉시 자동 채점 (총 100점 만점)
   - 70점 이상/만점 달성 시 축하 애니메이션
   - 제출 후 오답 노트 및 친절한 한글 해설 제공

4. **실시간 통합 대시보드**
   - 오늘 총 출석자 수 통계
   - 퀴즈 참여자 수 및 평균 점수 집계
   - 100점 만점자 명예의 전당 카운트
   - 문항별 정답률 분석 그래프 (수업 난이도 파악에 용이)
   - 실시간 활동 타임라인 피드

5. **개인정보 보호 및 보안**
   - 학생 이름(`홍*동`) 및 이메일(`st***23@gmail.com`) 마스킹 처리
   - 엄격한 Cloud Firestore 보안 규칙(`firestore.rules`) 탑재

---

## 🚀 빠른 시작 가이드

### 1. 패키지 설치 및 로컬 서버 실행
```bash
# 개발 서버 실행 (기본 포트: 3000)
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하시면 즉시 웹앱을 확인하실 수 있습니다.

---

## ⚙️ Firebase 연동 설정 방법

실제 구글 로그인 및 본인의 Firebase Firestore 데이터베이스에 실시간으로 저장하려면 아래 단계를 진행해 주세요.

### 1단계: Firebase 콘솔에서 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com)에 접속하여 로그인합니다.
2. **[프로젝트 추가]**를 눌러 새 프로젝트(예: `smart-class-hub`)를 생성합니다.

### 2단계: 인증(Authentication) 활성화
1. 좌측 메뉴에서 **[빌드] > [Authentication]**을 클릭하고 **[시작하기]**를 누릅니다.
2. **[로그인 제공업체]** 탭에서:
   - **Google**: 사용 설정 클릭 후 지원 이메일 선택 후 저장
   - **이메일/비밀번호**: 사용 설정 체크 후 저장

### 3단계: Cloud Firestore 데이터베이스 생성
1. 좌측 메뉴에서 **[빌드] > [Firestore Database]**를 클릭하고 **[데이터베이스 만들기]**를 누릅니다.
2. 위치를 `asia-northeast3 (서울)`로 선택하고 **테스트 모드에서 시작**을 선택합니다.
3. 데이터베이스 규칙 탭에 프로젝트에 포함된 `firestore.rules` 내용을 복사하여 게시합니다.

### 4단계: 환경변수 설정 (`.env.local`)
1. Firebase 프로젝트 설정(좌측 상단 톱니바퀴) > **[일반]** 하단의 **'내 앱'**에서 웹( `</>` ) 아이콘을 클릭합니다.
2. 앱 닉네임을 입력하고 등록하면 나타나는 `firebaseConfig` 객체의 값들을 복사합니다.
3. 프로젝트 루트에 `.env.local` 파일을 만들고 아래와 같이 붙여넣습니다:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

4. 개발 서버를 재시작합니다:
```bash
npm run dev
```

---

## 📁 프로젝트 폴더 구조

```
smart_class/
├── public/                 # 정적 리소스
├── src/
│   ├── components/         # UI 컴포넌트
│   │   ├── AttendanceCard.jsx        # 출석 체크 및 출석자 명단
│   │   ├── AuthModal.jsx             # 구글/이메일 로그인 모달
│   │   ├── Dashboard.jsx             # 실시간 집계 대시보드
│   │   ├── FirebaseWarningBanner.jsx # 환경변수 설정 안내 배너
│   │   ├── Header.jsx                # 상단 헤더 & 사용자 프로필
│   │   └── QuizCard.jsx              # 3가지 미니 퀴즈 및 채점
│   ├── data/
│   │   └── quizData.js               # 퀴즈 3문항 데이터 및 정답/해설
│   ├── firebase/
│   │   └── config.js                 # Firebase Auth & Firestore 초기화
│   ├── utils/
│   │   └── privacy.js                # 개인정보 마스킹 및 날짜 유틸
│   ├── App.jsx                       # 메인 앱 컴포넌트
│   ├── index.css                     # Tailwind CSS 디렉티브
│   └── main.jsx                      # React 엔트리포인트
├── .env.example            # 환경변수 예시 파일
├── firestore.rules         # Cloud Firestore 보안 규칙 파일
├── package.json            # 의존성 및 스크립트 정의
├── tailwind.config.js      # Tailwind CSS 테마 설정
└── vite.config.js          # Vite 빌드 설정
```
