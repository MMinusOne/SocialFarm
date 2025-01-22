import { useEffect, useState } from "react";
import { getInputProps, random } from "remotion";

export default function EmojiList() {
  const {
    baseEmoji = "x",
    oddEmoji = "y",
    seed = 2025,
  }: {
    baseEmoji: string;
    oddEmoji: string;
    seed: number;
  } = getInputProps();

  const ROWS = 10;
  const ROW_SIZE = 10;

  const [emojiRows, setEmojiRows] = useState<string[][]>([]);

  const initRows = () => {
    const rows = [];
    const randomIndex = Math.floor(random(seed) * (ROWS * ROW_SIZE));
    let currentEmojiIndex = 0;

    for (let i = 0; i < ROWS; i++) {
      const row = [];
      for (let j = 0; j < ROW_SIZE; j++) {
        if (currentEmojiIndex === randomIndex) {
          row.push(oddEmoji);
        } else {
          row.push(baseEmoji);
        }
        currentEmojiIndex += 1;
      }
      rows.push(row);
    }
    setEmojiRows(rows);
  };

  useEffect(() => {
    initRows();
  }, []);

  return (
    <>
      <div className="flex flex-col bg-slate-100 p-4 w-full h-[55%]">
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

        <div className="flex w-full h-full">
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
              return (
                <div className="flex w-full h-[10%]">
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
