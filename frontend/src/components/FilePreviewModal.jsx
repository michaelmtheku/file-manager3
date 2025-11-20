import React from 'react';
import { X } from 'lucide-react';
import { filesAPI } from '../services/api';

const FilePreviewModal = ({ file, onClose }) => {
  const isImage = file.mimeType.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf';
  const isText = file.mimeType.startsWith('text/');

  const previewUrl = filesAPI.previewFile(file._id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{file.originalName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <img
              src={previewUrl}
              alt={file.originalName}
              className="max-w-full h-auto mx-auto"
            />
          )}
          {isPDF && (
            <iframe
              src={previewUrl}
              className="w-full h-[600px] border-0"
              title={file.originalName}
            />
          )}
          {isText && (
            <iframe
              src={previewUrl}
              className="w-full h-[600px] border border-gray-300 rounded"
              title={file.originalName}
            />
          )}
          {!isImage && !isPDF && !isText && (
            <div className="text-center text-gray-500 py-8">
              <p>Preview not available for this file type</p>
              <p className="text-sm mt-2">Type: {file.mimeType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
