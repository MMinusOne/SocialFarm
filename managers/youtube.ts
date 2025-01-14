import dotenv from "dotenv";
import { google } from "googleapis";
import { ReadStream } from "fs";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauthClient = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
);

oauthClient.setCredentials({
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
});

async function ensureAccessToken() {
  try {
    const { credentials } = await oauthClient.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('No access token returned');
    }

    oauthClient.setCredentials({
      access_token: credentials.access_token,
      refresh_token: REFRESH_TOKEN,
    });

    return credentials.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
    }
    throw new Error('Failed to refresh access token');
  }
}

// Verify the credentials before using them
async function verifyCredentials() {
  try {
    const tokenInfo = await oauthClient.getTokenInfo(ACCESS_TOKEN);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
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
    // Verify credentials first
    const isValid = await verifyCredentials();
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Ensure we have a fresh access token
    await ensureAccessToken();

    console.log('Ensured access token');

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
    console.log(`Google API Upload accepted`)
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
