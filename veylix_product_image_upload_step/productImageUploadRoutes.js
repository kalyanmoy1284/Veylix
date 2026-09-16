const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

const allowedAdminRoles = [
  "admin",
  "manager",
  "employee",
];

const uploadDirectory = path.join(
  __dirname,
  "../uploads/products"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extension =
      path.extname(file.originalname).toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
    callback(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(
        new Error("Only image files are allowed.")
      );
    }

    callback(null, true);
  },
});

router.post(
  "/product-image",
  authenticateToken,
  (req, res, next) => {
    if (
      req.user?.accountType !== "admin" ||
      !allowedAdminRoles.includes(req.user?.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access is required.",
      });
    }

    next();
  },
  (req, res) => {
    upload.single("image")(req, res, (uploadError) => {
      if (uploadError) {
        console.error("Product image upload error:", uploadError);

        return res.status(400).json({
          success: false,
          message:
            uploadError.code === "LIMIT_FILE_SIZE"
              ? "Image must be 5 MB or smaller."
              : uploadError.message || "Image upload failed.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image file.",
        });
      }

      const publicUrl = `/uploads/products/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        message: "Product image uploaded successfully.",
        url: publicUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  }
);

module.exports = router;
