import dotenv from "dotenv";
import cron from "node-cron";
// import config from "./config.json" with { type: "json" };
import renderVideo from "./managers/videoRenderer.ts";
import youtubeUpload from "./managers/youtube.ts";
import path from "path";
import fs from "fs";

dotenv.config();

const videosFolderPath = path.join(process.cwd(), "videos");
if (!fs.existsSync(videosFolderPath)) {
  fs.mkdirSync(videosFolderPath);
}

const config: {
  schedules: string[];
  titles: string[];
} = {
  schedules: [],
  titles: ["test"],
};

const now = new Date();
now.setMinutes(now.getMinutes() + 1);
const nextMinuteCron = `${now.getMinutes()} ${now.getHours()} * * *`;
config.schedules.push(nextMinuteCron);

config.schedules.forEach((cronTime) => {
  cron.schedule(cronTime, async () => {
    console.log("RENDERING VIDEO");
    const { videoId } = await renderVideo();
    console.log(`RENDERED ${videoId}`);
    const title = config.titles.at(
      Math.floor(Math.random() * config.titles.length)
    );
    if (!title) return;
    console.log(`Uploading ${videoId}`);
    await youtubeUpload({
      title,
      videoFile: fs.createReadStream(
        path.join(videosFolderPath, `./${videoId}.mp4`)
      ),
      videoId,
    });

    console.log(`
       UPLOADED VIDEO: 
       id: ${videoId}
       time: ${cronTime}
      `);
  });
});
