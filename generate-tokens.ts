import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USERNAME = "MMinusZero";
const REDDIT_PASSWORD = "epxw7v3mZL.";

axios
  .post(
    "https://www.reddit.com/api/v1/access_token",
    {
      grant_type: "password",
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    },
    {
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
  .then((response) => {
    console.log("OAuth access token:", response.data);
  })
  .catch((error) => {
    console.error("Error generating OAuth access token:", error);
  });
