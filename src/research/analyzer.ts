import type {
  ResearchReport,
  SuccessPatterns,
  StoryPattern,
  VisualPattern,
  HookingPattern,
  TrendAnalysis,
  TrendKeyword,
  ChannelBenchmark,
} from "../common/types.js";

/**
 * WI-004: YouTube 웹드라마 채널 수집기
 * 장르별 인기 채널/영상 목록을 구조화된 형태로 반환
 */
export function buildChannelBenchmark(
  channelName: string,
  subscribers: number,
  avgViews: number,
  uploadFrequency: string,
  engagementRate: number,
  topVideos: string[],
): ChannelBenchmark {
  return { channelName, subscribers, avgViews, uploadFrequency, engagementRate, topVideos };
}

/**
 * WI-005: 스토리 구조 분석기
 * 성공작의 스토리 패턴을 구조화
 */
export function buildStoryPattern(
  genre: string,
  structure: string,
  avgDuration: number,
  episodeCount: number,
  source: string,
): StoryPattern {
  return { genre, structure, avgDuration, episodeCount, source };
}

/**
 * WI-006: 비주얼 스타일 분석기
 * 성공작의 비주얼 패턴을 구조화
 */
export function buildVisualPattern(
  genre: string,
  style: string,
  colorPalette: string[],
  composition: string,
  thumbnailStyle: string,
): VisualPattern {
  return { genre, style, colorPalette, composition, thumbnailStyle };
}

/**
 * WI-007: 후킹 패턴 분석기
 * 오프닝/클리프행어/다음화 유도 패턴 구조화
 */
export function buildHookingPattern(
  type: "opening" | "cliffhanger" | "next-episode",
  description: string,
  examples: string[],
): HookingPattern {
  return { type, description, examples };
}

/**
 * 성공작 분석 결과를 SuccessPatterns로 조립
 */
export function assembleSuccessPatterns(
  story: StoryPattern[],
  visual: VisualPattern[],
  hooking: HookingPattern[],
): SuccessPatterns {
  return { story, visual, hooking };
}

/**
 * WI-009: 채널 벤치마킹 리포터
 * 트렌드 분석 결과를 TrendAnalysis로 조립
 */
export function assembleTrendAnalysis(
  keywords: TrendKeyword[],
  benchmarks: ChannelBenchmark[],
): TrendAnalysis {
  return { keywords, benchmarks };
}

/**
 * 최종 ResearchReport 조립
 */
export function assembleResearchReport(
  successPatterns: SuccessPatterns,
  trendAnalysis: TrendAnalysis,
): ResearchReport {
  return {
    successPatterns,
    trendAnalysis,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * ResearchReport 유효성 검증
 */
export function validateResearchReport(report: ResearchReport): string[] {
  const errors: string[] = [];

  if (report.successPatterns.story.length === 0) {
    errors.push("스토리 패턴이 비어있음");
  }
  if (report.successPatterns.visual.length === 0) {
    errors.push("비주얼 패턴이 비어있음");
  }
  if (report.successPatterns.hooking.length === 0) {
    errors.push("후킹 패턴이 비어있음");
  }
  if (report.trendAnalysis.keywords.length === 0) {
    errors.push("트렌드 키워드가 비어있음");
  }

  return errors;
}
