import type {
  StoryPattern,
  VisualPattern,
  HookingPattern,
  TrendKeyword,
  ChannelBenchmark,
} from "../common/types.js";

/**
 * LLM 응답에서 JSON 블록을 추출
 * ```json ... ``` 또는 [ ... ] 또는 { ... } 형태를 파싱
 */
export function extractJsonFromResponse(response: string): unknown[] {
  const results: unknown[] = [];

  const codeBlockPattern = /```(?:json)?\s*\n?([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockPattern.exec(response)) !== null) {
    const candidate = match[1].trim();
    const parsed = tryParseJson(candidate);
    if (parsed !== null) results.push(parsed);
  }

  if (results.length > 0) return results;

  const arrayStart = response.indexOf("[");
  const objectStart = response.indexOf("{");
  const start = arrayStart >= 0 && (objectStart < 0 || arrayStart < objectStart)
    ? arrayStart
    : objectStart;

  if (start >= 0) {
    const candidate = response.slice(start);
    const parsed = tryParseJson(candidate);
    if (parsed !== null) {
      results.push(parsed);
    } else {
      const bracket = response[start];
      const close = bracket === "[" ? "]" : "}";
      let depth = 0;
      for (let i = start; i < response.length; i++) {
        if (response[i] === bracket) depth++;
        else if (response[i] === close) depth--;
        if (depth === 0) {
          const slice = response.slice(start, i + 1);
          const p = tryParseJson(slice);
          if (p !== null) results.push(p);
          break;
        }
      }
    }
  }

  return results;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 파싱된 JSON을 StoryPattern으로 변환 + 유효성 검증
 */
export function parseStoryPatterns(data: unknown[]): StoryPattern[] {
  const patterns: StoryPattern[] = [];
  for (const item of flattenArray(data)) {
    if (!isRecord(item)) continue;
    const obj = item;
    if (typeof obj.genre === "string" && typeof obj.structure === "string") {
      patterns.push({
        genre: obj.genre,
        structure: obj.structure,
        avgDuration: toNumber(obj.avgDuration, 0),
        episodeCount: toNumber(obj.episodeCount, 1),
        source: toString(obj.source),
      });
    }
  }
  return patterns;
}

export function parseVisualPatterns(data: unknown[]): VisualPattern[] {
  const patterns: VisualPattern[] = [];
  for (const item of flattenArray(data)) {
    if (!isRecord(item)) continue;
    const obj = item;
    if (typeof obj.genre === "string" && typeof obj.style === "string") {
      patterns.push({
        genre: obj.genre,
        style: obj.style,
        colorPalette: toStringArray(obj.colorPalette),
        composition: toString(obj.composition),
        thumbnailStyle: toString(obj.thumbnailStyle),
      });
    }
  }
  return patterns;
}

export function parseHookingPatterns(data: unknown[]): HookingPattern[] {
  const validTypes = new Set(["opening", "cliffhanger", "next-episode"]);
  const patterns: HookingPattern[] = [];
  for (const item of flattenArray(data)) {
    if (!isRecord(item)) continue;
    const obj = item;
    if (typeof obj.type === "string" && validTypes.has(obj.type)) {
      patterns.push({
        type: obj.type as HookingPattern["type"],
        description: toString(obj.description),
        examples: toStringArray(obj.examples),
      });
    }
  }
  return patterns;
}

export function parseTrendKeywords(data: unknown[]): TrendKeyword[] {
  const validCompetitions = new Set(["low", "medium", "high"]);
  const keywords: TrendKeyword[] = [];
  for (const item of flattenArray(data)) {
    if (!isRecord(item)) continue;
    const obj = item;
    if (typeof obj.keyword === "string" && obj.keyword.length > 0) {
      const comp = typeof obj.competition === "string" && validCompetitions.has(obj.competition)
        ? (obj.competition as TrendKeyword["competition"])
        : "medium";
      keywords.push({
        keyword: obj.keyword,
        searchVolume: Math.max(0, toNumber(obj.searchVolume, 0)),
        competition: comp,
        trending: obj.trending === true,
      });
    }
  }
  return keywords;
}

export function parseChannelBenchmarks(data: unknown[]): ChannelBenchmark[] {
  const benchmarks: ChannelBenchmark[] = [];
  for (const item of flattenArray(data)) {
    if (!isRecord(item)) continue;
    const obj = item;
    if (typeof obj.channelName === "string" && obj.channelName.length > 0) {
      benchmarks.push({
        channelName: obj.channelName,
        subscribers: Math.max(0, toNumber(obj.subscribers, 0)),
        avgViews: Math.max(0, toNumber(obj.avgViews, 0)),
        uploadFrequency: toString(obj.uploadFrequency),
        engagementRate: Math.max(0, toNumber(obj.engagementRate, 0)),
        topVideos: toStringArray(obj.topVideos),
      });
    }
  }
  return benchmarks;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenArray(data: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (const item of data) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

function toNumber(val: unknown, fallback: number): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (!Number.isNaN(n)) return n;
  }
  return fallback;
}

function toString(val: unknown): string {
  if (typeof val === "string") return val;
  return "";
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  return [];
}
