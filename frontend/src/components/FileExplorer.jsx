import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Edit2, 
  Eye, 
  FolderPlus,
  Home,
  Search
} from 'lucide-react';
import { filesAPI, foldersAPI } from '../services/api';
import FilePreviewModal from './FilePreviewModal';
import UploadModal from './UploadModal';
import CreateFolderModal from './CreateFolderModal';

const FileExplorer = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  useEffect(() => {
    loadContent();
  }, [currentFolder, searchQuery]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        filesAPI.getFiles(currentFolder, searchQuery),
        searchQuery ? { data: { folders: [] } } : foldersAPI.getFolders(currentFolder),
      ]);
      setFiles(filesRes.data.files);
      setFolders(foldersRes.data.folders || []);
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folder) => {
    setCurrentFolder(folder._id);
    setBreadcrumbs([...breadcrumbs, { id: folder._id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[index].id);
  };

  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await filesAPI.downloadFile(file._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const handleFileRename = async (file) => {
    const newName = prompt('Enter new name:', file.originalName);
    if (newName && newName !== file.originalName) {
      try {
        await filesAPI.renameFile(file._id, newName);
        loadContent();
      } catch (error) {
        console.error('Failed to rename file:', error);
        alert('Failed to rename file');
      }
    }
  };

  const handleFileDelete = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.originalName}?`)) {
      try {
        await filesAPI.deleteFile(file._id);
        loadContent();
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file');
      }
    }
  };

  const handleFolderRename = async (folder) => {
    const newName = prompt('Enter new name:', folder.name);
    if (newName && newName !== folder.name) {
      try {
        await foldersAPI.renameFolder(folder._id, newName);
        loadContent();
      } catch (error) {
        console.error('Failed to rename folder:', error);
        alert('Failed to rename folder');
      }
    }
  };

  const handleFolderDelete = async (folder) => {
    if (window.confirm(`Are you sure you want to delete ${folder.name} and all its contents?`)) {
      try {
        await foldersAPI.deleteFolder(folder._id);
        loadContent();
      } catch (error) {
        console.error('Failed to delete folder:', error);
        alert('Failed to delete folder');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setShowCreateFolder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FolderPlus size={20} />
          New Folder
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Upload size={20} />
          Upload File
        </button>
        <div className="flex-1 flex items-center gap-2 border rounded px-3 py-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="flex-1 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || 'home'}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {index === 0 ? <Home size={16} /> : crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {folders.map((folder) => (
                  <tr key={folder._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFolderClick(folder)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Folder size={20} />
                        <span>{folder.name}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(folder.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFolderRename(folder)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Rename"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleFolderDelete(folder)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {files.map((file) => (
                  <tr key={file._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <File size={20} className="text-gray-400" />
                        <span>{file.originalName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFilePreview(file)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="text-green-600 hover:text-green-800"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleFileRename(file)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Rename"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleFileDelete(file)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {folders.length === 0 && files.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      {searchQuery ? 'No files found' : 'This folder is empty'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPreview && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => {
            setShowPreview(false);
            setSelectedFile(null);
          }}
        />
      )}
      {showUpload && (
        <UploadModal
          folderId={currentFolder}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={() => {
            setShowUpload(false);
            loadContent();
          }}
        />
      )}
      {showCreateFolder && (
        <CreateFolderModal
          parentFolderId={currentFolder}
          onClose={() => setShowCreateFolder(false)}
          onCreateSuccess={() => {
            setShowCreateFolder(false);
            loadContent();
          }}
        />
      )}
    </div>
  );
};

export default FileExplorer;
