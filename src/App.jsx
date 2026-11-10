import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AttendanceCard from './components/AttendanceCard';
import QuizCard from './components/QuizCard';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import FirebaseWarningBanner from './components/FirebaseWarningBanner';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  isFirebaseConfigured 
} from './firebase/config';
import { getTodayDateString } from './utils/privacy';

/**
 * ==============================================================================
 * [스마트 클래스 메인 애플리케이션 컴포넌트]
 * ==============================================================================
 * 애플리케이션의 최상위 부모 컴포넌트로 다음 상태와 흐름을 총괄합니다:
 * 
 * 1. Firebase 인증 상태 구독 (onAuthStateChanged)
 * 2. 로그인 사용자 정보 및 데모(체험) 사용자 세션 관리
 * 3. 출석 체크, 미니 퀴즈, 실시간 대시보드 컴포넌트 통합
 * 4. 초보자용 데모 모드 (Firebase 설정 전에도 모든 UI 즉시 체험 가능)
 */
export default function App() {
  const todayStr = getTodayDateString();

  // 사용자 상태 (null: 미로그인)
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 초보자가 Firebase 설정 전에도 바로 둘러볼 수 있는 초기 데모 데이터셋
  const [demoAttendances, setDemoAttendances] = useState([
    {
      id: `demo_1_${todayStr}`,
      uid: 'demo_user_1',
      userName: '김민준 학생',
      userEmail: 'minjun.kim@school.edu',
      date: todayStr,
      timestamp: new Date(Date.now() - 1000 * 60 * 35) // 35분 전
    },
    {
      id: `demo_2_${todayStr}`,
      uid: 'demo_user_2',
      userName: '이서연 학생',
      userEmail: 'seoyeon.lee@school.edu',
      date: todayStr,
      timestamp: new Date(Date.now() - 1000 * 60 * 18) // 18분 전
    },
    {
      id: `demo_3_${todayStr}`,
      uid: 'demo_user_3',
      userName: '박지훈 학생',
      userEmail: 'jihoon.park@school.edu',
      date: todayStr,
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5분 전
    }
  ]);

  const [demoSubmissions, setDemoSubmissions] = useState([
    {
      uid: 'demo_user_1',
      userName: '김민준 학생',
      userEmail: 'minjun.kim@school.edu',
      answers: { q1: 'b', q2: 'a', q3: 'c' },
      score: 100,
      maxScore: 100,
      submittedAt: new Date(Date.now() - 1000 * 60 * 25)
    },
    {
      uid: 'demo_user_2',
      userName: '이서연 학생',
      userEmail: 'seoyeon.lee@school.edu',
      answers: { q1: 'b', q2: 'a', q3: 'a' },
      score: 65,
      maxScore: 100,
      submittedAt: new Date(Date.now() - 1000 * 60 * 12)
    }
  ]);

  // Firebase Auth 로그인 상태 감지
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '학생',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('로그아웃 오류:', error);
      }
    }
    setUser(null);
  };

  // 데모 계정 로그인 핸들러
  const handleDemoLogin = (demoUserData) => {
    setUser(demoUserData);
  };

  // 데모 출석 추가 핸들러
  const handleAddDemoAttendance = (record) => {
    setDemoAttendances((prev) => [record, ...prev]);
  };

  // 데모 퀴즈 제출 추가 핸들러
  const handleAddDemoSubmission = (submissionData) => {
    setDemoSubmissions((prev) => [
      submissionData,
      ...prev.filter((s) => s.uid !== submissionData.uid)
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* 1. Firebase 환경변수 미설정 시 나타나는 도움말 배너 */}
      {!isFirebaseConfigured && <FirebaseWarningBanner />}

      {/* 2. 상단 글로벌 네비게이션 헤더 */}
      <Header
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDemoMode={!isFirebaseConfigured}
      />

      {/* 3. 메인 콘텐츠 대시보드 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 상단 2열 그리드: 좌측 출석 체크 / 우측 미니 퀴즈 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* [카드 1] 오늘의 출석 체크 & 실시간 출석자 명단 */}
          <AttendanceCard
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            demoAttendances={demoAttendances}
            onAddDemoAttendance={handleAddDemoAttendance}
          />

          {/* [카드 2] 3문항 미니 퀴즈 코너 & 자동 채점 */}
          <QuizCard
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            demoSubmissions={demoSubmissions}
            onAddDemoSubmission={handleAddDemoSubmission}
          />

        </div>

        {/* 하단 전체 영역: 실시간 통합 대시보드 */}
        <Dashboard
          demoAttendances={demoAttendances}
          demoSubmissions={demoSubmissions}
        />

      </main>

      {/* 4. 하단 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            🏫 스마트 클래스 (Smart Class Hub) — 출석 체크 및 실시간 미니 퀴즈 플랫폼
          </p>
          <p className="text-[11px] text-slate-400">
            Powered by React, Tailwind CSS, Firebase Authentication & Cloud Firestore
          </p>
        </div>
      </footer>

      {/* 5. 로그인 및 회원가입 모달 팝업 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onDemoLogin={handleDemoLogin}
      />

    </div>
  );
}
