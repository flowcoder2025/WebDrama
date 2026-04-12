import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { ProductionSpec } from "../common/types.js";
import { loadRemotionConfig } from "../common/config.js";
import { log } from "../common/logger.js";

export interface RenderOptions {
  specPath: string;
  assetsDir: string;
  outputPath: string;
  format: "shorts" | "longform";
}

/**
 * WI-035/036: Shorts + 롱폼 렌더러
 * production-spec.json + 에셋 → 최종 영상 렌더링
 */
export async function renderDrama(options: RenderOptions): Promise<string> {
  const config = loadRemotionConfig();
  const formatConfig = options.format === "shorts" ? config.shorts : config.longform;

  const spec = JSON.parse(
    readFileSync(resolve(options.specPath), "utf-8"),
  ) as ProductionSpec;

  const totalDuration = spec.scenes.reduce((sum, s) => sum + s.duration, 0);
  const totalFrames = totalDuration * formatConfig.fps;

  log("info", `렌더링 시작: ${options.format} (${totalDuration}초, ${totalFrames}프레임)`);

  const compositionId = options.format === "shorts" ? "DramaShorts" : "DramaLongform";

  const bundled = await bundle({
    entryPoint: resolve("src/editor/compositions/Root.tsx"),
    webpackOverride: (c) => c,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps: {
      specPath: options.specPath,
      assetsDir: options.assetsDir,
      format: options.format,
      spec,
    },
  });

  const outputPath = resolve(options.outputPath);

  await renderMedia({
    composition: {
      ...composition,
      width: formatConfig.width,
      height: formatConfig.height,
      fps: formatConfig.fps,
      durationInFrames: totalFrames,
    },
    serveUrl: bundled,
    codec: config.codec as "h264",
    outputLocation: outputPath,
    inputProps: {
      specPath: options.specPath,
      assetsDir: options.assetsDir,
      format: options.format,
      spec,
    },
    concurrency: config.concurrency,
    crf: config.crf,
    audioBitrate: config.audioBitrate as `${number}k`,
    chromiumOptions: { gl: config.gl as "angle" },
  });

  log("info", `렌더링 완료: ${outputPath}`);
  return outputPath;
}

/**
 * 렌더링 설정 검증
 */
export function validateRenderOptions(options: RenderOptions): string[] {
  const errors: string[] = [];

  if (!options.specPath) errors.push("specPath가 비어있음");
  if (!options.assetsDir) errors.push("assetsDir가 비어있음");
  if (!options.outputPath) errors.push("outputPath가 비어있음");
  if (!["shorts", "longform"].includes(options.format)) {
    errors.push(`잘못된 format: ${options.format}`);
  }

  return errors;
}
