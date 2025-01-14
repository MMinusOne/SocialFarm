import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "node:path";
import getRedditMeme from "./redditMeme.ts";

const entry = path.join(process.cwd(), "video-prod", "src", "index.ts");
const compositionId = "FindEmoji";

const bundleLocation = await bundle({
  entryPoint: entry,
  webpackOverride: (config) => config,
});

export default async function renderVideo(): Promise<{ videoId: string }> {
  const meme = await getRedditMeme();
  const videoId = crypto.randomUUID();

  const inputProps = {
    baseEmoji: "x",
    oddEmoji: "y",
    seed: Math.random(),
    memeUrl: meme.url,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    logLevel: "verbose",
    outputLocation: path.join(process.cwd(), `./videos/${videoId}.mp4`),
    onProgress: ({ progress }) => {
      console.log(`Rendering video ${progress * 100}%`);
    },
    inputProps,
  });

  return { videoId };
}
