import dotenv from "dotenv";
import cron from "node-cron";
import config from "./config.json" with { type: "json" };
import renderVideo from "./managers/videoRenderer.ts";
import youtubeUpload, { checkTokens } from "./managers/youtube.ts";
import path from "path";
import fs from "fs";

dotenv.config();

const videosFolderPath = path.join(process.cwd(), "videos");
if (!fs.existsSync(videosFolderPath)) {
  fs.mkdirSync(videosFolderPath);
}

function convertAMPMToCron(time: string) {
  const [timePart, ampm] = time.split(/(AM|PM)/);
  const [hour, minutes] = timePart.split(":").map(Number);

  const adjustedHour =
    ampm === "PM" && hour < 12
      ? hour + 12
      : ampm === "AM" && hour === 12
      ? 0
      : hour;
  const cronExpression = `${minutes} ${adjustedHour} * * *`;

  return cronExpression;
}

config.schedules.forEach((cronTime) => {
  cron.schedule(convertAMPMToCron(cronTime), async () => {
    console.log("RENDERING VIDEO");
    const tokensValid = await checkTokens();
    if (!tokensValid) {
      console.error("Invalid tokens, please update your credentials");
      return;
    }
    const { videoId } = await renderVideo();
    console.log(`RENDERED ${videoId}`);
    const title = config.titles.at(
      Math.floor(Math.random() * config.titles.length)
    );
    if (!title) return;
    console.log(`Uploading ${videoId}`);
    try {
      await youtubeUpload({
        title,
        videoFile: fs.createReadStream(
          path.join(videosFolderPath, `./${videoId}.mp4`)
        ),
        videoId,
      });
    } catch (e) {
      console.log("Errror uploading", e);
    }

    console.log(`
       UPLOADED VIDEO: 
       id: ${videoId}
       time: ${cronTime}
      `);
  });
});
