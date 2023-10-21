import User from "../models/user.js";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

import { fileURLToPath } from "url"; 
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

const pathPublic = path.resolve(__dirname, "../", "public", "avatars");

export const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;

  try {
    const filename = `${_id}_${originalname}`; 
    const newPath = path.join(pathPublic, filename);

     Jimp.read(oldPath)
      .then((image) => { 
        return image.resize(250, 250).write(newPath);
      })
      .catch((err) => { 
        throw err;
      });

    const avatarUrl = path.join("avatars", filename);

    const updateUser = await User.User.findByIdAndUpdate( 
      _id,
      { avatarUrl },
      { new: true }
    );

    console.log(updateUser);

    res.status(200).json({ avatarUrl: updateUser.avatarUrl }); 

  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await fs.unlink(oldPath);
  }
};

