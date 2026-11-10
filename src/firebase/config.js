/**
 * ==============================================================================
 * [Firebase 초기화 및 설정 파일]
 * ==============================================================================
 * 이 파일은 웹 애플리케이션과 Firebase(Google의 백엔드 서비스)를 연결해주는 핵심 다리 역할을 합니다.
 * 
 * 1. Firebase Authentication: 구글 로그인 및 이메일/비밀번호 로그인을 담당합니다.
 * 2. Cloud Firestore: 학생들의 출석 정보와 퀴즈 제출 결과를 실시간으로 저장/동기화합니다.
 * 
 * 보안을 위해 실제 API 키는 .env.local 파일에서 안전하게 불러옵니다.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  where
} from 'firebase/firestore';

// Vite 환경변수에서 Firebase 설정값을 불러옵니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 필수 설정값이 비어있는지 확인하는 도우미 플래그
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_firebase_project_id_here'
);

// Firebase 앱을 중복 초기화하지 않도록 싱글톤 패턴 적용
let app;
if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} else {
  console.warn(
    '⚠️ [안내] Firebase 환경변수가 설정되지 않았습니다.\n' +
    '프로젝트 루트에 .env.local 파일을 만들고 Firebase 콘솔에서 발급받은 키를 입력해주세요.'
  );
  // 더미 앱 초기화 (빌드 오류 방지)
  app = getApps().length > 0 ? getApp() : initializeApp({
    apiKey: "demo-api-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:demo"
  });
}

// 인증(Auth) 및 데이터베이스(Firestore) 인스턴스 생성
export const auth = getAuth(app);
export const db = getFirestore(app);

// 구글 로그인 프로바이더 설정
export const googleProvider = new GoogleAuthProvider();
// 로그인 시 항상 계정 선택 창이 뜨도록 설정
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 외부 컴포넌트에서 편리하게 쓸 수 있도록 유틸 함수 재내보내기
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  where
};
