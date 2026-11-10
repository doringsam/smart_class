import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  Send,
  LogIn
} from 'lucide-react';
import { QUIZ_QUESTIONS, TOTAL_QUIZ_POINTS } from '../data/quizData';
import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp, 
  isFirebaseConfigured 
} from '../firebase/config';

/**
 * ==============================================================================
 * [미니 퀴즈 카드 컴포넌트 (3문항)]
 * ==============================================================================
 * - 3가지 필수 퀴즈 문항 제시 및 선택형 답안 제출
 * - 즉시 자동 채점 및 점수 계산 (100점 만점)
 * - 이미 제출한 사용자는 점수 및 오답 노트/해설 실시간 확인
 * - 제출 결과는 Firestore의 quiz_submissions 컬렉션에 실시간 저장
 * 
 * @param {object} props
 * @param {object|null} props.user - 로그인한 사용자 객체
 * @param {function} props.onOpenAuthModal - 로그인 모달 열기 함수
 * @param {Array} props.demoSubmissions - 데모 모드 제출 목록
 * @param {function} props.onAddDemoSubmission - 데모 모드 제출 추가 함수
 */
export default function QuizCard({ 
  user, 
  onOpenAuthModal, 
  demoSubmissions = [], 
  onAddDemoSubmission 
}) {
  // 선택한 답안 상태 { q1: 'b', q2: 'a', ... }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // 제출 완료 상태 및 제출 데이터
  const [submission, setSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 현재 보고 있는 문제 번호 (0, 1, 2)

  // 사용자의 기존 제출 기록 불러오기 (Firestore 또는 데모)
  useEffect(() => {
    if (!user) {
      setSubmission(null);
      setSelectedAnswers({});
      return;
    }

    if (!isFirebaseConfigured) {
      const found = demoSubmissions.find((s) => s.uid === user.uid);
      if (found) {
        setSubmission(found);
      } else {
        setSubmission(null);
      }
      return;
    }

    // Firestore 실시간 리스너 연결
    const submissionRef = doc(db, 'quiz_submissions', user.uid);
    const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubmission(docSnap.data());
      } else {
        setSubmission(null);
      }
    }, (error) => {
      console.error('퀴즈 제출 기록 조회 오류:', error);
    });

    return () => unsubscribe();
  }, [user, demoSubmissions]);

  // 답안 선택 핸들러
  const handleSelectAnswer = (questionId, optionId) => {
    if (submission) return; // 이미 제출된 경우 수정 불가
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // 모든 문제에 답변했는지 확인
  const isAllAnswered = QUIZ_QUESTIONS.every((q) => selectedAnswers[q.id]);

  // 퀴즈 제출 및 자동 채점
  const handleSubmitQuiz = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    if (!isAllAnswered || isSubmitting) return;

    setIsSubmitting(true);

    // 자동 채점 로직
    let calculatedScore = 0;
    const detailedResults = {};

    QUIZ_QUESTIONS.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) {
        calculatedScore += q.points;
      }
      detailedResults[q.id] = {
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: isCorrect ? q.points : 0
      };
    });

    // 만점(100점) 또는 70점 이상일 때 축하 효과 발사!
    if (calculatedScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }

    const submissionData = {
      uid: user.uid,
      userName: user.displayName || '학생',
      userEmail: user.email,
      answers: selectedAnswers,
      score: calculatedScore,
      maxScore: TOTAL_QUIZ_POINTS,
      results: detailedResults,
      submittedAt: new Date()
    };

    if (!isFirebaseConfigured) {
      // 데모 모드 반영
      onAddDemoSubmission(submissionData);
      setSubmission(submissionData);
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionRef = doc(db, 'quiz_submissions', user.uid);
      await setDoc(submissionRef, {
        ...submissionData,
        submittedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('퀴즈 제출 저장 오류:', error);
      alert('퀴즈 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 현재 활성화된 문제 객체
  const currentQ = QUIZ_QUESTIONS[activeTab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* 카드 상단 배너 */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-brand-600/10 via-indigo-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                스마트 미니 퀴즈 (3문항)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                오늘의 핵심 개념을 퀴즈로 재미있게 확인해 보세요!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold border border-brand-200">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>총 {TOTAL_QUIZ_POINTS}점 만점</span>
          </div>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        {/* 상태 1: 이미 제출을 완료한 경우 (결과 및 해설 화면) */}
        {submission ? (
          <div className="space-y-4 animate-fade-in">
            {/* 점수 요약 배너 */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-700">퀴즈 응시 완료</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {submission.score} <span className="text-sm font-semibold text-slate-500">/ {TOTAL_QUIZ_POINTS}점</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {submission.score === 100 
                    ? '🎉 대단해요! 모든 문제를 완벽하게 맞추셨습니다!' 
                    : submission.score >= 60 
                    ? '👍 훌륭합니다! 조금만 더 복습하면 만점도 가능해요!' 
                    : '💪 힘내세요! 정답 해설을 꼼꼼히 확인해 보세요.'}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-brand-200 text-brand-600">
                <Award className="w-8 h-8" />
              </div>
            </div>

            {/* 문항별 정답 및 해설 펼치기 */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-700">문항별 채점 결과 및 해설</h4>
              {QUIZ_QUESTIONS.map((q) => {
                const userAns = submission.answers?.[q.id];
                const isCorrect = userAns === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                      isCorrect 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        <span>{q.number}. {q.question}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? `+${q.points}점` : '0점'}
                      </span>
                    </div>

                    <div className="pl-5 space-y-1 text-[11px]">
                      <div className="text-slate-600">
                        내가 고른 답: <span className="font-semibold text-slate-800">
                          {q.options.find(opt => opt.id === userAns)?.text || '미선택'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="text-emerald-700 font-semibold">
                          정답: {q.options.find(opt => opt.id === q.correctAnswer)?.text}
                        </div>
                      )}
                      <div className="p-2 rounded-lg bg-white/70 border border-slate-200/60 text-slate-600 mt-1">
                        💡 <strong>해설:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 상태 2: 아직 제출하지 않은 경우 (문제 풀이 화면) */
          <div className="space-y-4">
            {/* 3문제 인덱스 탭 */}
            <div className="flex items-center gap-2">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isCurrent = activeTab === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveTab(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                      isCurrent
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : isAnswered
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>문제 {q.number}</span>
                    {isAnswered && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-brand-600'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 현재 문제 카드 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-brand-600">
                  {currentQ.number}번 문항 ({currentQ.title})
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  배점 {currentQ.points}점
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </div>

              {/* 4지선다 옵션 리스트 */}
              <div className="space-y-2 pt-1">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                      className={`w-full p-3 rounded-xl text-xs text-left font-medium transition flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-brand-50 text-brand-900 border-brand-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-300 text-slate-500 bg-slate-50'
                      }`}>
                        {opt.id.toUpperCase()}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 하단 네비게이션 및 제출 버튼 */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                응답 진행도:{' '}
                <strong className="text-brand-600">
                  {Object.keys(selectedAnswers).length} / {QUIZ_QUESTIONS.length}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                {activeTab < QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>다음 문제</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  user ? (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={!isAllAnswered || isSubmitting}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? '제출 및 채점 중...' : '퀴즈 최종 제출하기'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>로그인 후 제출</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
