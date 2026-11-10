/**
 * ==============================================================================
 * [보안 및 개인정보 보호 유틸리티 함수]
 * ==============================================================================
 * 학생들의 개인정보(이메일, 이름)를 화면이나 공용 대시보드에 노출할 때
 * 안전하게 보호하기 위한 마스킹(Masking) 및 날짜 변환 함수들입니다.
 */

/**
 * 이메일 주소를 안전하게 마스킹합니다.
 * 예: "student123@gmail.com" -> "st***23@gmail.com"
 * @param {string} email 
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '익명';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

/**
 * 학생 이름을 마스킹하여 사생활을 보호합니다.
 * 예: "홍길동" -> "홍*동", "김철수민" -> "김**민", "John Doe" -> "J*** D***"
 * @param {string} name 
 * @returns {string}
 */
export function maskName(name) {
  if (!name || typeof name !== 'string') return '학생';

  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return `${trimmed[0]}*`;

  // 3글자 이상인 경우 중간 글자를 *로 대체
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  const middle = '*'.repeat(trimmed.length - 2);
  return `${first}${middle}${last}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 * (출석 체크 문서 ID 및 필터링의 기준이 됩니다)
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 한국어 요일을 포함한 읽기 쉬운 오늘 날짜를 반환합니다.
 * 예: "2026년 11월 10일 화요일"
 * @returns {string}
 */
export function getFormattedToday() {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
}

/**
 * 타임스탬프를 읽기 쉬운 시간(오전/오후 HH:MM)으로 변환합니다.
 * @param {any} timestamp - Firestore 타임스탬프 또는 Date 객체
 * @returns {string}
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';

  let date;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
