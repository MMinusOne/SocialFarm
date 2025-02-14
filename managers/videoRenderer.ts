import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "node:path";
import getRedditMeme from "./redditMeme.ts";
import { enableTailwind } from '@remotion/tailwind';
import emojis from '../emojis.json' with { type: "json" }

const compositionId = "FindEmoji";

const bundleLocation = await bundle({
  entryPoint: path.resolve('./video-prod/src/index.ts'),
  webpackOverride: (config) => enableTailwind(config),
});

export default async function renderVideo(): Promise<{ videoId: string }> {
  //@ts-ignore
  const meme = await getRedditMeme();
  const videoId = crypto.randomUUID();
  console.log(meme)
  const randomGroup = emojis[Math.floor(Math.random() * emojis.length)];

  const [baseEmoji, oddEmoji] = randomGroup.sort(() => 0.5 - Math.random()).slice(0, 2);

  const inputProps = {
    baseEmoji,
    oddEmoji,
    seed: Math.random(),
    memeUrl: meme.url,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    logLevel: "verbose",
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    concurrency: 2,
    hardwareAcceleration: "if-possible",
    logLevel: "verbose",
    outputLocation: path.join(process.cwd(), `./videos/${videoId}.mp4`),
    onProgress: ({ progress }) => {
      console.log(`Rendering video ${progress * 100}%`);
    },
    inputProps,
  });

  return { videoId };
}
