/**
 * WebDrama 공유 타입 정의
 * WI-002에서 production-spec 스키마 등 상세 타입 추가 예정
 */

export interface ProjectConfig {
  chrome: ChromeConfig;
  output: OutputConfig;
  pipeline: PipelineConfig;
}

export interface ChromeConfig {
  executablePath: string;
  cdpPort: number;
  userDataDir: string;
  protocolTimeout: number;
  viewport: { width: number; height: number };
}

export interface OutputConfig {
  projectsDir: string;
  defaultFormat: "shorts" | "longform";
  shorts: VideoFormat;
  longform: VideoFormat;
  codec: string;
  crf: number;
}

export interface VideoFormat {
  width: number;
  height: number;
  fps: number;
  maxDuration?: number;
}

export interface PipelineConfig {
  maxEvalRetries: number;
  evalPassScore: number;
  evalReworkMinScore: number;
  promptVariants: number;
  gpuSequential: boolean;
}
