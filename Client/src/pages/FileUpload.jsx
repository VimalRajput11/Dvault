// src/pages/FileUpload.jsx
import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  Cloud,
  Shield,
  Zap,
  FileText,
  Image,
  Video,
  Music,
  Archive,
} from "lucide-react";
import Header from "../components/Header.jsx";
import { vaultAPI } from "../api/vaultAPI.js";

const FileUpload = () => {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* ───────── Drag & Drop Handlers ───────── */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };
  const handleChange = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  /* ───────── File Helpers ───────── */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const idx = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** idx).toFixed(2)} ${units[idx]}`;
  };

  const getFileType = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "avi", "mov", "wmv"].includes(ext)) return "video";
    if (["mp3", "wav", "flac", "aac"].includes(ext)) return "audio";
    if (["zip", "rar", "7z", "tar"].includes(ext)) return "archive";
    if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "document";
    return "file";
  };

  const getFileIcon = (t) =>
    ({ document: FileText, image: Image, video: Video, audio: Music, archive: Archive }[t] ||
      File);

  const getFileTypeColor = (t) =>
    ({
      document: "text-blue-500",
      image: "text-green-500",
      video: "text-purple-500",
      audio: "text-yellow-500",
      archive: "text-orange-500",
    }[t] || "text-gray-500");

  /* ───────── Add Selected Files ───────── */
  const handleFiles = (list) => {
    const additions = Array.from(list).map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...additions]);
  };

  const removeFile = (id) => setFiles((p) => p.filter((f) => f.id !== id));

  /* ───────── Upload Loop ───────── */
  const uploadFiles = async () => {
    setUploading(true);
    for (const f of files) {
      if (f.status !== "pending") continue;

      setFiles((p) => p.map((x) => (x.id === f.id ? { ...x, status: "uploading" } : x)));

      try {
        await vaultAPI.uploadFile(vaultId, [f.file], {
          onUploadProgress: ({ loaded, total }) => {
            const pct = Math.round((loaded * 100) / total);
            setFiles((p) =>
              p.map((x) => (x.id === f.id ? { ...x, progress: pct } : x))
            );
          },
        });

        setFiles((p) =>
          p.map((x) =>
            x.id === f.id ? { ...x, status: "completed", progress: 100 } : x
          )
        );
      } catch (err) {
        console.error(err);
        setFiles((p) => p.map((x) => (x.id === f.id ? { ...x, status: "failed" } : x)));
      }
    }
    setUploading(false);
    setTimeout(() => navigate(`/vault/${vaultId}`), 1500);
  };

  const browseClick = () => fileInputRef.current?.click();

  /* ───────── JSX ───────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 opacity-90"></div>
      <div className="relative z-10">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate(`/vault/${vaultId}`)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Upload Files
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Securely upload files to your vault with end-to-end encryption
              </p>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">AES-256 Encryption</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Military-grade security</div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Cloud className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Decentralized Storage</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Distributed across nodes</div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Instant Access</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fast retrieval anytime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleChange}
                className="hidden"
              />
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full opacity-75 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Support for all file types • Maximum 100MB per file
                  </p>
                  <button
                    onClick={browseClick}
                    className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-white shadow-lg hover:shadow-cyan-500/25"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Choose Files</span>
                  </button>
                </div>
              </div>
            </div>
            {/* File List */}
            {files.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Files to Upload ({files.length})
                  </h4>
                  {files.some(f => f.status === 'pending') && (
                    <button
                      onClick={uploadFiles}
                      disabled={uploading}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Upload All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                      >
                        <FileIcon className={`h-8 w-8 ${getFileTypeColor(file.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </h5>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {file.size}
                            </span>
                          </div>
                          {file.status === 'uploading' && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="flex items-center space-x-2 text-green-500">
                              <Check className="h-4 w-4" />
                              <span className="text-sm">Upload completed</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'completed' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : file.status === 'uploading' ? (
                            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                          ) : (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Upload Guidelines */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Upload Guidelines
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Maximum file size: 100MB per file</li>
                  <li>• All file types are supported</li>
                  <li>• Files are automatically encrypted with AES-256</li>
                  <li>• Upload progress is saved if connection is interrupted</li>
                  <li>• Duplicate files will be automatically renamed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
