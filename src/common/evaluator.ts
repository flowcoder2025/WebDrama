import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { EvalReport, EvalScores, EvalScore, ProductionSpec } from "./types.js";
import { log } from "./logger.js";

/**
 * WI-037: Evaluator 채점 기준 설정
 * templates/eval-criteria.json 기반 채점 구조 + 판정 로직
 */

interface EvalCriteria {
  criteria: Array<{ name: string; weight: number; description: string }>;
  pass: number;
  rework: { min: number; max: number; maxRetries: number };
  regenerate: { below: number };
}

export function loadEvalCriteria(): EvalCriteria {
  const raw = readFileSync(resolve("templates/eval-criteria.json"), "utf-8");
  return JSON.parse(raw) as EvalCriteria;
}

/**
 * 가중 합산 점수 계산
 */
export function calculateWeightedTotal(scores: EvalScores): number {
  const items: EvalScore[] = [
    scores.storyStructure,
    scores.visualConsistency,
    scores.voiceQuality,
    scores.editingCompleteness,
  ];

  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    log("warn", `가중치 합계가 1.0이 아님: ${weightSum}`);
  }

  const total = items.reduce((sum, item) => {
    const clampedScore = Math.max(0, Math.min(10, item.score));
    return sum + clampedScore * item.weight;
  }, 0);
  return Math.round(total * 100) / 100;
}

/**
 * WI-038: 재작업 흐름 판정
 */
export function determineVerdict(
  weightedTotal: number,
  attempt: number,
  criteria: EvalCriteria,
): "PASS" | "REWORK" | "REGENERATE" | "ESCALATE" {
  if (weightedTotal >= criteria.pass) return "PASS";
  if (weightedTotal < criteria.regenerate.below) return "REGENERATE";
  if (attempt >= criteria.rework.maxRetries) return "ESCALATE";
  return "REWORK";
}

/**
 * EvalReport 생성
 */
export function buildEvalReport(
  wi: string,
  sprintContract: string,
  scores: EvalScores,
  antiPatterns: string[],
  issues: string[],
  recommendation: string,
  attempt: number,
): EvalReport {
  const criteria = loadEvalCriteria();
  const weightedTotal = calculateWeightedTotal(scores);
  const verdict = determineVerdict(weightedTotal, attempt, criteria);

  if (verdict === "ESCALATE") {
    log("warn", `WI ${wi}: ${attempt}회 재작업 초과 — 사용자 에스컬레이션`);
  }

  return {
    wi,
    sprintContract,
    scores,
    weightedTotal,
    verdict,
    antiPatterns,
    issues,
    recommendation: verdict === "ESCALATE"
      ? `${recommendation} [${attempt}회 초과 — 사용자 판단 필요]`
      : recommendation,
    attempt,
    maxAttempts: criteria.rework.maxRetries,
  };
}

/**
 * WI-039: 리뷰 프레젠터
 * 사용자에게 결과물을 요약하여 제시
 */
export function formatReviewSummary(
  spec: ProductionSpec,
  report: EvalReport,
  outputPath: string,
): string {
  const lines: string[] = [
    `## 검수 결과: ${report.verdict}`,
    "",
    `**제목**: ${spec.metadata.title}`,
    `**형식**: ${spec.metadata.format} (${spec.scenes.length}장면)`,
    `**출력**: ${outputPath}`,
    "",
    `### 채점 (${report.weightedTotal}/10)`,
    `- 스토리 구조: ${report.scores.storyStructure.score}/10 (${(report.scores.storyStructure.weight * 100).toFixed(0)}%)`,
    `- 비주얼 일관성: ${report.scores.visualConsistency.score}/10 (${(report.scores.visualConsistency.weight * 100).toFixed(0)}%)`,
    `- 음성 품질: ${report.scores.voiceQuality.score}/10 (${(report.scores.voiceQuality.weight * 100).toFixed(0)}%)`,
    `- 편집 완성도: ${report.scores.editingCompleteness.score}/10 (${(report.scores.editingCompleteness.weight * 100).toFixed(0)}%)`,
  ];

  if (report.issues.length > 0) {
    lines.push("", "### 이슈");
    for (const issue of report.issues) {
      lines.push(`- ${issue}`);
    }
  }

  if (report.verdict !== "PASS") {
    lines.push("", `### 재작업 (${report.attempt}/${report.maxAttempts}회)`);
    lines.push(report.recommendation);
  }

  return lines.join("\n");
}

/**
 * WI-040: 피드백 반영기
 * 사용자 피드백을 구조화하여 creative 팀에 전달할 메시지 생성
 */
export function buildFeedbackMessage(
  report: EvalReport,
  userFeedback: string | null,
): string {
  const lines: string[] = [
    `## Evaluator 피드백 (${report.verdict}, ${report.weightedTotal}/10, 시도 ${report.attempt}/${report.maxAttempts})`,
  ];

  if (report.issues.length > 0) {
    lines.push("", "### 자동 감지 이슈");
    for (const issue of report.issues) {
      lines.push(`- ${issue}`);
    }
  }

  if (report.antiPatterns.length > 0) {
    lines.push("", "### 안티패턴");
    for (const ap of report.antiPatterns) {
      lines.push(`- ${ap}`);
    }
  }

  lines.push("", `### 권장 조치`, report.recommendation);

  if (userFeedback) {
    lines.push("", `### 사용자 피드백`, userFeedback);
  }

  return lines.join("\n");
}
