import dotenv from "dotenv";

dotenv.config();

import Snoowrap, { type Submission } from "snoowrap";

const reddit = new Snoowrap({
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  userAgent: "SocialFarm/1.0.0",
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const subreddits = ["goodanimememes"];
//@ts-ignore
export default async function getRedditMeme(): Promise<Submission> {
  const subredditName = subreddits.at(
    Math.floor(Math.random() * subreddits.length)
  );

  if (!subredditName) {
    throw new Error("Subreddit name is undefined");
  }

  const validSchemes = [".png", ".jpg", ".jpeg"];

  const hotSubmissions = await reddit.getHot(subredditName, { limit: 20 });
  const submissions = hotSubmissions.filter((submission) => {
    return validSchemes.some((scheme) => submission.url.endsWith(scheme));
  });
  const randomIndex = Math.floor(Math.random() * submissions.length);
  const randomSubmission = submissions[randomIndex];

  //https://i.redd.it/ctvkudgpvfbe1.jpeg
  //@ts-ignore
  return randomSubmission;
}
