import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error("Only JPEG, PNG, GIF, and WEBP images are allowed.");
        error.statusCode = 400;
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

export const uploadSingleImage = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            const error = new Error(
                err.code === "LIMIT_FILE_SIZE"
                    ? "Image file cannot exceed 5MB."
                    : err.message
            );
            error.statusCode = 400;
            return next(error);
        }

        return next(err);
    });
};

export default uploadSingleImage;
