import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

import getRedditMeme from "./managers/redditMeme.ts";

async function h() {
  console.log("Hi");
  const submission = await getRedditMeme();

  console.log(submission);
}

h();
