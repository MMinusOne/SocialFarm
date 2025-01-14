import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";
import express from "express";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback"; // Set your redirect URI here

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/youtubepartner-channel-audit",
];

const oauthClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const app = express();

function generateAuthUrl() {
  const authUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  return authUrl;
}

app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  if (code) {
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);
    console.log("Tokens received:", tokens); 
    res.send("Authentication successful! You can close this tab.");
  } else {
    res.send("No code received.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  generateAuthUrl(); 
});
