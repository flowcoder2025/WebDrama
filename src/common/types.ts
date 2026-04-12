/**
 * WebDrama 공유 타입 정의
 * 모든 에이전트/모듈이 참조하는 핵심 스키마
 */

// ============================================================
// Production Spec (창작 에이전트 출력 → 실행 에이전트 입력)
// ============================================================

export interface ProductionSpec {
  metadata: Metadata;
  characters: Character[];
  scenes: SceneSpec[];
}

export interface Metadata {
  title: string;
  genre: string;
  format: "shorts" | "longform";
  episodes: number;
  targetDuration: number;
}

export interface Character {
  id: string;
  name: string;
  voiceProfile: string;
  voiceSample: string | null;
}

export interface SceneSpec {
  id: string;
  duration: number;
  description: string;
  imagePrompt: string;
  videoPrompt: string;
  dialogues: Dialogue[];
  narration: string | null;
  bgm: BgmSpec;
  transition: TransitionSpec;
  subtitle: boolean;
}

export interface Dialogue {
  characterId: string;
  text: string;
  emotion: string;
}

export interface BgmSpec {
  prompt: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface TransitionSpec {
  type: "crossfade" | "cut" | "fade-to-black";
  duration: number;
}

// ============================================================
// Research Report (리서치 모듈 출력)
// ============================================================

export interface ResearchReport {
  successPatterns: SuccessPatterns;
  trendAnalysis: TrendAnalysis;
  generatedAt: string;
}

export interface SuccessPatterns {
  story: StoryPattern[];
  visual: VisualPattern[];
  hooking: HookingPattern[];
}

export interface StoryPattern {
  genre: string;
  structure: string;
  avgDuration: number;
  episodeCount: number;
  source: string;
}

export interface VisualPattern {
  genre: string;
  style: string;
  colorPalette: string[];
  composition: string;
  thumbnailStyle: string;
}

export interface HookingPattern {
  type: "opening" | "cliffhanger" | "next-episode";
  description: string;
  examples: string[];
}

export interface TrendAnalysis {
  keywords: TrendKeyword[];
  benchmarks: ChannelBenchmark[];
}

export interface TrendKeyword {
  keyword: string;
  searchVolume: number;
  competition: "low" | "medium" | "high";
  trending: boolean;
}

export interface ChannelBenchmark {
  channelName: string;
  subscribers: number;
  avgViews: number;
  uploadFrequency: string;
  engagementRate: number;
  topVideos: string[];
}

// ============================================================
// Eval Report (Evaluator 출력)
// ============================================================

export interface EvalReport {
  wi: string;
  sprintContract: string;
  scores: EvalScores;
  weightedTotal: number;
  verdict: "PASS" | "REWORK" | "REGENERATE" | "ESCALATE";
  antiPatterns: string[];
  issues: string[];
  recommendation: string;
  attempt: number;
  maxAttempts: number;
}

export interface EvalScores {
  storyStructure: EvalScore;
  visualConsistency: EvalScore;
  voiceQuality: EvalScore;
  editingCompleteness: EvalScore;
}

export interface EvalScore {
  score: number;
  weight: number;
  evidence: string;
}

// ============================================================
// TTS 설정
// ============================================================

export interface TtsConfig {
  activeEngine: string;
  engines: Record<string, TtsEngine>;
  defaultVoice: {
    narrator: string;
    language: string;
  };
}

export interface TtsEngine {
  name: string;
  baseUrl: string | null;
  status: "available" | "not-installed" | "error";
  features: string[];
  cloningSampleDuration?: number;
}

export interface VoiceProfile {
  id: string;
  name: string;
  engine: string;
  language: string;
  sample: string | null;
}

// ============================================================
// BGM 설정
// ============================================================

export interface BgmConfig {
  engine: string;
  baseUrl: string;
  status: "available" | "not-installed" | "error";
  model: string;
  api: {
    releaseTask: string;
    queryResult: string;
    downloadAudio: string;
  };
  defaults: {
    inferenceSteps: number;
    thinking: boolean;
    maxDuration: number;
    sampleRate: number;
  };
}

// ============================================================
// 프로젝트 설정 (config/default.json)
// ============================================================

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

// ============================================================
// Freepik CDP 설정
// ============================================================

export interface FreepikConfig {
  image: FreepikImageConfig;
  video: FreepikVideoConfig;
  download: { method: string; chunkSize: number };
}

export interface FreepikImageConfig {
  model: string;
  ratio: string;
  resolution: string;
  width: number;
  height: number;
  timeout: number;
  generateSelector: string;
  resultSelector: string;
}

export interface FreepikVideoConfig {
  model: string;
  ratio: string;
  resolution: string;
  width: number;
  height: number;
  duration: number;
  timeout: number;
  uploadSelector: string;
}

// ============================================================
// Remotion 렌더링 설정
// ============================================================

export interface RemotionRenderConfig {
  gl: string;
  concurrency: number;
  codec: string;
  pixelFormat: string;
  crf: number;
  audioBitrate: string;
  shorts: { width: number; height: number; fps: number; maxDurationInFrames: number };
  longform: { width: number; height: number; fps: number };
}
