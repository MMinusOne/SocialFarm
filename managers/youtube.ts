import dotenv from "dotenv";
import { google } from "googleapis";
import { ReadStream } from "fs";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN; // Assuming access token is in the env

// Define the required scopes for YouTube API
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

const oauthClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

oauthClient.setCredentials({
  refresh_token: REFRESH_TOKEN,
  access_token: ACCESS_TOKEN, // Set the initial access token
});

// Refresh the access token every 2000 seconds
setInterval(async () => {
  try {
    const { credentials } = await oauthClient.refreshAccessToken();
    console.log({ credentials });
    if (!credentials.access_token) {
      throw new Error("No access token returned");
    }

    oauthClient.setCredentials({
      access_token: credentials.access_token,
      refresh_token: REFRESH_TOKEN,
    });
    console.log("Access token refreshed");
  } catch (error) {
    console.error("Token refresh error:", error);
    if (error.response) {
      console.error("Response error data:", error.response.data);
    }
  }
}, 2000 * 1000); // 2000 seconds in milliseconds

async function verifyCredentials() {
  try {
    const accessToken = oauthClient.credentials.access_token;
    if (!accessToken) {
      throw new Error("Access token is undefined");
    }
    console.log(accessToken);
    const tokenInfo = await oauthClient.getTokenInfo(accessToken);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

const youtube = google.youtube({ version: "v3", auth: oauthClient });

const description = ``;
const tags = [
  "FindTheEmoji",
  "HiddenEmoji",
  "EmojiChallenge",
  "EmojiHunt",
  "MemeFun",
  "SpotTheEmoji",
  "EmojiSearch",
  "Shorts",
  "ViralChallenge",
  "MemeEmoji",
  "EmojiGame",
  "EmojiSpotting",
  "HiddenObject",
  "MemeChallenge",
  "FunWithEmojis",
  "EmojiAdventure",
  "GuessTheEmoji",
  "EmojiTrivia",
  "EmojiFun",
  "ShortsChallenge",
];

export default async function upload(options: UploadOptions) {
  try {
    const isValid = await verifyCredentials();
    if (!isValid) {
      console.log("Access token is invalid, refreshing...");
      const { credentials } = await oauthClient.refreshAccessToken();
      console.log({ credentials });
      if (!credentials.access_token) {
        throw new Error("No access token returned");
      }

      oauthClient.setCredentials({
        access_token: credentials.access_token,
        refresh_token: REFRESH_TOKEN,
      });
      console.log("Ensured access token");
    }

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

    const response = await youtube.videos.insert(request);
    console.log(`Google API Upload accepted`);
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    if (error.response) {
      console.error("Response error data:", error.response.data);
    }
    throw error;
  }
}

interface UploadOptions {
  title: string;
  videoFile: ReadStream;
  videoId: string;
}
