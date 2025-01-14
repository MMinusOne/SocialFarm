import dotenv from "dotenv";
import cron from "node-cron";
import config from "./config.json" with { type: "json" };
import renderVideo from "./managers/videoRenderer.ts";
import youtubeUpload from './managers/youtube.ts';
import path from 'path';
import fs from 'fs';

dotenv.config();

function convertAMPMToCron(time: string) { 
  const [timePart, ampm] = time.split(/(AM|PM)/);
  const [hour, minutes] = timePart.split(':').map(Number);

  const adjustedHour = ampm === 'PM' && hour < 12 ? hour + 12 : hour;
  const cronExpression = `${minutes} ${adjustedHour % 24} * * *`;

  return cronExpression;
}

config.schedules.forEach((time) => {
  const cronTime = convertAMPMToCron(time);
  cron.schedule(cronTime, async() => {
    const { videoId } = await renderVideo();
    const title = config.titles.at(Math.floor(Math.random() * config.titles.length));
    if(!title) return;
    // youtubeUpload({ 
    //   title,
    //   videoFile: fs.createReadStream(path.join(process.cwd(), `./${videoId}`)),
    //   videoId, 
    // })
  });
});

