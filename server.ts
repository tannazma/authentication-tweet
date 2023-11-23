import express from "express";
import { PrismaClient } from "@prisma/client";
import { json } from "express";
import { toData, toToken } from "./auth/jwt";
import { AuthMiddleware } from "./auth/middleware";

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(json());

// app.get("/register", async (req, res) => {
//   const requestBody = req.body;
//   if ("username" in requestBody && "password" in requestBody) {
//     try {
//       await prisma.user.create({
//         data: requestBody,
//       });
//       res.status(201).send({ message: "User created!" });
//     } catch (error) {
//       // If we get an error, send back HTTP 500 (Server Error)
//       res.status(500).send({ message: "Something went wrong!" });
//     }
//   } else {
//     // If we are missing fields, send back a HTTP 400
//     res
//       .status(400)
//       .send({ message: "'username', 'password' and 'age' are required!" });
//   }
// });
// app.listen(port, () => {
//   console.log(`⚡ Server listening on port: ${port}`);
// });

app.post("/register", AuthMiddleware, async (req, res) => {
  const requestBody = req.body;
  if ("username" in requestBody && "password" in requestBody) {
    try {
      await prisma.user.create({
        data: requestBody,
      });
      res.status(201).send({ message: "User created!" });
    } catch (error) {
      // If we get an error, send back HTTP 500 (Server Error)
      res.status(500).send({ message: "Something went wrong!" });
    }
  } else {
    // If we are missing fields, send back a HTTP 400
    res
      .status(400)
      .send({ message: "'username', 'password' and 'age' are required!" });
  }
});

app.post("/tweet", AuthMiddleware, async (req, res) => {
  const requestBody = req.body;
  if ("text" in requestBody && "userId" in requestBody) {
    try {
      const newTweet = await prisma.tweet.create({
        data: requestBody,
        // data: {
        //   text: "Hi It's Tannaz",
        //   user: {
        //     connect: {
        //       id: 1,
        //     },
        //   },
        // },
        select: {
          id: true,
          text: true,
          userId: true,
          user: true,
        },
      });
      res.status(201).send({ message: "Tweet created", tweet: newTweet });
    } catch (e) {
      res.status(500).send({ message: "Something went wrong", error: e });
    }
  } else {
    res.status(400).send({ message: "'text' and 'userId' are required!" });
  }
});

app.post("/login", AuthMiddleware, async (req, res) => {
  const requestBody = req.body;
  if ("username" in requestBody && "password" in requestBody) {
    try {
      const userToLogin = await prisma.user.findUnique({
        where: {
          username: requestBody.username,
        },
      });
      if (userToLogin && userToLogin.password === requestBody.password) {
        const token = toToken({ userId: userToLogin.id });
        res.status(200).send({ message: "User logged in!", token: token });
        return;
      }
      res.status(400).send({ message: "Login failed" });
    } catch (e) {
      res.status(500).send({ message: "Something went wrong" });
    }
  } else {
    res
      .status(400)
      .send({ message: "'username' and 'password' are required!" });
  }
});

app.get("/users", AuthMiddleware, async (req, res) => {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      age: true,
    },
  });

  res.send(allUsers);
});

app.listen(port, () => {
  console.log(`⚡ Server listening on port: ${port}`);
});
