import React from 'react';
import { 
  GraduationCap, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { maskEmail, getFormattedToday } from '../utils/privacy';

/**
 * ==============================================================================
 * [헤더 컴포넌트]
 * ==============================================================================
 * 상단 브랜딩, 오늘 날짜, 그리고 사용자의 로그인/로그아웃 상태를 관리하고 보여줍니다.
 * 
 * @param {object} props
 * @param {object|null} props.user - 현재 로그인한 사용자 객체
 * @param {function} props.onOpenAuthModal - 로그인 모달 열기 함수
 * @param {function} props.onLogout - 로그아웃 실행 함수
 * @param {boolean} props.isDemoMode - 데모(체험) 모드 여부
 */
export default function Header({ user, onOpenAuthModal, onLogout, isDemoMode }) {
  const todayFormatted = getFormattedToday();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 좌측: 로고 및 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                스마트 클래스
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                허브 v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              실시간 출석 & 미니 퀴즈 대시보드
            </p>
          </div>
        </div>

        {/* 중앙: 오늘 날짜 표시 (태블릿 이상 화면) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          <span>{todayFormatted}</span>
        </div>

        {/* 우측: 인증 및 프로필 영역 */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* 사용자 아바타 및 이름 */}
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full pl-1.5 pr-3 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || '사용자'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/20">
                    {user.displayName ? user.displayName[0] : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-none">
                    {user.displayName || '학생'}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {maskEmail(user.email)}
                  </div>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm shadow-brand-500/30 transition transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인 / 회원가입</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
