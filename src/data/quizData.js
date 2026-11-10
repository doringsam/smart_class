/**
 * ==============================================================================
 * [미니 퀴즈 데이터셋 (3문항)]
 * ==============================================================================
 * 학생들의 디지털 리터러시 및 웹 기초 지식을 재미있게 점검하는 3가지 문항입니다.
 * 문항당 점수와 선택지, 정답, 해설을 명확하게 정의해 두어 자동 채점이 가능합니다.
 */

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    title: '웹 브라우저의 마법사',
    question: '웹 브라우저에서 화면을 동적으로 움직이고 상호작용을 만들어내는 대표적인 프로그래밍 언어는 무엇일까요?',
    options: [
      { id: 'a', text: 'Python (파이썬)' },
      { id: 'b', text: 'JavaScript (자바스크립트)' },
      { id: 'c', text: 'C++ (씨플플)' },
      { id: 'd', text: 'Java (자바)' }
    ],
    correctAnswer: 'b',
    points: 30,
    explanation: 'JavaScript는 웹 브라우저 환경에서 동적인 웹 애플리케이션을 제작할 때 가장 핵심이 되는 언어입니다.'
  },
  {
    id: 'q2',
    number: 2,
    title: '클라우드와 데이터베이스',
    question: '구글이 제공하며, 별도의 서버 구축 없이 인증(Auth)과 실시간 데이터베이스(Firestore)를 쉽게 사용할 수 있는 BaaS(Backend-as-a-Service) 플랫폼은?',
    options: [
      { id: 'a', text: 'Firebase (파이어베이스)' },
      { id: 'b', text: 'Docker (도커)' },
      { id: 'c', text: 'Git (깃)' },
      { id: 'd', text: 'Kubernetes (쿠버네티스)' }
    ],
    correctAnswer: 'a',
    points: 35,
    explanation: 'Firebase는 개발자가 인프라 관리 부담 없이 빠르게 웹과 앱을 제작할 수 있도록 돕는 구글의 대표적인 클라우드 백엔드 플랫폼입니다.'
  },
  {
    id: 'q3',
    number: 3,
    title: '웹의 뼈대와 구조',
    question: '웹 문서의 구조와 내용을 정의하는 기본 마크업 언어(Markup Language)의 약칭은 무엇일까요?',
    options: [
      { id: 'a', text: 'CSS (Cascading Style Sheets)' },
      { id: 'b', text: 'SQL (Structured Query Language)' },
      { id: 'c', text: 'HTML (HyperText Markup Language)' },
      { id: 'd', text: 'JSON (JavaScript Object Notation)' }
    ],
    correctAnswer: 'c',
    points: 35,
    explanation: 'HTML은 웹 페이지의 제목, 문단, 이미지, 링크 등 구조적인 뼈대를 만드는 웹의 기초 마크업 언어입니다.'
  }
];

// 총점 계산 (30 + 35 + 35 = 100점)
export const TOTAL_QUIZ_POINTS = QUIZ_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
