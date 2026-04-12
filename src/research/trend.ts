import type { TrendKeyword } from "../common/types.js";

/**
 * WI-008: 트렌드 키워드 수집기
 * YouTube 트렌딩, 검색량 기반 인기 주제를 구조화
 */
export function buildTrendKeyword(
  keyword: string,
  searchVolume: number,
  competition: "low" | "medium" | "high",
  trending: boolean,
): TrendKeyword {
  return { keyword, searchVolume, competition, trending };
}

/**
 * 트렌드 키워드를 검색량 기준으로 정렬
 */
export function sortByVolume(keywords: TrendKeyword[]): TrendKeyword[] {
  return [...keywords].sort((a, b) => b.searchVolume - a.searchVolume);
}

/**
 * 경쟁도 낮은 + 트렌딩 키워드 필터
 */
export function filterOpportunities(keywords: TrendKeyword[]): TrendKeyword[] {
  return keywords.filter(k => k.trending && k.competition !== "high");
}
