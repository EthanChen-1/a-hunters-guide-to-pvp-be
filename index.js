require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const conDB = require("./dbConnection");
const jwt = require("jsonwebtoken");
const userModel = require("./userModel");
const threadModel = require("./threadModel");

const app = express();
const port = process.env.PORT || 8000;

conDB();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the AHGTPVP Backend");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userModel({
    username,
    email,
    password: hashedPassword,
  });
  const userCreated = await newUser.save();
  if (!userCreated) {
    console.log("Error occured when trying to create a user");
    return res.status(500).send("Error occured when trying to create a user");
  } else {
    console.log("User sucessfully registered");
    return res.status(200).send("User sucessfully registered");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`User with email: ${email} has attempted to login`);
  const user = await userModel.findOne({ email });
  if (!user) {
    console.log(`User with email: ${email} has failed to login`);
    return res.status(401).send("Invalid email or password");
  }
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    console.log(`User with email: ${email} has failed to login`);
    return res.status(401).send("Invalid email or password");
  }

  const jwtSecret = process.env.JWT_SECRET;

  const payload = {
    username: user.username,
    email: user.email,
    password: user.password,
  };

  const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });

  res
    .status(200)
    .json({ message: "User sucessfully logged in", token: jwtToken });
});

app.get("/forum", auth, async (req, res) => {
  console.log("User has entered the forums");
  const threads = await threadModel.find();
  res.status(200).json(threads);
});

app.post("/forum", auth, async (req, res) => {
  const { title, author, content } = req.body;
  const newThread = new threadModel({
    title,
    author,
    content,
    comments: [],
    date: Date.now(),
  });
  const threadCreated = await newThread.save();
  if (!threadCreated) {
    console.log("Error occured when trying to create a thread");
    return res.status(500).send("Error occured when trying to create a thread");
  } else {
    console.log("Thread successfully created");
    return res.status(200).send("Thread successfully created");
  }
});

async function auth(req, res, next) {
  const jwtToken = req.headers.authorization.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(jwtToken, jwtSecret);

    const userEmail = decoded.email;

    const user = await userModel.findOne({ email: userEmail });

    if (user) {
      console.log("Auth success");
      next();
    } else {
      console.log("Auth Failed");
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("Auth Failed");
    res.status(401).json({ error: "Invalid token" });
  }
}

app.listen(port, () => {
  console.log(`ahgtpvp backend listening on port: ${port}`);
});
