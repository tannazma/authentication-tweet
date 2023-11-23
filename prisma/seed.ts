import usersData from "./data/users.json";
import tweetsData from "./data/tweets.json";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  // Seed every user
  for (let i = 0; i < usersData.length; i++) {
    const thisUser = usersData[i];
    await prisma.user.create({
      data: thisUser,
    });
  }

  //   Seed every tweet
  for (let i = 0; i < tweetsData.length; i++) {
    const thisTweet = tweetsData[i];
    await prisma.tweet.create({
      data: thisTweet,
    });
  }
};

seed();
