import { describe, it, expect } from "vitest";
import {
  calculateWeightedTotal,
  determineVerdict,
  buildEvalReport,
  formatReviewSummary,
  buildFeedbackMessage,
  loadEvalCriteria,
} from "../src/common/evaluator.js";
import type { EvalScores, ProductionSpec } from "../src/common/types.js";

const makeScores = (story: number, visual: number, voice: number, editing: number): EvalScores => ({
  storyStructure: { score: story, weight: 0.30, evidence: "test" },
  visualConsistency: { score: visual, weight: 0.25, evidence: "test" },
  voiceQuality: { score: voice, weight: 0.20, evidence: "test" },
  editingCompleteness: { score: editing, weight: 0.25, evidence: "test" },
});

describe("Evaluator 채점 기준", () => {
  it("eval-criteria.json 로드", () => {
    const criteria = loadEvalCriteria();
    expect(criteria.pass).toBe(10);
    expect(criteria.rework.maxRetries).toBe(10);
    expect(criteria.regenerate.below).toBe(5);
    expect(criteria.criteria).toHaveLength(4);
  });
});

describe("가중 합산", () => {
  it("만점 (10/10)", () => {
    const scores = makeScores(10, 10, 10, 10);
    expect(calculateWeightedTotal(scores)).toBe(10);
  });

  it("가중 합산 정확성", () => {
    const scores = makeScores(8, 7, 9, 6);
    // 8*0.3 + 7*0.25 + 9*0.2 + 6*0.25 = 2.4 + 1.75 + 1.8 + 1.5 = 7.45
    expect(calculateWeightedTotal(scores)).toBe(7.45);
  });

  it("0점", () => {
    const scores = makeScores(0, 0, 0, 0);
    expect(calculateWeightedTotal(scores)).toBe(0);
  });
});

describe("판정 로직", () => {
  const criteria = loadEvalCriteria();

  it("10점 → PASS", () => {
    expect(determineVerdict(10, 1, criteria)).toBe("PASS");
  });

  it("7점 → REWORK", () => {
    expect(determineVerdict(7, 1, criteria)).toBe("REWORK");
  });

  it("4점 → REGENERATE", () => {
    expect(determineVerdict(4, 1, criteria)).toBe("REGENERATE");
  });

  it("5점 → REWORK (경계값)", () => {
    expect(determineVerdict(5, 1, criteria)).toBe("REWORK");
  });

  it("9.9점 → REWORK", () => {
    expect(determineVerdict(9.9, 1, criteria)).toBe("REWORK");
  });

  it("10회 초과 → ESCALATE", () => {
    expect(determineVerdict(7, 10, criteria)).toBe("ESCALATE");
  });

  it("10회 미만 → REWORK", () => {
    expect(determineVerdict(7, 9, criteria)).toBe("REWORK");
  });
});

describe("EvalReport 생성", () => {
  it("PASS 리포트", () => {
    const report = buildEvalReport(
      "WI-010", "sprint-010.md", makeScores(10, 10, 10, 10),
      [], [], "완벽", 1,
    );
    expect(report.verdict).toBe("PASS");
    expect(report.weightedTotal).toBe(10);
  });

  it("REWORK 리포트", () => {
    const report = buildEvalReport(
      "WI-010", "sprint-010.md", makeScores(8, 7, 9, 6),
      ["하드코딩"], ["이미지 누락"], "이미지 재생성 필요", 2,
    );
    expect(report.verdict).toBe("REWORK");
    expect(report.issues).toContain("이미지 누락");
  });

  it("ESCALATE → REWORK + 메시지", () => {
    const report = buildEvalReport(
      "WI-010", "sprint-010.md", makeScores(8, 7, 9, 6),
      [], [], "수정 필요", 10,
    );
    expect(report.verdict).toBe("REWORK");
    expect(report.recommendation).toContain("사용자 판단 필요");
  });
});

describe("리뷰 프레젠터", () => {
  const mockSpec: ProductionSpec = {
    metadata: { title: "첫사랑", genre: "romance", format: "shorts", episodes: 1, targetDuration: 60 },
    characters: [{ id: "c1", name: "수아", voiceProfile: "f", voiceSample: null }],
    scenes: [{ id: "s1", duration: 10, description: "d", imagePrompt: "p", videoPrompt: "v",
      dialogues: [], narration: null, bgm: { prompt: "b", volume: 0.3, fadeIn: 1, fadeOut: 1 },
      transition: { type: "cut", duration: 0 }, subtitle: true }],
  };

  it("PASS 요약", () => {
    const report = buildEvalReport("WI-010", "s.md", makeScores(10, 10, 10, 10), [], [], "", 1);
    const summary = formatReviewSummary(mockSpec, report, "output/final.mp4");
    expect(summary).toContain("PASS");
    expect(summary).toContain("첫사랑");
    expect(summary).toContain("10/10");
  });

  it("REWORK 요약에 이슈 포함", () => {
    const report = buildEvalReport("WI-010", "s.md", makeScores(7, 7, 7, 7), [], ["문제1"], "수정필요", 3);
    const summary = formatReviewSummary(mockSpec, report, "output/final.mp4");
    expect(summary).toContain("REWORK");
    expect(summary).toContain("문제1");
    expect(summary).toContain("3/10회");
  });
});

describe("피드백 반영기", () => {
  it("이슈 + 안티패턴 + 사용자 피드백 포함", () => {
    const report = buildEvalReport("WI-010", "s.md", makeScores(7, 7, 7, 7),
      ["하드코딩"], ["이미지 누락"], "수정필요", 2);
    const msg = buildFeedbackMessage(report, "BGM 볼륨 올려줘");
    expect(msg).toContain("하드코딩");
    expect(msg).toContain("이미지 누락");
    expect(msg).toContain("BGM 볼륨 올려줘");
  });

  it("사용자 피드백 없을 때", () => {
    const report = buildEvalReport("WI-010", "s.md", makeScores(7, 7, 7, 7),
      [], ["문제"], "수정", 1);
    const msg = buildFeedbackMessage(report, null);
    expect(msg).not.toContain("사용자 피드백");
  });
});
