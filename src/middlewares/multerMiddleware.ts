import multer from 'multer';
import path from 'path';

// Configure Multer to store files in a specific folder with custom file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the folder where files will be saved
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    // Ensure the file name is unique by appending a timestamp
    const ext = path.extname(file.originalname); // Get the file extension
    const fileName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, fileName);
  },
});

// Check for image MIME type
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const mimeType = fileTypes.test(file.mimetype);
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.'));
  }
};

// Create the Multer instance with the configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

export default upload;
