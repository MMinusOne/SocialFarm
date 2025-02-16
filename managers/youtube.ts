import dotenv from "dotenv";
import { google, youtube_v3 } from "googleapis";
import { ReadStream } from "fs";

dotenv.config();

interface UploadOptions {
  title: string;
  videoFile: ReadStream;
  videoId: string;
}

class YouTubeUploader {
  private readonly oauth2Client;
  private readonly youtube: youtube_v3.Youtube;

  constructor() {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN
    ) {
      throw new Error("Missing required environment variables");
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost"
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.youtube = google.youtube({
      version: "v3",
      auth: this.oauth2Client,
    });
  }

  private async validateTokens(): Promise<boolean> {
    try {
      // This will attempt to get a new access token using the refresh token
      const { token, res } = await this.oauth2Client.getAccessToken();

      // If we get here, the tokens are valid
      if (!token || !token) {
        console.error("Failed to get valid access token");
        return false;
      }

      // Verify the access token works by making a simple API call
      await this.youtube.channels.list({
        part: ["snippet"],
        mine: true,
      });

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }

  public async upload(options: UploadOptions) {
    const tokensValid = await this.validateTokens();
    if (!tokensValid) {
      throw new Error(
        "Invalid or expired tokens. Please check your credentials."
      );
    }

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

    try {
      const request = {
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: options.title,
            description: "",
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

      const response = await this.youtube.videos.insert(request);
      console.log("Upload successful");
      return response;
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
      }
      throw error;
    }
  }

  // Static method to check if tokens are valid without creating a full instance
  public static async checkTokens(): Promise<boolean> {
    try {
      const tempUploader = new YouTubeUploader();
      return await tempUploader.validateTokens();
    } catch (error) {
      console.error("Token check failed:", error);
      return false;
    }
  }
}

// Create uploader instance only if needed
let uploader: YouTubeUploader | null = null;

export async function checkTokens(): Promise<boolean> {
  return YouTubeUploader.checkTokens();
}

export default async function upload(options: UploadOptions) {
  if (!uploader) {
    uploader = new YouTubeUploader();
  }
  return uploader.upload(options);
}

// Usage example:
/*
import upload, { checkTokens } from './YouTubeUploader';

async function main() {
  // First check if tokens are valid
  const tokensValid = await checkTokens();
  if (!tokensValid) {
    console.error('Invalid tokens, please update your credentials');
    return;
  }

  // Proceed with upload if tokens are valid
  try {
    await upload({
      title: "My Video",
      videoFile: fs.createReadStream("video.mp4"),
      videoId: "someId"
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
*/
