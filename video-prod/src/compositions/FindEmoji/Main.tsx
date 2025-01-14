import { Composition } from "remotion";
import EmojiList from "./EmojiList";
import Meme from "./Meme";

function FindEmoji() {
  return (
    <>
      <div className="flex flex-col bg-slate-100 w-full h-full">
        <EmojiList />
        <Meme />
      </div>
    </>
  );
}

export default function FindEmojiComposition() {
  const fps = 30;
  const durationInFrames = fps * 30;

  return (
    <Composition
      id="FindEmoji"
      component={FindEmoji}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1080}
      height={1920}
    />
  );
}
