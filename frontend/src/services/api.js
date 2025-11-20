import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Files API
export const filesAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFiles: (folderId, search) => {
    const params = {};
    if (folderId) params.folderId = folderId;
    if (search) params.search = search;
    return api.get('/files', { params });
  },
  getFile: (id) => api.get(`/files/${id}`),
  downloadFile: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  previewFile: (id) => `${API_URL}/files/${id}/preview?token=${localStorage.getItem('token')}`,
  renameFile: (id, name) => api.put(`/files/${id}`, { name }),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

// Folders API
export const foldersAPI = {
  createFolder: (data) => api.post('/folders', data),
  getFolders: (parentFolderId) => {
    const params = {};
    if (parentFolderId) params.parentFolderId = parentFolderId;
    return api.get('/folders', { params });
  },
  getFolder: (id) => api.get(`/folders/${id}`),
  renameFolder: (id, name) => api.put(`/folders/${id}`, { name }),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
};

export default api;
