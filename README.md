# 📦 Storigo - Progressive Web Application

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [🐳 Docker Production Setup](#-docker-production-setup)
  - [🔧 Docker Development Setup](#-docker-development-setup)
  - [💻 Local Development Setup](#-local-development-setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Storigo** is a full-stack Progressive Web Application designed for secure storage and sharing of multimedia resources including photos, videos, and various file types. The system enables users to manage their own resources and share them with other registered users.

### Key Highlights

- 🚀 **Progressive Web App** - Installable, offline-capable, and responsive
- 📤 **Large File Support** - Efficient upload of files up to 4GB using chunked upload
- 🎬 **Video Processing** - Automatic HLS conversion for optimized video streaming
- 🔒 **Secure Storage** - Azure Blob Storage integration with SAS (Shared Access Signature) tokens
- 👥 **File Sharing** - Share files with other registered users
- 🌍 **Internationalization** - Multi-language support

---

## ✨ Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, User)
  - Secure password management

- **📁 File Management**
  - Upload files up to 4GB with chunked upload support
  - Direct upload to Azure Blob Storage
  - File listing with pagination, sorting, and search
  - File metadata management
  - Folder organization

- **🎥 Video Features**
  - Video streaming with HLS support
  - Automatic MP4 to HLS conversion
  - Quality optimization for different devices

- **🔗 File Sharing**
  - Share files with specific users
  - Access control and permissions
  - Shared files visibility

- **📱 Progressive Web App**
  - Offline support with service workers
  - Installable on mobile and desktop
  - Responsive design

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   Frontend      │
│  React + Vite   │
│   (PWA)         │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│   Backend API   │
│  ASP.NET Core   │
│   (C# + F#)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────────┐
│ SQL   │ │   Azure     │
│Server │ │ Blob Storage│
└───────┘ └─────────────┘
```

### Azure Integration

The application leverages **Azure Blob Storage** for file storage:

- **Direct Upload**: Files are uploaded directly to Azure Blob Storage using SAS URLs, reducing backend load
- **SAS Tokens**: Secure, time-limited access tokens for upload and download operations
- **Chunked Upload**: Large files are split into blocks (4MB chunks) and uploaded using Azure's PutBlock/PutBlockList API
- **User Isolation**: Files are organized by user ID and file ID in the blob storage structure: `{userId}/{fileId}/{fileName}`

### Backend Architecture

The backend follows a **layered architecture**:

- **Domain Layer** (F#): Core domain models and business logic
- **Application Layer** (C#): Services, DTOs, and business logic implementation
- **Infrastructure Layer** (C#): Data access (Entity Framework), Azure services
- **Web Layer** (C#): Controllers, API endpoints, authentication

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **i18next** - Internationalization
- **Vite PWA Plugin** - PWA capabilities
- **HLS.js** - Video streaming
- **Axios** - HTTP client

### Backend
- **ASP.NET Core 8.0** - Web framework
- **F#** - Domain modeling
- **C#** - Implementation
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT Bearer** - Authentication
- **Swagger/OpenAPI** - API documentation

### Infrastructure
- **Azure Blob Storage** - File storage
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server

---

## 📂 Project Structure

```
projekt-inzynierski-pwa/
│
├── 📁 frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── api/                   # API client configuration
│   │   ├── components/            # React components
│   │   ├── context/               # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Page components
│   │   ├── services/              # Business logic services
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/                 # Utility functions
│   ├── public/                    # Static assets
│   ├── Dockerfile                 # Frontend Docker image
│   └── package.json
│
├── 📁 backend/                     # ASP.NET Core backend
│   ├── PwaApp.Domain/             # F# domain models
│   │   ├── User.fs
│   │   ├── File.fs
│   │   ├── Folder.fs
│   │   └── ...
│   │
│   ├── PwaApp.Application/        # Application layer (C#)
│   │   ├── DTO/                   # Data Transfer Objects
│   │   ├── Interfaces/            # Service interfaces
│   │   ├── Services/              # Business logic services
│   │   └── Validation/            # Validation attributes
│   │
│   ├── PwaApp.Infrastructure/     # Infrastructure layer (C#)
│   │   ├── Data/                  # DbContext and migrations
│   │   └── Services/              # Azure Blob Service
│   │
│   ├── PwaApp.Web/                # Web API layer (C#)
│   │   ├── Controllers/           # API controllers
│   │   ├── Converters/           # JSON converters
│   │   └── Program.cs             # Application entry point
│   │
│   └── backend.Test/              # Integration tests
│
└── 📁 docker/                      # Docker configurations
    ├── dev/                       # Development docker-compose
    └── prod/                      # Production docker-compose
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** and **Docker Compose** (for containerized setup)
- **.NET 8.0 SDK** (for local backend development)
- **Node.js 18+** (for local frontend development)
- **SQL Server** (for local development, or use Docker)
- **Azure Storage Account** with Blob Storage container

---

## 🚀 Getting Started

### 🐳 Docker Production Setup

This setup uses pre-built Docker images from GitHub Container Registry.

1. **Navigate to the production directory:**
   ```bash
   cd docker/prod
   ```

2. **Create a `.env` file** with the following variables:
   ```env
   # Database
   SA_PASSWORD=YourStrongPassword123!

   # JWT Configuration
   JWT_SECRET=YourVeryLongSecretKeyAtLeast64CharactersLongForSecurityPurposes
   JWT_ISSUER=PwaApp
   JWT_AUDIENCE=PwaAppUsers

   # Azure Storage
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
   AZURE_STORAGE_CONTAINER_NAME=uploads
   ```

3. **Start the services:**
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5105
   - Swagger UI: http://localhost:5105/swagger

### 🔧 Docker Development Setup

This setup builds Docker images locally from source code.

1. **Navigate to the development directory:**
   ```bash
   cd docker/dev
   ```

2. **Create a `.env` file** with the same variables as production:
   ```env
   SA_PASSWORD=YourStrongPassword123!
   JWT_SECRET=YourVeryLongSecretKeyAtLeast64CharactersLongForSecurityPurposes
   JWT_ISSUER=PwaApp
   JWT_AUDIENCE=PwaAppUsers
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
   AZURE_STORAGE_CONTAINER_NAME=uploads
   API_BASE_URL=http://localhost:5105
   VITE_CHUNK_SIZE=4
   VITE_CHUNK_THRESHOLD=4
   ```

3. **Start the services:**
   ```bash
   docker-compose -f docker-compose.dev.yaml up -d --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5105
   - Swagger UI: http://localhost:5105/swagger

### 💻 Local Development Setup

#### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure the database connection** in `PwaApp.Web/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=PwaApp;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

3. **Configure Azure Storage** in `appsettings.json`:
   ```json
   {
     "AzureStorage": {
       "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
       "ContainerName": "uploads"
     }
   }
   ```

4. **Restore dependencies and run migrations:**
   ```bash
   dotnet restore
   dotnet ef database update --project PwaApp.Infrastructure --startup-project PwaApp.Web
   ```

5. **Run the backend:**
   ```bash
   cd PwaApp.Web
   dotnet run
   ```

   The API will be available at `http://localhost:5105` (or the port specified in `launchSettings.json`).

#### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** (optional, for environment-specific config):
   ```env
   VITE_API_BASE_URL=http://localhost:5105
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

5. **For PWA features** (service worker, offline support), build and preview:
   ```bash
   npm run build
   npm run preview
   ```

---

## ⚙️ Configuration

### Environment Variables

#### Backend
- `ConnectionStrings__DefaultConnection` - SQL Server connection string
- `AppSettings__JwtSecret` - JWT signing key (minimum 64 characters)
- `AppSettings__JwtIssuer` - JWT issuer
- `AppSettings__JwtAudience` - JWT audience
- `AzureStorage__ConnectionString` - Azure Blob Storage connection string
- `AzureStorage__ContainerName` - Azure Blob Storage container name

#### Frontend
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_CHUNK_SIZE` - Chunk size for file uploads (default: 4MB)
- `VITE_CHUNK_THRESHOLD` - File size threshold for chunked upload (default: 4MB)

### Azure Blob Storage Setup

1. Create an Azure Storage Account
2. Create a Blob Storage container (e.g., `uploads`)
3. Obtain the connection string from Azure Portal
4. Configure the connection string in your environment variables or `appsettings.json`

---

## 📚 API Documentation

When running the backend in Development mode, Swagger UI is available at:
- **Swagger UI**: `http://localhost:5105/swagger`

### Main API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get JWT tokens
  - `POST /api/auth/refresh` - Refresh access token

- **Files**
  - `GET /api/file/generate-upload-link` - Get SAS URL for file upload
  - `POST /api/file/commit` - Commit uploaded file metadata
  - `GET /api/files` - List user's files (with pagination, sorting, search)
  - `GET /api/files/{id}` - Get file details and download URL
  - `DELETE /api/files/{id}` - Delete a file
  - `POST /api/files/{id}/share` - Share file with another user

- **Folders**
  - `GET /api/folder` - List folders
  - `POST /api/folder` - Create folder
  - `DELETE /api/folder/{id}` - Delete folder

- **Streaming**
  - `GET /api/stream/{fileId}` - Stream video file (HLS support)

For detailed API documentation, see the [backend README](backend/README.MD).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is part of an engineering thesis project.