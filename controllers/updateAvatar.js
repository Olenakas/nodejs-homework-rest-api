import User from "../../models/User.js";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

const pathPublic = path.resolve("public","avatars");
export const updateAvatar = async (req, res) => {
  const { _id: id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(pathPublic, filename);
  
   Jimp.read(oldPath)
    .then((image) => {
      return image.resize(250, 250).write(newPath);
    })
    .catch((err) => {
      console.error(err);
    });
  
  fs.rename(oldPath, newPath);
  const avatarUrl = path.join("http://localhost:3000", "avatars", filename)
  const result = await User.findByIdAndUpdate(id, { avatarUrl }, {new: true,}); 
 
  res.status(200).json({ avatarUrl: result.avatarUrl },);
}; 