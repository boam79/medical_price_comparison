/**
 * 항목명 유사도 계산을 위한 유틸리티 함수
 */

/**
 * 레벤슈타인 거리 계산
 * 두 문자열의 편집 거리를 반환 (0 = 완전 일치, 값이 클수록 다름)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // 삭제
          dp[i][j - 1] + 1, // 삽입
          dp[i - 1][j - 1] + 1 // 치환
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 정규화된 유사도 점수 계산 (0~1 사이)
 * 1 = 완전 일치, 0 = 완전 다름
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * 단어 기반 유사도 계산 (코사인 유사도 개념)
 * 공통 단어 비율을 반환
 */
export function wordBasedSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 종합 유사도 점수 (레벤슈타인 + 단어 기반의 가중 평균)
 */
export function combinedSimilarity(
  str1: string,
  str2: string,
  levenshteinWeight: number = 0.4,
  wordWeight: number = 0.6
): number {
  const levSim = calculateSimilarity(str1, str2);
  const wordSim = wordBasedSimilarity(str1, str2);
  return levSim * levenshteinWeight + wordSim * wordWeight;
}

/**
 * 가장 유사한 항목 찾기
 */
export function findBestMatch(
  target: string,
  candidates: Array<{ name: string; [key: string]: any }>,
  threshold: number = 0.7
): { best: { name: string; [key: string]: any } | null; score: number } {
  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = combinedSimilarity(target, candidate.name);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return { best: bestMatch, score: bestScore };
}


