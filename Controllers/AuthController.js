import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let generateToken = (user) => jwt.sign(user, process.env.ACCESS_SECRET);

// Registering a new User
export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  const newUser = new UserModel({
    username,
    password: hashedPass,
    firstname,
    lastname,
    email,
    about:"",
    location:"",
    website:"",
    followers:[],
    following:[],
    bookmarks:[],
    notifications:[],
  });
  try {
    await newUser.save();
    const authToken = generateToken({ username });
    res.status(200).json({ user: newUser, authToken });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "User already exists" });
    } else res.status(500).json({ message: error.message });
  }
};

// login User

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username: username });

    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      const authToken = generateToken({ username });
      validity
        ? res.status(200).json({ user, authToken })
        : res.status(400).json("Wrong Password");
    } else {
      res.status(404).json("User does not exists");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
