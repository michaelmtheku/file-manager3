# File Manager System

A comprehensive web-based file management system built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## Features

### File Management
- **Upload Files**: Upload files with drag-and-drop support (50MB limit)
- **Download Files**: Download files to your local system
- **Preview Files**: Preview images, PDFs, and text files in-browser
- **Rename Files**: Rename files with a simple interface
- **Delete Files**: Delete files with confirmation
- **Search**: Search files by name

### Folder Management
- **Create Folders**: Create nested folders
- **Navigate Folders**: Navigate through folder hierarchy with breadcrumbs
- **Rename Folders**: Rename folders easily
- **Delete Folders**: Delete folders and all their contents

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three roles with different permissions
  - **Admin**: Full access - can delete any files/folders
  - **Manager**: Can view, upload, rename files/folders
  - **Employee**: Can view, upload, rename own files/folders

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd file-manager3
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
```bash
cd ../backend
cp .env.example .env
```

Edit `.env` and set your values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/filemanager
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system.

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get files (with optional folderId and search params)
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `GET /api/files/:id/preview` - Preview file
- `PUT /api/files/:id` - Rename file
- `DELETE /api/files/:id` - Delete file

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - Get folders (with optional parentFolderId param)
- `GET /api/folders/:id` - Get folder details
- `PUT /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Delete folder and contents

## Usage

1. **Register**: Create an account with name, email, password, and role
2. **Login**: Sign in with your credentials
3. **Upload Files**: Click "Upload File" button or drag and drop
4. **Create Folders**: Click "New Folder" to create a folder
5. **Navigate**: Click on folders to open them, use breadcrumbs to navigate back
6. **Search**: Use the search bar to find files
7. **Actions**: Use action buttons to preview, download, rename, or delete files/folders

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- Secure file upload handling
- File size limits (50MB)

## Project Structure

```
file-manager3/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── folderController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── File.js
│   │   └── Folder.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── files.js
│   │   └── folders.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileExplorer.jsx
│   │   │   ├── FilePreviewModal.jsx
│   │   │   ├── UploadModal.jsx
│   │   │   ├── CreateFolderModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Security Considerations

This is a demonstration application. For production use, consider:
- Adding rate limiting middleware (e.g., express-rate-limit) to prevent abuse
- Improving email validation regex to avoid ReDoS
- Adding CORS configuration for specific origins
- Using environment-specific secrets
- Implementing file type validation beyond MIME types
- Adding virus scanning for uploads
- Setting up HTTPS

## License

ISC
