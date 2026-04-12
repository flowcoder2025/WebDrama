import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { loadBgmConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";

/**
 * WI-028: ACE-Step 클라이언트
 * ACE-Step 1.5XL REST API 연동 (localhost:8001)
 */

interface TaskResponse {
  task_id: string;
  status: string;
}

interface QueryResponse {
  status: "pending" | "processing" | "completed" | "failed";
  audio_path?: string;
}

export async function generateBgm(prompt: string, durationSec: number): Promise<Buffer> {
  const config = loadBgmConfig();
  log("info", `[ACE-Step] BGM 생성 요청: "${prompt.slice(0, 50)}..." (${durationSec}초)`);

  const taskRes = await fetch(`${config.baseUrl}/release_task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      thinking: config.defaults.thinking,
      inference_steps: config.defaults.inferenceSteps,
      model: config.model,
      duration: Math.min(durationSec, config.defaults.maxDuration),
    }),
  });

  if (!taskRes.ok) {
    throw new Error(`ACE-Step 작업 제출 실패: ${taskRes.status}`, { cause: null });
  }

  const task = (await taskRes.json()) as TaskResponse;
  log("info", `[ACE-Step] task_id: ${task.task_id}`);

  const audioPath = await pollTaskResult(config.baseUrl, task.task_id, 600000);
  return downloadAudio(config.baseUrl, audioPath);
}

async function pollTaskResult(baseUrl: string, taskId: string, timeout: number): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const res = await fetch(`${baseUrl}/query_result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });

    if (res.ok) {
      const result = (await res.json()) as QueryResponse;
      if (result.status === "completed" && result.audio_path) {
        log("info", `[ACE-Step] 생성 완료 (${((Date.now() - startTime) / 1000).toFixed(1)}초)`);
        return result.audio_path;
      }
      if (result.status === "failed") {
        throw new Error("ACE-Step BGM 생성 실패", { cause: null });
      }
    }

    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error(`ACE-Step 타임아웃 (${timeout / 1000}초)`, { cause: null });
}

async function downloadAudio(baseUrl: string, audioPath: string): Promise<Buffer> {
  const res = await fetch(`${baseUrl}/v1/audio?path=${encodeURIComponent(audioPath)}`);
  if (!res.ok) {
    throw new Error(`ACE-Step 오디오 다운로드 실패: ${res.status}`, { cause: null });
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * WI-029: BGM 후처리기
 * 볼륨 조절, fade_in/fade_out 메타데이터 기록
 * 실제 오디오 처리는 Remotion에서 수행
 */
export interface BgmAsset {
  filepath: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  duration: number;
}

export async function saveBgm(
  buffer: Buffer,
  outputDir: string,
  sceneId: string,
  volume: number,
  fadeIn: number,
  fadeOut: number,
): Promise<BgmAsset> {
  const filename = `${sceneId}.wav`;
  const filepath = resolve(outputDir, "bgm", filename);
  mkdirSync(dirname(filepath), { recursive: true });
  writeFileSync(filepath, buffer);
  log("info", `BGM 저장: ${filename} (vol:${volume}, fadeIn:${fadeIn}s, fadeOut:${fadeOut}s)`);

  return { filepath, volume, fadeIn, fadeOut, duration: 0 };
}
