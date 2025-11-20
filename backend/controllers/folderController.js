const Folder = require('../models/Folder');
const File = require('../models/File');
const path = require('path');

// @desc    Create folder
// @route   POST /api/folders
// @access  Private
exports.createFolder = async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;

    let folderPath = name;
    let parentFolder = null;

    if (parentFolderId) {
      parentFolder = await Folder.findById(parentFolderId);
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      folderPath = `${parentFolder.path}/${name}`;
    }

    const folder = await Folder.create({
      name,
      path: folderPath,
      parentFolder: parentFolderId || null,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get folders
// @route   GET /api/folders
// @access  Private
exports.getFolders = async (req, res) => {
  try {
    const { parentFolderId } = req.query;

    const query = {
      owner: req.user._id,
      parentFolder: parentFolderId || null,
    };

    const folders = await Folder.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      folders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single folder
// @route   GET /api/folders/:id
// @access  Private
exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check ownership or admin/manager access
    if (
      folder.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Private
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check ownership or admin access
    if (
      folder.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all files in folder
    await File.deleteMany({ folder: folder._id });

    // Delete all subfolders recursively
    const deleteSubfolders = async (folderId) => {
      const subfolders = await Folder.find({ parentFolder: folderId });
      for (const subfolder of subfolders) {
        await File.deleteMany({ folder: subfolder._id });
        await deleteSubfolders(subfolder._id);
        await subfolder.deleteOne();
      }
    };

    await deleteSubfolders(folder._id);
    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Folder deleted',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename folder
// @route   PUT /api/folders/:id
// @access  Private
exports.renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check ownership or admin/manager access
    if (
      folder.owner.toString() !== req.user._id.toString() &&
      !['Admin', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update path
    let newPath = name;
    if (folder.parentFolder) {
      const parentFolder = await Folder.findById(folder.parentFolder);
      newPath = `${parentFolder.path}/${name}`;
    }

    folder.name = name;
    folder.path = newPath;
    await folder.save();

    res.status(200).json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
