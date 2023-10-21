import multer from "multer";
import path from "path";

const destination = path.resolve("temp");
console.log(destination)
const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 159)}`;
        const filename = `${uniqueSuffix}_${file.originalname}`;
        cb(null, filename);
    }
});
const limits = {
  fileSize: 1024 * 1024 * 5,
};
const upload = multer({ storage, limits });
export default upload;
