import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  isFirebaseConfigured
} from '../firebase/config';

/**
 * ==============================================================================
 * [인증 모달 컴포넌트]
 * ==============================================================================
 * 1. 구글 원클릭 로그인
 * 2. 이메일/비밀번호 로그인 및 회원가입
 * 3. 체험용 계정 빠른 로그인 (Firebase 미설정 시에도 테스트 가능)
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {function} props.onClose - 모달 닫기 콜백
 * @param {function} props.onDemoLogin - 데모 모드 로그인 콜백
 */
export default function AuthModal({ isOpen, onClose, onDemoLogin }) {
  // 모달 모드: 'login' (로그인) | 'signup' (회원가입)
  const [tab, setTab] = useState('login');
  
  // 입력 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // 상태 메시지 및 로딩
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Firebase 에러 코드를 친절한 한국어 메시지로 변환하는 함수
  const getKoreanErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '가입되지 않은 이메일 주소입니다. 회원가입을 먼저 진행해주세요.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일 주소입니다. 로그인해주세요.';
      case 'auth/weak-password':
        return '비밀번호는 최소 6자 이상이어야 안전합니다.';
      case 'auth/invalid-email':
        return '올바른 이메일 형식이 아닙니다. 확인 후 다시 입력해주세요.';
      case 'auth/popup-closed-by-user':
        return '구글 로그인 창이 닫혔습니다. 다시 시도해주세요.';
      default:
        return '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  };

  // 1. 구글 원클릭 로그인 실행
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    if (!isFirebaseConfigured) {
      onDemoLogin({
        uid: 'demo_google_user',
        displayName: '구글체험학생',
        email: 'google_student@example.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      });
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      setErrorMessage(getKoreanErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 이메일/비밀번호 로그인 및 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!isFirebaseConfigured) {
      onDemoLogin({
        uid: `demo_${Date.now()}`,
        displayName: displayName || (tab === 'login' ? '체험학생' : displayName || '새로운학생'),
        email: email,
        photoURL: null
      });
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      if (tab === 'signup') {
        // 회원가입 실행
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // 사용자 이름(displayName) 프로필 업데이트
        if (displayName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim()
          });
        }
      } else {
        // 기존 사용자 로그인 실행
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      console.error('이메일 인증 오류:', error);
      setErrorMessage(getKoreanErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 테스트용 빠른 로그인 핸들러
  const handleQuickDemoLogin = (role) => {
    if (role === 'studentA') {
      onDemoLogin({
        uid: 'student_kim_01',
        displayName: '김민준 학생',
        email: 'minjun.kim@school.edu',
        photoURL: null
      });
    } else {
      onDemoLogin({
        uid: 'student_lee_02',
        displayName: '이서연 학생',
        email: 'seoyeon.lee@school.edu',
        photoURL: null
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 모달 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 text-center">
          <div className="inline-flex p-2.5 rounded-xl bg-brand-50 text-brand-600 mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {tab === 'login' ? '스마트 클래스 로그인' : '학생 계정 만들기'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login' 
              ? '출석 체크와 퀴즈 풀이를 시작하려면 로그인해 주세요.' 
              : '새로운 학생 계정을 생성하고 학습에 참여하세요.'}
          </p>
        </div>

        {/* 탭 전환 (로그인 / 회원가입) */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              tab === 'login'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            기존 회원 로그인
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              tab === 'signup'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            새 계정 회원가입
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 구글 로그인 원클릭 버튼 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 hover:border-slate-400 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google 계정으로 계속하기</span>
          </button>

          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-[11px] text-slate-400 font-medium">또는 이메일로 계속</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* 에러 메시지 안내 */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 이메일 / 비밀번호 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학생 이름 (실명 또는 닉네임)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    required={tab === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                학교 또는 개인 이메일
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                비밀번호 (6자 이상)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span>{isLoading ? '처리 중...' : tab === 'login' ? '로그인하기' : '회원가입 완료'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 빠른 체험 로그인 도우미 (개발 및 테스트 편의용) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-medium text-slate-400 mb-2 text-center">
              💡 계정이 없으신가요? 빠른 테스트용 계정으로 둘러보기:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('studentA')}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
              >
                👤 김민준 학생
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('studentB')}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
              >
                👤 이서연 학생
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
