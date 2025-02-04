import dotenv from "dotenv";
import { google } from "googleapis";
import { ReadStream } from "fs";
import fs from 'fs';

dotenv.config();

interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

interface UploadOptions {
  title: string;
  videoFile: ReadStream;
  videoId: string;
}

class YouTubeUploader {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;
  private readonly REFRESH_TOKEN: string;
  private readonly SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
  private readonly TOKEN_PATH = './tokens.json';
  private oauthClient: any;
  private youtube: any;

  constructor() {
    this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
    this.REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

    this.oauthClient = new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET
    );

    this.youtube = google.youtube({ 
      version: "v3", 
      auth: this.oauthClient 
    });

    this.initializeTokens();
  }

  private initializeTokens(): void {
    try {
      const tokens = this.loadTokens();
      this.oauthClient.setCredentials({
        refresh_token: this.REFRESH_TOKEN,
        access_token: tokens?.access_token,
        expiry_date: tokens?.expiry_date
      });
    } catch (error) {
      console.error("Token initialization error:", error);
    }
  }

  private loadTokens(): TokenData | null {
    try {
      return JSON.parse(fs.readFileSync(this.TOKEN_PATH, 'utf-8'));
    } catch {
      return null;
    }
  }

  private saveTokens(tokens: TokenData): void {
    fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(tokens));
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    const tokens = this.loadTokens();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (!tokens || Date.now() + fiveMinutes >= tokens.expiry_date) {
      try {
        const { credentials } = await this.oauthClient.refreshAccessToken();
        if (!credentials.access_token) {
          throw new Error("No access token returned");
        }

        const tokenData: TokenData = {
          access_token: credentials.access_token,
          refresh_token: this.REFRESH_TOKEN,
          expiry_date: credentials.expiry_date
        };

        this.saveTokens(tokenData);
        this.oauthClient.setCredentials(tokenData);
      } catch (error) {
        console.error("Token refresh error:", error);
        throw error;
      }
    }
  }

  private async verifyCredentials(): Promise<boolean> {
    try {
      const accessToken = this.oauthClient.credentials.access_token;
      if (!accessToken) return false;
      await this.oauthClient.getTokenInfo(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  public async upload(options: UploadOptions) {
    const tags = [
      "FindTheEmoji", "HiddenEmoji", "EmojiChallenge",
      "EmojiHunt", "MemeFun", "SpotTheEmoji",
      "EmojiSearch", "Shorts", "ViralChallenge",
      "MemeEmoji", "EmojiGame", "EmojiSpotting",
      "HiddenObject", "MemeChallenge", "FunWithEmojis",
      "EmojiAdventure", "GuessTheEmoji", "EmojiTrivia",
      "EmojiFun", "ShortsChallenge"
    ];

    let retries = 2;
    while (retries > 0) {
      try {
        await this.refreshTokenIfNeeded();
        
        const isValid = await this.verifyCredentials();
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

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
        
        if (error.code === 401 && retries > 0) {
          retries--;
          continue;
        }
        throw error;
      }
    }
  }
}

const uploader = new YouTubeUploader();
export default async function upload(options: UploadOptions) {
  return uploader.upload(options);
}