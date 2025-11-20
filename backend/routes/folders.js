const express = require('express');
const router = express.Router();
const {
  createFolder,
  getFolders,
  getFolder,
  deleteFolder,
  renameFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createFolder).get(protect, getFolders);

router
  .route('/:id')
  .get(protect, getFolder)
  .put(protect, renameFolder)
  .delete(protect, deleteFolder);

module.exports = router;
