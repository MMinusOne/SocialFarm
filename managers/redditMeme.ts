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

const subreddits = ["snoowrap"];

export default async function getRedditMeme() {
  const subredditName = subreddits.at(
    Math.floor(Math.random() * subreddits.length)
  );

  if (!subredditName) {
    throw new Error("Subreddit name is undefined");
  }
  
  const subreddit = reddit.getSubreddit(subredditName);

  const submission = await querySubmission(
    subreddit,
    (submission: Submission) => {
      return !submission.over_18;
    }
  );

  console.log(submission);
  return submission
}

const querySubmission = (
  subreddit: Snoowrap.Subreddit,
  query: (submission: Submission) => boolean
) => {

  return new Promise(async (resolve, reject) => {
    
    for (let i = 0; i < 1; ) {
      const submission = await subreddit.getRandomSubmission();
      if (query(submission)) {
        i++;
        resolve(submission);
      }
    }
  });
};
