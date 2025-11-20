const File = require('../models/File');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs').promises;

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { folderId } = req.body;

    // Verify folder exists if provided
    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }

    const file = await File.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      folder: folderId || null,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get files
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res) => {
  try {
    const { folderId, search } = req.query;

    let query = { owner: req.user._id };

    if (folderId) {
      query.folder = folderId;
    } else {
      query.folder = null;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
      ];
    }

    const files = await File.find(query).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
exports.getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or admin/manager access
    if (
      file.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or admin/manager access
    if (
      file.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or admin access
    if (
      file.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error('Error deleting file from filesystem:', err);
    }

    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: 'File deleted',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename file
// @route   PUT /api/files/:id
// @access  Private
exports.renameFile = async (req, res) => {
  try {
    const { name } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or admin/manager access
    if (
      file.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    file.originalName = name;
    await file.save();

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Preview file
// @route   GET /api/files/:id/preview
// @access  Private
exports.previewFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or admin/manager access
    if (
      file.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Set content type
    res.setHeader('Content-Type', file.mimeType);
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
