import { useState } from "react";
import { getInputProps } from "remotion";

export default function EmojiList() {
  const {
    baseEmoji = "x",
    oddEmoji = "y",
  }: { baseEmoji: string; oddEmoji: string } = getInputProps();
  const [emojiRows, setEmojiRows] = useState(
    Array(10).fill(Array(10).fill(baseEmoji))
  );

  return (
    <>
      <div className="flex flex-col w-full h-[55%]">
        <div
          style={{ height: 200 }}
          className="flex justify-center items-center w-full"
        >
          <span
            style={{
              fontFamily: "Geologica",
              fontSize: 70,
            }}
            className="font-semibold text-slate-700"
          >
            Find the emoji: {oddEmoji}
          </span>
        </div>

        <div className="flex bg-blue-500 p-10 w-full h-full">
          <div className="flex flex-col w-20 h-full">
            {emojiRows.map((_, rowIndex) => {
              return (
                <span
                  style={{ fontFamily: "Geologica" }}
                  className="place-items-center grid w-full h-[10%] font-bold text-5xl"
                >
                  {rowIndex + 1}.
                </span>
              );
            })}
          </div>

          <div className="flex flex-col w-full h-full">
            {emojiRows.map((row) => {
              console.log(row);
              return (
                <div className="flex bg-yellow-500 w-full h-[10%]">
                  {row.map((emoji: string, emojiIndex: number) => {
                    return (
                      <span className="place-items-center grid w-[10%] h-full text-5xl text-center">
                        {emoji}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
