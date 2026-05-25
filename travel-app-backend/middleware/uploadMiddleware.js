const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Create uploads folder if not exists ───────────────────────────────────
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ─── Storage Configuration ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.fieldname === "profileImage") {
      uploadPath = "uploads/profiles/";
    } else if (file.fieldname === "licenseImage") {
      uploadPath = "uploads/licenses/";
    } else if (file.fieldname === "vehicleImage") {
      uploadPath = "uploads/vehicles/";
    } else if (file.fieldname === "images" || file.fieldname === "reviewImages") {
      uploadPath = "uploads/images/";
    } else if (file.fieldname === "receiptImage") {
      uploadPath = "uploads/receipts/";
    }

    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ─── File Filter ────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// ─── Upload Configurations ──────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Single image upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple images upload
const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);

// Multiple fields upload
const uploadFields = (fields) => upload.fields(fields);

module.exports = { uploadSingle, uploadMultiple, uploadFields };