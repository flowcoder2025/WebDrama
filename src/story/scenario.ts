import type { ResearchReport, Metadata } from "../common/types.js";

/**
 * WI-010: 시나리오 생성 엔진
 * 리서치 결과 기반으로 시나리오 생성 프롬프트를 만든다
 */
export function scenarioPrompt(
  userPrompt: string,
  report: ResearchReport,
  format: "shorts" | "longform",
): string {
  const storyPatterns = report.successPatterns.story
    .map(p => `- ${p.genre}: ${p.structure} (${p.avgDuration}초, ${p.episodeCount}화)`)
    .join("\n");

  const hookingPatterns = report.successPatterns.hooking
    .map(p => `- ${p.type}: ${p.description}`)
    .join("\n");

  const duration = format === "shorts" ? "60초 이내" : "5~15분";

  return `당신은 10년차 웹드라마 작가 겸 연출가입니다.

## 사용자 요청
${userPrompt}

## 리서치 기반 성공 패턴
### 스토리 구조
${storyPatterns}

### 후킹 패턴
${hookingPatterns}

## 제작 조건
- 형식: ${format} (${duration})
- 첫 장면에 반드시 후킹 패턴(opening) 적용
- 마지막 장면에 클리프행어 배치 (시리즈의 경우)

## 출력 형식
다음 JSON으로 시나리오 구조를 반환하세요:
{
  "metadata": {
    "title": "에피소드 제목",
    "genre": "장르",
    "format": "${format}",
    "episodes": 에피소드수,
    "targetDuration": 목표초수
  },
  "synopsis": "전체 스토리 한 줄 요약",
  "acts": [
    {
      "act": 1,
      "description": "막 설명",
      "scenes": [
        {
          "id": "scene_01",
          "duration": 초수,
          "description": "장면 상세 설명 (배경, 등장인물, 상황, 감정)"
        }
      ]
    }
  ]
}`;
}

/**
 * WI-011: 장면 분할 + 후킹 주입기
 * 시나리오 응답에서 장면 목록 추출 + 후킹 검증
 */
export interface ScenarioScene {
  id: string;
  duration: number;
  description: string;
}

export interface ScenarioAct {
  act: number;
  description: string;
  scenes: ScenarioScene[];
}

export interface ScenarioOutput {
  metadata: Metadata;
  synopsis: string;
  acts: ScenarioAct[];
}

export function parseScenarioResponse(response: string): ScenarioOutput | null {
  const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : response.trim();

  try {
    const parsed = JSON.parse(candidate) as ScenarioOutput;
    if (!parsed.metadata || !parsed.acts || !Array.isArray(parsed.acts)) return null;
    return parsed;
  } catch {
    const start = response.indexOf("{");
    if (start < 0) return null;
    try {
      return JSON.parse(response.slice(start)) as ScenarioOutput;
    } catch {
      return null;
    }
  }
}

export function extractAllScenes(scenario: ScenarioOutput): ScenarioScene[] {
  return scenario.acts.flatMap(act => act.scenes);
}

export function validateHooking(scenario: ScenarioOutput): string[] {
  const warnings: string[] = [];
  const scenes = extractAllScenes(scenario);

  if (scenes.length === 0) {
    warnings.push("장면이 없음");
    return warnings;
  }

  const firstScene = scenes[0];
  const hookKeywords = ["왜", "어떻게", "갑자기", "충격", "비밀", "?"];
  const hasHook = hookKeywords.some(k => firstScene.description.includes(k));
  if (!hasHook) {
    warnings.push("첫 장면에 후킹 패턴이 감지되지 않음 — 질문형/충격적 오프닝 권장");
  }

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  if (scenario.metadata.format === "shorts" && totalDuration > 65) {
    warnings.push(`Shorts 형식인데 총 ${totalDuration}초 — 60초 이내 권장`);
  }

  return warnings;
}
