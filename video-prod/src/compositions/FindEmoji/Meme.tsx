import { getInputProps } from "remotion";
import { Img } from 'remotion'

export default function Meme() {
  const { memeUrl = "https://i.redd.it/ctvkudgpvfbe1.jpeg" } = getInputProps();

  return (
    <>
      <div className="w-full h-[45%]">
        <Img 
         src={memeUrl}
         className="w-full h-full"
        />
      </div>
    </>
  );
}
