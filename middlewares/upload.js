import multer from "multer";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const tempDir = path.resolve(_dirname, "../", "temp");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const limits = {
  fileSize: 1024 * 1024 * 5,
};
const upload = multer({ storage, limits });
export default upload;
