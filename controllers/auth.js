import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from '../models/user.js';
import { nanoid } from "nanoid";

import { HttpError, sendEmail } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";
import "dotenv/config";
import gravatar from "gravatar";

const { JWT_SECRET, BASE_URL } = process.env;


const register = async (req, res) => {
  const { email, password } = req.body;
   const user = await User.User.findOne({ email });
 
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email);

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();

  const newUser = await User.User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

      const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

  res.status(201).json({ user: { email: newUser.email, subscription: newUser.subscription }  });
};

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found")
    }

    await User.User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null});

    res.status(200).json({
    message: "Verification successful",
  });
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.User.findOne({ email });
    if (!user) {
        throw HttpError(404, "Email not found")
    }
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed")
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.status(200).json({
              message: "Verification email sent",
      })
}


const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

    if (!user.verify) {
      throw HttpError(401, "Email not verify")
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};


const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({ email, subscription });
};


const logout = async (req, res) => {
  const { _id } = req.user;

  await User.User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};


const updateSubscription = async (req, res) => {
  const { _id } = req.user;

  const user = await User.User.findOneAndUpdate(
    { _id },
    { subscription: req.body.subscription },
    { new: true }
  );

  const { email, subscription } = user;

  res.status(200).json({ email, subscription });
};


export default {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
   login: ctrlWrapper(login),   
   getCurrent: ctrlWrapper(getCurrent),   
   logout: ctrlWrapper(logout),
   updateSubscription: ctrlWrapper(updateSubscription),
}