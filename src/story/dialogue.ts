import type { Character, Dialogue } from "../common/types.js";
import type { ScenarioScene } from "./scenario.js";

/**
 * WI-012: 대사 생성기
 * 장면별 캐릭터 대사 생성 프롬프트
 */
export function dialoguePrompt(
  scene: ScenarioScene,
  characters: Character[],
): string {
  const charList = characters
    .map(c => `- ${c.id}: ${c.name} (음성: ${c.voiceProfile})`)
    .join("\n");

  return `다음 장면의 캐릭터 대사를 작성하세요.

## 장면
- ID: ${scene.id}
- 설명: ${scene.description}
- 길이: ${scene.duration}초

## 등장 캐릭터
${charList}

## 규칙
- 대사는 자연스러운 한국어 구어체
- 각 대사에 감정 태그 필수 (nostalgic, happy, angry, sad, surprised, calm 등)
- 대사 길이는 TTS 발화 시간 고려 (1초 ≈ 4음절)

## 출력 형식
[
  {
    "characterId": "char_01",
    "text": "대사 내용",
    "emotion": "감정"
  }
]`;
}

/**
 * WI-013: 나레이션 생성기
 */
export function narrationPrompt(scene: ScenarioScene): string {
  return `다음 장면의 나레이션을 작성하세요.

## 장면
- ID: ${scene.id}
- 설명: ${scene.description}

## 규칙
- 간결하고 분위기를 전달하는 문체
- TTS 발화 기준 3~5초 분량 (12~20음절)
- 장면 전환부나 감정 전환점에서 사용

## 출력
나레이션 텍스트만 반환 (JSON 아님, 순수 텍스트)`;
}

/**
 * 대사 응답 파싱
 */
export function parseDialogueResponse(response: string, validCharIds: string[]): Dialogue[] {
  const charIdSet = new Set(validCharIds);
  const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : response.trim();

  let parsed: unknown[];
  try {
    const result = JSON.parse(candidate);
    parsed = Array.isArray(result) ? result : [result];
  } catch {
    const start = response.indexOf("[");
    if (start < 0) return [];
    try {
      parsed = JSON.parse(response.slice(start)) as unknown[];
    } catch {
      return [];
    }
  }

  return parsed
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null &&
      typeof (item as Record<string, unknown>).characterId === "string" &&
      typeof (item as Record<string, unknown>).text === "string"
    )
    .filter(item => charIdSet.has(item.characterId as string))
    .map(item => ({
      characterId: item.characterId as string,
      text: item.text as string,
      emotion: typeof item.emotion === "string" ? item.emotion : "calm",
    }));
}
