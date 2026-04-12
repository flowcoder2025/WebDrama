import { describe, it, expect } from "vitest";
import {
  buildStoryPattern,
  buildVisualPattern,
  buildHookingPattern,
  buildChannelBenchmark,
  assembleSuccessPatterns,
  assembleTrendAnalysis,
  assembleResearchReport,
  validateResearchReport,
} from "../src/research/analyzer.js";
import { buildTrendKeyword, sortByVolume, filterOpportunities } from "../src/research/trend.js";

describe("리서치/분석 모듈", () => {
  const storyPattern = buildStoryPattern("romance", "기승전결 4막", 600, 3, "채널A 상위 영상");
  const visualPattern = buildVisualPattern("romance", "anime", ["#FFB6C1", "#87CEEB"], "클로즈업 중심", "캐릭터 얼굴 중앙");
  const hookingPattern = buildHookingPattern("opening", "질문형 오프닝", ["왜 그랬을까?", "그날 이후..."]);
  const keyword = buildTrendKeyword("고등학교 로맨스", 12000, "medium", true);
  const benchmark = buildChannelBenchmark("드라마채널", 50000, 100000, "주 2회", 4.5, ["인기영상1"]);

  it("StoryPattern 생성", () => {
    expect(storyPattern.genre).toBe("romance");
    expect(storyPattern.avgDuration).toBe(600);
  });

  it("VisualPattern 생성", () => {
    expect(visualPattern.style).toBe("anime");
    expect(visualPattern.colorPalette).toHaveLength(2);
  });

  it("HookingPattern 생성", () => {
    expect(hookingPattern.type).toBe("opening");
    expect(hookingPattern.examples).toHaveLength(2);
  });

  it("ResearchReport 조립 및 검증", () => {
    const success = assembleSuccessPatterns([storyPattern], [visualPattern], [hookingPattern]);
    const trend = assembleTrendAnalysis([keyword], [benchmark]);
    const report = assembleResearchReport(success, trend);

    expect(report.generatedAt).toBeTruthy();
    expect(validateResearchReport(report)).toHaveLength(0);
  });

  it("빈 패턴 검증 시 에러 반환", () => {
    const success = assembleSuccessPatterns([], [], []);
    const trend = assembleTrendAnalysis([], []);
    const report = assembleResearchReport(success, trend);

    const errors = validateResearchReport(report);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it("트렌드 키워드 정렬", () => {
    const k1 = buildTrendKeyword("a", 5000, "low", true);
    const k2 = buildTrendKeyword("b", 15000, "high", false);
    const sorted = sortByVolume([k1, k2]);
    expect(sorted[0].keyword).toBe("b");
  });

  it("기회 키워드 필터", () => {
    const k1 = buildTrendKeyword("a", 5000, "low", true);
    const k2 = buildTrendKeyword("b", 15000, "high", true);
    const k3 = buildTrendKeyword("c", 8000, "medium", false);
    const opps = filterOpportunities([k1, k2, k3]);
    expect(opps).toHaveLength(1);
    expect(opps[0].keyword).toBe("a");
  });
});
