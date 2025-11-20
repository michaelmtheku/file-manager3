const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  renameFile,
  previewFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getFiles);
router.get('/:id', protect, getFile);
router.get('/:id/download', protect, downloadFile);
router.get('/:id/preview', protect, previewFile);
router.put('/:id', protect, renameFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
