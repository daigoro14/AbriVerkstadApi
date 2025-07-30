"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure Multer to store files in a specific folder with custom file naming
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Define the folder where files will be saved
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        // Ensure the file name is unique by appending a timestamp
        const ext = path_1.default.extname(file.originalname); // Get the file extension
        const fileName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, fileName);
    },
});
// Check for image MIME type
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
        return cb(null, true); // Accept file
    }
    else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.'));
    }
};
// Create the Multer instance with the configuration
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});
exports.default = upload;
