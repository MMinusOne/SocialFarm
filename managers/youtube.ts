import dotenv from "dotenv";
import { google, Auth, youtube_v3 } from "googleapis";
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
  private oauthClient: Auth.OAuth2Client;
  private youtube: youtube_v3.Youtube;
  //@ts-ignore
  private tokenRefreshInterval: NodeJS.Timeout;

  constructor() {
    this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
    this.REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

    this.oauthClient = new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      'http://localhost' // Add redirect URI
    );

    this.youtube = google.youtube({ 
      version: "v3", 
      auth: this.oauthClient 
    });

    this.initializeTokens();
    this.startTokenRefreshInterval();
  }

  private startTokenRefreshInterval(): void {
    // Refresh tokens every 5 minutes
    this.tokenRefreshInterval = setInterval(async () => {
      try {
        console.log('REFRESHED TOKENS')
        await this.refreshTokens();
      } catch (error) {
        console.error("Scheduled token refresh error:", error);
      }
    }, 5 * 60 * 1000);
  }

  private async refreshTokens(): Promise<void> {
    try {
      this.oauthClient.setCredentials({
        refresh_token: this.REFRESH_TOKEN
      });
      
      const { credentials } = await this.oauthClient.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error("No access token returned");
      }

      const tokenData: TokenData = {
        access_token: credentials.access_token,
        refresh_token: this.REFRESH_TOKEN,
        expiry_date: Date.now() + (60 * 60 * 1000) 
      };

      this.saveTokens(tokenData);
      this.oauthClient.setCredentials(tokenData);
      console.log("Tokens refreshed successfully");
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  private initializeTokens(): void {
    try {
      const tokens = this.loadTokens();
      this.oauthClient.setCredentials({
        refresh_token: this.REFRESH_TOKEN,
        access_token: tokens?.access_token,
        expiry_date: tokens?.expiry_date
      });
      // Force immediate token refresh on initialization
      this.refreshTokens();
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
        // Force token refresh before each upload attempt
        await this.refreshTokens();
        
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

  // Cleanup method to clear the interval when the uploader is no longer needed
  public cleanup(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
  }
}

const uploader = new YouTubeUploader();

export default async function upload(options: UploadOptions) {
  return uploader.upload(options);
}

// Export cleanup function
export function cleanup() {
  uploader.cleanup();
}