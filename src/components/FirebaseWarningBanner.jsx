import React, { useState } from 'react';
import { AlertTriangle, Key, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

/**
 * ==============================================================================
 * [Firebase 설정 안내 배너 컴포넌트]
 * ==============================================================================
 * Firebase 환경변수(.env.local)가 아직 설정되지 않았을 때
 * 초보 사용자가 당황하지 않고 쉽게 설정을 마칠 수 있도록 가이드를 제공합니다.
 */
export default function FirebaseWarningBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=smart-class-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-class-xxxx
VITE_FIREBASE_STORAGE_BUCKET=smart-class-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950">Firebase 설정이 필요합니다 (체험 모드로 동작 중):</span>{' '}
            <span className="text-amber-800">
              실제 구글 로그인 및 실시간 DB 저장을 위해 <code>.env.local</code> 파일에 Firebase 인증키를 입력해주세요.
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-medium text-xs transition border border-amber-300 self-start md:self-auto"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{isOpen ? '설정 가이드 닫기' : '설정 방법 보기'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="max-w-6xl mx-auto mt-4 pt-3 border-t border-amber-200 text-xs text-amber-900 space-y-3">
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>
              <a 
                href="https://console.firebase.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="font-semibold underline text-amber-950 hover:text-amber-800"
              >
                Firebase 콘솔(console.firebase.google.com)
              </a>
              에 접속하여 새 프로젝트를 생성합니다.
            </li>
            <li>
              <strong>[빌드] - [Authentication]</strong>에서 <b>Google</b> 및 <b>이메일/비밀번호</b> 로그인 공급업체를 활성화합니다.
            </li>
            <li>
              <strong>[빌드] - [Firestore Database]</strong>를 생성(테스트 모드로 시작)합니다.
            </li>
            <li>
              프로젝트 설정(톱니바퀴)의 <b>'내 앱'</b>에서 웹 앱(<code>&lt;/&gt;</code>)을 추가하고 발급된 설정값을 복사합니다.
            </li>
            <li>
              프로젝트 루트 폴더에 <code>.env.local</code> 파일을 만들고 아래 양식대로 채워 넣은 뒤 개발 서버를 재시작합니다.
            </li>
          </ol>

          <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto shadow-inner">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-[10px] text-white transition"
              title="클립보드에 복사"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨!' : '양식 복사'}</span>
            </button>
            <pre>{envSample}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
