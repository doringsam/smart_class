import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  CalendarCheck, 
  Sparkles,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  isFirebaseConfigured 
} from '../firebase/config';
import { 
  maskName, 
  maskEmail, 
  getTodayDateString, 
  getFormattedToday, 
  formatTime 
} from '../utils/privacy';

/**
 * ==============================================================================
 * [출석 체크 카드 컴포넌트]
 * ==============================================================================
 * - 오늘 날짜 기준 1인 1회 출석 체크 기능
 * - 출석 완료 시 화려한 폭죽 애니메이션(confetti) 발사
 * - 실시간 Firestore 연동으로 오늘 출석한 학생 명단 실시간 표시
 * 
 * @param {object} props
 * @param {object|null} props.user - 현재 로그인한 사용자 객체
 * @param {function} props.onOpenAuthModal - 로그인 모달 열기 함수
 * @param {Array} props.demoAttendances - 데모 모드 시 공유 출석 목록
 * @param {function} props.onAddDemoAttendance - 데모 모드 출석 추가 함수
 */
export default function AttendanceCard({ 
  user, 
  onOpenAuthModal, 
  demoAttendances = [], 
  onAddDemoAttendance 
}) {
  const todayStr = getTodayDateString();
  const [isCheckedToday, setIsCheckedToday] = useState(false);
  const [myAttendanceTime, setMyAttendanceTime] = useState(null);
  const [todayAttendances, setTodayAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 폭죽 축하 효과 발사 함수
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // 실시간 출석 목록 수신 (Firestore 또는 데모 모드)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // 데모 모드일 때: 전달받은 데모 출석 목록 사용
      setTodayAttendances(demoAttendances);
      if (user) {
        const found = demoAttendances.find(
          (item) => item.uid === user.uid && item.date === todayStr
        );
        if (found) {
          setIsCheckedToday(true);
          setMyAttendanceTime(found.timestamp);
        } else {
          setIsCheckedToday(false);
          setMyAttendanceTime(null);
        }
      }
      return;
    }

    // Firestore 실시간 리스너 연결
    const attendanceCol = collection(db, 'attendance');
    const q = query(attendanceCol, where('date', '==', todayStr));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = [];
      let userChecked = false;
      let userTime = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          ...data
        });

        // 현재 로그인 사용자의 출석 여부 확인
        if (user && data.uid === user.uid) {
          userChecked = true;
          userTime = data.timestamp;
        }
      });

      // 최신 출석순 정렬
      records.sort((a, b) => {
        const timeA = a.timestamp?.seconds || (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
        const timeB = b.timestamp?.seconds || (b.timestamp instanceof Date ? b.timestamp.getTime() : 0);
        return timeB - timeA;
      });

      setTodayAttendances(records);
      setIsCheckedToday(userChecked);
      setMyAttendanceTime(userTime);
    }, (error) => {
      console.error('출석 데이터 구독 오류:', error);
    });

    return () => unsubscribe();
  }, [user, todayStr, demoAttendances]);

  // 출석 체크 버튼 클릭 핸들러
  const handleCheckIn = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    if (isCheckedToday) return;

    setIsLoading(true);
    triggerConfetti();

    if (!isFirebaseConfigured) {
      // 데모 모드 로컬 반영
      const newRecord = {
        id: `${user.uid}_${todayStr}`,
        uid: user.uid,
        userName: user.displayName || '체험학생',
        userEmail: user.email,
        date: todayStr,
        timestamp: new Date()
      };
      onAddDemoAttendance(newRecord);
      setIsCheckedToday(true);
      setMyAttendanceTime(new Date());
      setIsLoading(false);
      return;
    }

    try {
      // 중복 방지를 위해 docId를 uid_날짜 조합으로 설정
      const docId = `${user.uid}_${todayStr}`;
      const docRef = doc(db, 'attendance', docId);

      await setDoc(docRef, {
        uid: user.uid,
        userName: user.displayName || '학생',
        userEmail: user.email,
        date: todayStr,
        timestamp: serverTimestamp()
      });

      setIsCheckedToday(true);
    } catch (error) {
      console.error('출석 체크 저장 오류:', error);
      alert('출석 체크 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* 카드 상단 배너 */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                오늘의 출석 체크
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                매일 한 번 출석하고 출석 도장을 받으세요!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>오늘 출석: {todayAttendances.length}명</span>
          </div>
        </div>
      </div>

      {/* 출석 버튼 및 상태 영역 */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
          {isCheckedToday ? (
            <div className="space-y-2 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-emerald-700">
                오늘 출석 완료! 🎉
              </div>
              <p className="text-xs text-slate-500">
                {user?.displayName || '학생'}님, 오늘도 힘찬 하루 보내세요!
              </p>
              {myAttendanceTime && (
                <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>출석 시간: {formatTime(myAttendanceTime) || '방금 전'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 font-medium">
                {user ? (
                  <span>
                    <strong>{user.displayName || '학생'}</strong>님, 오늘 아직 출석하지 않으셨습니다.
                  </span>
                ) : (
                  <span className="text-slate-500">
                    로그인하시면 오늘의 출석 체크를 진행할 수 있습니다.
                  </span>
                )}
              </div>

              {user ? (
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? '출석 처리 중...' : '지금 출석 체크하기'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인하고 출석 체크하기</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 실시간 출석자 목록 */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>실시간 출석자 현황</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">최신순</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {todayAttendances.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                아직 오늘의 첫 출석자가 없습니다.<br />가장 먼저 출석해 보세요! 🏃
              </div>
            ) : (
              todayAttendances.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                      {item.userName ? item.userName[0] : '학'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {maskName(item.userName)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {maskEmail(item.userEmail)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{formatTime(item.timestamp) || '오늘'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
