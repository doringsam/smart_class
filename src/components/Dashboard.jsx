import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Activity, 
  Award, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  db, 
  collection, 
  onSnapshot, 
  query, 
  where,
  isFirebaseConfigured 
} from '../firebase/config';
import { QUIZ_QUESTIONS, TOTAL_QUIZ_POINTS } from '../data/quizData';
import { 
  maskName, 
  maskEmail, 
  getTodayDateString, 
  formatTime 
} from '../utils/privacy';

/**
 * ==============================================================================
 * [실시간 스마트 클래스 대시보드 컴포넌트]
 * ==============================================================================
 * - 실시간 Firestore 연동을 통해 출석 현황과 퀴즈 제출 결과를 실시간 집계합니다.
 * - 주요 통계 (오늘 출석자 수, 퀴즈 제출자 수, 평균 점수, 만점자 수) 카드
 * - 문항별 정답률 분석 게이지 바 (교육자가 학습 난이도를 파악하기에 용이)
 * - 최근 참여 학생 타임라인 피드
 * 
 * @param {object} props
 * @param {Array} props.demoAttendances - 데모 모드 출석 목록
 * @param {Array} props.demoSubmissions - 데모 모드 퀴즈 제출 목록
 */
export default function Dashboard({ demoAttendances = [], demoSubmissions = [] }) {
  const todayStr = getTodayDateString();

  const [attendances, setAttendances] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Firestore 실시간 리스너 연결 또는 데모 데이터 연결
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAttendances(demoAttendances);
      setSubmissions(demoSubmissions);
      return;
    }

    // 1. 오늘의 출석 데이터 구독
    const attCol = collection(db, 'attendance');
    const attQuery = query(attCol, where('date', '==', todayStr));
    const unsubAtt = onSnapshot(attQuery, (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAttendances(list);
    }, (err) => console.error('대시보드 출석 구독 오류:', err));

    // 2. 퀴즈 제출 데이터 구독
    const subCol = collection(db, 'quiz_submissions');
    const unsubSub = onSnapshot(subCol, (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSubmissions(list);
    }, (err) => console.error('대시보드 퀴즈 구독 오류:', err));

    return () => {
      unsubAtt();
      unsubSub();
    };
  }, [todayStr, demoAttendances, demoSubmissions]);

  // 통계 계산
  const totalAttendanceCount = attendances.length;
  const totalSubmissionCount = submissions.length;

  const totalScoreSum = submissions.reduce((sum, item) => sum + (item.score || 0), 0);
  const averageScore = totalSubmissionCount > 0 
    ? Math.round(totalScoreSum / totalSubmissionCount) 
    : 0;

  const perfectScoreCount = submissions.filter((item) => item.score === TOTAL_QUIZ_POINTS).length;

  // 문항별 정답률 계산
  const questionStats = QUIZ_QUESTIONS.map((q) => {
    if (totalSubmissionCount === 0) {
      return { ...q, correctCount: 0, accuracyRate: 0 };
    }
    const correctCount = submissions.filter(
      (sub) => sub.answers?.[q.id] === q.correctAnswer
    ).length;
    const accuracyRate = Math.round((correctCount / totalSubmissionCount) * 100);
    return {
      ...q,
      correctCount,
      accuracyRate
    };
  });

  // 최근 활동 피드 결합 (출석 및 퀴즈 제출)
  const recentActivities = [
    ...attendances.map((a) => ({
      type: 'attendance',
      id: `att_${a.id}`,
      userName: a.userName,
      userEmail: a.userEmail,
      timestamp: a.timestamp,
      title: '출석 체크 완료'
    })),
    ...submissions.map((s) => ({
      type: 'quiz',
      id: `quiz_${s.uid}`,
      userName: s.userName,
      userEmail: s.userEmail,
      timestamp: s.submittedAt,
      title: `퀴즈 제출 (${s.score}점 획득)`
    }))
  ].sort((a, b) => {
    const timeA = a.timestamp?.seconds || (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
    const timeB = b.timestamp?.seconds || (b.timestamp instanceof Date ? b.timestamp.getTime() : 0);
    return timeB - timeA;
  }).slice(0, 8); // 최근 8건

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-6">
      
      {/* 대시보드 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                스마트 클래스 실시간 대시보드
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                실시간 동기화
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              학습 현황과 퀴즈 결과가 실시간으로 집계되고 분석됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 4가지 핵심 통계 카드 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. 오늘 출석 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100/80">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>오늘 출석 학생</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalAttendanceCount} <span className="text-xs font-medium text-slate-500">명</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            오늘 실시간 출석 완료
          </div>
        </div>

        {/* 2. 퀴즈 제출 학생 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50/40 border border-brand-100/80">
          <div className="flex items-center justify-between text-brand-700 text-xs font-semibold">
            <span>퀴즈 제출 학생</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalSubmissionCount} <span className="text-xs font-medium text-slate-500">명</span>
          </div>
          <div className="text-[11px] text-brand-600 mt-1 font-medium">
            전체 3문항 응시 완료
          </div>
        </div>

        {/* 3. 퀴즈 평균 점수 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50/40 border border-amber-100/80">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>퀴즈 평균 점수</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {averageScore} <span className="text-xs font-medium text-slate-500">/ 100점</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            전체 응시자 평균 점수
          </div>
        </div>

        {/* 4. 100점 만점자 수 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50/40 border border-purple-100/80">
          <div className="flex items-center justify-between text-purple-700 text-xs font-semibold">
            <span>100점 만점자</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {perfectScoreCount} <span className="text-xs font-medium text-slate-500">명</span>
          </div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">
            명예의 전당 달성자
          </div>
        </div>

      </div>

      {/* 하단 2분할 섹션: 문항별 정답률 분석 & 최근 실시간 활동 피드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        
        {/* 좌측: 문항별 정답률 차트 */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>문항별 정답률 분석</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (총 {totalSubmissionCount}명 응시)
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {questionStats.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                    {q.number}. {q.title}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {q.accuracyRate}% ({q.correctCount}명)
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      q.accuracyRate >= 80 
                        ? 'bg-emerald-500' 
                        : q.accuracyRate >= 50 
                        ? 'bg-brand-500' 
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${q.accuracyRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            💡 정답률이 50% 미만인 문항은 수업 시간에 추가 보충 설명을 권장합니다.
          </p>
        </div>

        {/* 우측: 최근 실시간 활동 피드 */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-600" />
              <span>실시간 활동 피드</span>
            </h3>
            <span className="text-[10px] text-slate-400">최근 8건</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                아직 기록된 활동이 없습니다.<br />출석 체크 또는 퀴즈에 참여해 보세요!
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 bg-white rounded-lg border border-slate-200/70 text-xs flex items-center justify-between gap-2 shadow-2xs hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      act.type === 'attendance'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-brand-100 text-brand-700'
                    }`}>
                      {act.type === 'attendance' ? '출' : '퀴'}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-semibold text-slate-800 truncate">
                        {maskName(act.userName)} ({maskEmail(act.userEmail)})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {act.title}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {formatTime(act.timestamp) || '방금 전'}
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
