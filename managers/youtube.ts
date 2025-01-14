import dotenv from "dotenv";

dotenv.config();

import { google } from "googleapis";
import { ReadStream } from "fs";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauthClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

oauthClient.setCredentials({
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
});

const youtube = google.youtube({ version: "v3", auth: oauthClient });

// Use process.cwd() to get the current working directory instead of __dirname
// const videoFilePath = path.join(process.cwd(), "./video.mp4");
// const videoFile = fs.createReadStream(videoFilePath);

const description = ``;
const tags = [];

export default async function upload(options: UploadOptions) {
  const request = {
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: options.title,
        description: description,
        tags: tags,
      },
      status: {
        privacyStatus: "public",
      },
    },
    media: {
      body: options.videoFile,
    },
  };

  try {
    const response = await youtube.videos.insert(request);
    return response;
  } catch (error) {
    console.error("Error uploading video:", error);
  }
}

interface UploadOptions {
  title: string;
  videoFile: ReadStream;
  videoId: string;
}
