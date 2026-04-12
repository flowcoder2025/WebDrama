import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { ResearchReport } from "../common/types.js";
import {
  assembleSuccessPatterns,
  assembleTrendAnalysis,
  assembleResearchReport,
  validateResearchReport,
} from "./analyzer.js";
import {
  extractJsonFromResponse,
  parseStoryPatterns,
  parseVisualPatterns,
  parseHookingPatterns,
  parseTrendKeywords,
  parseChannelBenchmarks,
} from "./parser.js";
import { log } from "../common/logger.js";

export interface ResearchInput {
  genre: string;
  channelResponse: string;
  storyResponse: string;
  visualResponse: string;
  hookingResponse: string;
  trendResponse: string;
}

/**
 * LLM 리서치 응답들을 파싱하여 ResearchReport로 조립
 * creative 에이전트가 프롬프트로 수집한 결과를 여기로 전달
 */
export function buildResearchFromResponses(input: ResearchInput): ResearchReport {
  const storyPatterns = parseStoryPatterns(extractJsonFromResponse(input.storyResponse));
  const visualPatterns = parseVisualPatterns(extractJsonFromResponse(input.visualResponse));
  const hookingPatterns = parseHookingPatterns(extractJsonFromResponse(input.hookingResponse));
  const trendKeywords = parseTrendKeywords(extractJsonFromResponse(input.trendResponse));
  const channelBenchmarks = parseChannelBenchmarks(extractJsonFromResponse(input.channelResponse));

  const successPatterns = assembleSuccessPatterns(storyPatterns, visualPatterns, hookingPatterns);
  const trendAnalysis = assembleTrendAnalysis(trendKeywords, channelBenchmarks);

  return assembleResearchReport(successPatterns, trendAnalysis);
}

/**
 * ResearchReport를 프로젝트 디렉토리에 저장
 */
export function saveResearchReport(report: ResearchReport, projectDir: string): string {
  const errors = validateResearchReport(report);
  if (errors.length > 0) {
    log("warn", `리서치 리포트 유효성 경고: ${errors.join(", ")}`);
  }

  const outputPath = resolve(projectDir, "research-report.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
  log("info", `리서치 리포트 저장: ${outputPath}`);
  return outputPath;
}
