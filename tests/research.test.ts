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
import { extractJsonFromResponse, parseStoryPatterns, parseVisualPatterns, parseHookingPatterns, parseTrendKeywords, parseChannelBenchmarks } from "../src/research/parser.js";
import { buildResearchFromResponses } from "../src/research/pipeline.js";
import { channelCollectorPrompt, storyPatternPrompt, visualPatternPrompt, hookingPatternPrompt, trendKeywordPrompt } from "../src/research/prompts.js";
import { saveResearchReport } from "../src/research/pipeline.js";
import { mkdirSync, rmSync, existsSync } from "node:fs";

describe("리서치/분석 — 빌더", () => {
  it("StoryPattern 생성", () => {
    const p = buildStoryPattern("romance", "기승전결 4막", 600, 3, "채널A");
    expect(p.genre).toBe("romance");
    expect(p.avgDuration).toBe(600);
  });

  it("VisualPattern 생성", () => {
    const p = buildVisualPattern("romance", "anime", ["#FFB6C1"], "클로즈업", "얼굴 중앙");
    expect(p.style).toBe("anime");
    expect(p.colorPalette).toHaveLength(1);
  });

  it("HookingPattern 생성", () => {
    const p = buildHookingPattern("opening", "질문형", ["왜?"]);
    expect(p.type).toBe("opening");
  });

  it("ResearchReport 조립 + 검증 성공", () => {
    const success = assembleSuccessPatterns(
      [buildStoryPattern("romance", "4막", 600, 3, "src")],
      [buildVisualPattern("romance", "anime", ["#fff"], "wide", "face")],
      [buildHookingPattern("opening", "질문", ["왜?"])],
    );
    const trend = assembleTrendAnalysis(
      [buildTrendKeyword("로맨스", 10000, "low", true)],
      [buildChannelBenchmark("채널A", 50000, 100000, "주 2회", 4.5, ["영상1"])],
    );
    const report = assembleResearchReport(success, trend);
    expect(validateResearchReport(report)).toHaveLength(0);
  });

  it("빈 패턴 검증 시 에러 반환", () => {
    const report = assembleResearchReport(
      assembleSuccessPatterns([], [], []),
      assembleTrendAnalysis([], []),
    );
    expect(validateResearchReport(report).length).toBeGreaterThanOrEqual(3);
  });
});

describe("리서치/분석 — 트렌드", () => {
  it("검색량 정렬", () => {
    const k1 = buildTrendKeyword("a", 5000, "low", true);
    const k2 = buildTrendKeyword("b", 15000, "high", false);
    expect(sortByVolume([k1, k2])[0].keyword).toBe("b");
  });

  it("기회 키워드 필터 — low+trending 포함, high+trending 제외", () => {
    const keywords = [
      buildTrendKeyword("a", 5000, "low", true),
      buildTrendKeyword("b", 15000, "high", true),
      buildTrendKeyword("c", 8000, "medium", true),
      buildTrendKeyword("d", 3000, "low", false),
    ];
    const opps = filterOpportunities(keywords);
    expect(opps).toHaveLength(2);
    expect(opps.map(k => k.keyword)).toContain("a");
    expect(opps.map(k => k.keyword)).toContain("c");
  });
});

describe("리서치/분석 — LLM 응답 파싱", () => {
  it("코드블록에서 JSON 추출", () => {
    const response = `분석 결과입니다:
\`\`\`json
[{"genre": "romance", "structure": "4막", "avgDuration": 600, "episodeCount": 3, "source": "채널A"}]
\`\`\``;
    const extracted = extractJsonFromResponse(response);
    expect(extracted).toHaveLength(1);
    const patterns = parseStoryPatterns(extracted);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].genre).toBe("romance");
  });

  it("코드블록 없는 JSON 추출", () => {
    const response = `결과: [{"keyword": "로맨스", "searchVolume": 12000, "competition": "medium", "trending": true}]`;
    const extracted = extractJsonFromResponse(response);
    const keywords = parseTrendKeywords(extracted);
    expect(keywords).toHaveLength(1);
    expect(keywords[0].searchVolume).toBe(12000);
  });

  it("잘못된 JSON 무시", () => {
    const response = "이것은 JSON이 아닙니다. {broken: json}";
    const extracted = extractJsonFromResponse(response);
    expect(extracted).toHaveLength(0);
  });

  it("음수 값 방어", () => {
    const response = `[{"keyword": "test", "searchVolume": -100, "competition": "low", "trending": true}]`;
    const keywords = parseTrendKeywords(extractJsonFromResponse(response));
    expect(keywords[0].searchVolume).toBe(0);
  });

  it("빈 channelName 무시", () => {
    const response = `[{"channelName": "", "subscribers": 100}, {"channelName": "유효", "subscribers": 200}]`;
    const benchmarks = parseChannelBenchmarks(extractJsonFromResponse(response));
    expect(benchmarks).toHaveLength(1);
    expect(benchmarks[0].channelName).toBe("유효");
  });

  it("잘못된 competition 값 → medium fallback", () => {
    const response = `[{"keyword": "test", "searchVolume": 100, "competition": "invalid", "trending": false}]`;
    const keywords = parseTrendKeywords(extractJsonFromResponse(response));
    expect(keywords[0].competition).toBe("medium");
  });
});

describe("리서치/분석 — 파이프라인", () => {
  it("LLM 응답 → ResearchReport 조립", () => {
    const report = buildResearchFromResponses({
      genre: "romance",
      channelResponse: `[{"channelName": "드라마채널", "subscribers": 50000, "avgViews": 100000, "uploadFrequency": "주 2회", "engagementRate": 4.5, "topVideos": ["v1"]}]`,
      storyResponse: `[{"genre": "romance", "structure": "4막", "avgDuration": 600, "episodeCount": 3, "source": "채널A"}]`,
      visualResponse: `[{"genre": "romance", "style": "anime", "colorPalette": ["#FFB6C1"], "composition": "클로즈업", "thumbnailStyle": "얼굴"}]`,
      hookingResponse: `[{"type": "opening", "description": "질문형", "examples": ["왜?"]}]`,
      trendResponse: `[{"keyword": "로맨스", "searchVolume": 12000, "competition": "low", "trending": true}]`,
    });

    expect(report.successPatterns.story).toHaveLength(1);
    expect(report.successPatterns.visual).toHaveLength(1);
    expect(report.successPatterns.hooking).toHaveLength(1);
    expect(report.trendAnalysis.keywords).toHaveLength(1);
    expect(report.trendAnalysis.benchmarks).toHaveLength(1);
    expect(validateResearchReport(report)).toHaveLength(0);
  });
});

describe("리서치/분석 — 프롬프트 템플릿", () => {
  it("channelCollectorPrompt에 장르와 수량 포함", () => {
    const prompt = channelCollectorPrompt("romance", 10);
    expect(prompt).toContain("romance");
    expect(prompt).toContain("10");
    expect(prompt).toContain("JSON");
  });

  it("storyPatternPrompt에 장르 포함", () => {
    const prompt = storyPatternPrompt("thriller");
    expect(prompt).toContain("thriller");
    expect(prompt).toContain("3개 이상");
  });

  it("visualPatternPrompt에 장르 포함", () => {
    const prompt = visualPatternPrompt("romance");
    expect(prompt).toContain("romance");
    expect(prompt).toContain("화풍");
  });

  it("hookingPatternPrompt에 3가지 유형 포함", () => {
    const prompt = hookingPatternPrompt();
    expect(prompt).toContain("opening");
    expect(prompt).toContain("cliffhanger");
    expect(prompt).toContain("next-episode");
  });

  it("trendKeywordPrompt에 카테고리 포함", () => {
    const prompt = trendKeywordPrompt("웹드라마");
    expect(prompt).toContain("웹드라마");
    expect(prompt).toContain("검색량");
  });
});

describe("리서치/분석 — 파서 직접 테스트", () => {
  it("parseVisualPatterns 직접 파싱", () => {
    const data = [{ genre: "romance", style: "anime", colorPalette: ["#fff"], composition: "wide", thumbnailStyle: "face" }];
    const result = parseVisualPatterns(data as unknown[]);
    expect(result).toHaveLength(1);
    expect(result[0].style).toBe("anime");
  });

  it("parseHookingPatterns 직접 파싱", () => {
    const data = [{ type: "opening", description: "질문형", examples: ["왜?"] }];
    const result = parseHookingPatterns(data as unknown[]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("opening");
  });

  it("parseHookingPatterns — 잘못된 type 무시", () => {
    const data = [{ type: "invalid", description: "test", examples: [] }];
    const result = parseHookingPatterns(data as unknown[]);
    expect(result).toHaveLength(0);
  });

  it("파서 — 비객체 아이템 무시 (타입가드)", () => {
    const data = ["string", 123, null, true] as unknown[];
    expect(parseStoryPatterns(data)).toHaveLength(0);
    expect(parseVisualPatterns(data)).toHaveLength(0);
    expect(parseHookingPatterns(data)).toHaveLength(0);
    expect(parseTrendKeywords(data)).toHaveLength(0);
    expect(parseChannelBenchmarks(data)).toHaveLength(0);
  });
});

describe("리서치/분석 — 빌더 입력 검증", () => {
  it("buildStoryPattern — 음수 duration → 0", () => {
    const p = buildStoryPattern("genre", "struct", -100, -5, "src");
    expect(p.avgDuration).toBe(0);
    expect(p.episodeCount).toBe(1);
  });

  it("buildChannelBenchmark — 음수 subscribers → 0", () => {
    const b = buildChannelBenchmark("ch", -100, -200, "weekly", -3, []);
    expect(b.subscribers).toBe(0);
    expect(b.avgViews).toBe(0);
    expect(b.engagementRate).toBe(0);
  });
});

describe("리서치/분석 — saveResearchReport", () => {
  const tmpDir = "./projects/_test_save";

  it("리포트 파일 저장", () => {
    const success = assembleSuccessPatterns(
      [buildStoryPattern("r", "s", 600, 3, "x")],
      [buildVisualPattern("r", "anime", [], "w", "f")],
      [buildHookingPattern("opening", "q", ["a"])],
    );
    const trend = assembleTrendAnalysis(
      [buildTrendKeyword("k", 100, "low", true)],
      [buildChannelBenchmark("c", 100, 200, "w", 1, [])],
    );
    const report = assembleResearchReport(success, trend);

    const path = saveResearchReport(report, tmpDir);
    expect(existsSync(path)).toBe(true);
    rmSync(tmpDir, { recursive: true, force: true });
  });
});
