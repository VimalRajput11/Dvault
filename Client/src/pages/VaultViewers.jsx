// src/pages/VaultViewer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import {
  ArrowLeft, Upload, Search, Grid, List, File, FileText, Image, Video, Music,
  Archive, Download, Trash2, Eye, HardDrive, Lock, Users, Shield, Globe,
} from "lucide-react";
import Header from "../components/Header.jsx";
import DocumentViewer from "../components/DocumentViewer.jsx";
import { useAuth } from '../contexts/AuthContext.jsx';
import { vaultAPI } from '../api/vaultAPI.js';

const icons = { pdf: FileText, document: FileText, image: Image, video: Video, audio: Music, archive: Archive, default: File };
const colors = { pdf: "text-red-500", document: "text-blue-500", image: "text-green-500", video: "text-purple-500", audio: "text-yellow-500", archive: "text-orange-500", default: "text-gray-500" };
const statusMap = {
  secure: { icon: Shield, label: "Encrypted & Private", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
  shared: { icon: Users, label: "Shared with Others", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  public: { icon: Globe, label: "Public Access", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
};

export default function VaultViewer() {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const wallet=user.wallet

  const [vault, setVault] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [fileToDelete, setFileToDelete] = useState(null);


 useEffect(() => {
  if (wallet) {
    fetchVaultData();
  }
}, [vaultId, wallet]);

  const fetchVaultData = async () => {
    setIsLoading(true);
    try {
      const v = await vaultAPI.getVault(vaultId);
      setVault(v.data);
      const f = await vaultAPI.getFiles(vaultId);
      
     const norm = f.data.map((fi) => ({
  ...fi,
  sizeLabel: fi.sizeLabel || bytesToHuman(fi.size),
  status: fi.status || 'secure',
  url: `https://ipfs.io/ipfs/${fi.cid}`, 
  fileUrl: `https://ipfs.io/ipfs/${fi.cid}`, 
  
}));

      setFiles(norm);
    } catch (error) {
      console.error('Failed to fetch vault data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bytesToHuman = (bytes = 0) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      case 'size':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });

  const handleFileView = (file) => {
    setSelectedFile(file);
    setShowDocumentViewer(true);
  };

  const handleDownloadFile = async (file, event) => {
    if (event) event.stopPropagation();
    try {
      const res = await vaultAPI.downloadFile(vaultId, file.fileIdx);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
       toast.success(`"${file.name}" downloaded successfully`);
    } catch (err) {
       toast.error("Failed to download file");
  
    }
  };

  const handleDeleteFile = async () => {
  if (!fileToDelete) return;
  try {
    await vaultAPI.deleteFile(vaultId, fileToDelete.fileIdx);
    setFiles(prev => prev.filter(file => file.fileIdx !== fileToDelete.fileIdx));
    toast.success(`"${fileToDelete.name}" deleted successfully`);
  } catch (err) {
    toast.error("Delete failed");
  } finally {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }
};


  const handleUpload = () => {
    navigate(`/vault/${vaultId}/upload`);
  };

    if (isLoading) {
  return (
    <div className="min-h-screen relative text-gray-900 dark:text-white">
      {/* Background Gradient Same as VaultViewer */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 opacity-90 z-0"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Vault Viewer...</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 opacity-90"></div>
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6">

              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {vault?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {vault?.description}
                </p>
              </div>
              <button
                onClick={handleUpload}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-white shadow-lg hover:shadow-cyan-500/25"
              >
                <Upload className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
                <span>Upload Files</span>
              </button>
            </div>
            {/* Vault Stats */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-8 w-8 text-cyan-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{bytesToHuman(files.reduce((s, f) => s + (f?.size || 0), 0))}
</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Used Space</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{files.length}
</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <Lock className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{vault?.encryptionLevel || "AES-256"}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Encryption</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{vault?.accessType || "Private"}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Access Type</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Controls Section */}
          <div className="flex flex-col sm:flex-col md:flex-row gap-4 w-full">
  {/* Search Input */}
  <div className="w-full md:max-w-md relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search files..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
    />
  </div>

  {/* Filter + Sort + View Mode (Stacked and Wrapping) */}
  <div className="flex flex-wrap items-center gap-2 sm:justify-start md:justify-end w-full">
    <select
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
    >
      <option value="all">All Files</option>
      <option value="document">Documents</option>
      <option value="image">Images</option>
      <option value="video">Videos</option>
      <option value="audio">Audio</option>
      <option value="archive">Archives</option>
    </select>

    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
    >
      <option value="name">Sort by Name</option>
      <option value="date">Sort by Date</option>
      <option value="size">Sort by Size</option>
    </select>

    {/* View Mode Toggle */}
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg transition-all duration-300 ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-gray-600 text-cyan-500 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Grid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg transition-all duration-300 ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-600 text-cyan-500 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  </div>
</div>

          {/* Files Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {sortedFiles.length === 0 ? (
              <div className="text-center py-20">
                <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No files found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
                </p>
                <button
                  onClick={handleUpload}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 text-white"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Files</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFiles.map((file) => {
                  const Icon = icons[file.type] || icons.default;
                  const st = statusMap[file.status] || statusMap.secure;
                  return (
                    <div
                      key={file.fileIdx}
                      className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 hover:border-cyan-300 hover:shadow-lg"
                    >
                      {/* Action Buttons - Top Right */}
                      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFileView(file); }}
                          className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all duration-300"
                          title="View file"
                        >
                          <Eye className="h-4 w-4 text-cyan-500" />
                        </button>
                        <button
                          onClick={(e) => handleDownloadFile(file, e)}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all duration-300"
                          title="Download file"
                        >
                          <Download className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                        onClick={(e) => {e.stopPropagation();setFileToDelete(file);setDeleteModalOpen(true);}}

                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-300"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center mb-3">
                        <Icon className={`h-12 w-12 ${colors[file.type] || colors.default}`} />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate text-center">{file.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">{file.sizeLabel}</p>
                      <div className="flex justify-center mb-2">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                          <st.icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{st.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center">{new Date(file.uploadDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedFiles.map((file) => {
                  const Icon = icons[file.type] || icons.default;
                  const st = statusMap[file.status] || statusMap.secure;
                  return (
                    <div
                      key={file.fileIdx}
                      className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <Icon className={`h-8 w-8 ${colors[file.type] || colors.default}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{file.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{file.sizeLabel} • {new Date(file.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                          <st.icon className="h-3 w-3" />
                          <span className="hidden md:inline">{st.label}</span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => handleFileView(file)} className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/20 rounded-lg transition-colors duration-300" title="View file">
                            <Eye className="h-4 w-4 text-cyan-500" />
                          </button>
                          <button onClick={(e) => handleDownloadFile(file, e)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-300" title="Download file">
                            <Download className="h-4 w-4 text-blue-500" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.fileIdx, file.name); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300" title="Delete file">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        file={selectedFile}
        onDownload={handleDownloadFile}
      />
      <ConfirmDeleteModal
  isOpen={deleteModalOpen}
  fileName={fileToDelete?.name}
  onCancel={() => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }}
  onConfirm={handleDeleteFile}
/>

    </div>
    

  );
}

/* Reusable Subcomponents */

const StatCard = ({ icon: Icon, color, value, label }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
    <div className="flex items-center gap-3">
      <Icon className={`h-8 w-8 ${color}`} />
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      </div>
    </div>
  </div>
);

const ControlsBar = ({ searchTerm, setSearchTerm, filterType, setFilterType, sortBy, setSortBy, viewMode, setViewMode }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border mb-6">
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search files..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
      </div>
      <div className="flex items-center space-x-3">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white">
          <option value="all">All Files</option>
          <option value="document">Documents</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="archive">Archives</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white">
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
          <option value="size">Sort by Size</option>
        </select>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-cyan-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><Grid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-cyan-500 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><List className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  </div>
);

const FilesPanel = ({ viewMode, files, handleFileView, handleDownloadFile, handleDeleteFile }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-20">
        <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No files found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {searchTerm ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
        </p>
        <button
          onClick={handleUpload}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 text-white"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Files</span>
        </button>
      </div>
    );
  }

  const GridCard = ({ file }) => {
    const Icon = icons[file.type] || icons.default;
    const st = statusMap[file.status] || statusMap.secure;
    return (
      <div className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 hover:border-cyan-300 hover:shadow-lg">
        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); handleFileView(file); }}
            className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all duration-300"
            title="View file"
          >
            <Eye className="h-4 w-4 text-cyan-500" />
          </button>
          <button
            onClick={(e) => handleDownloadFile(file, e)}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all duration-300"
            title="Download file"
          >
            <Download className="h-4 w-4 text-blue-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.fileIdx, file.name); }}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-300"
            title="Delete file"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        <div className="flex items-center justify-center mb-3">
          <Icon className={`h-12 w-12 ${colors[file.type] || colors.default}`} />
        </div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate text-center">{file.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">{file.sizeLabel}</p>
        <div className="flex justify-center mb-2">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
            <st.icon className="h-3 w-3" />
            <span className="hidden sm:inline">{st.label}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">{new Date(file.uploadDate).toLocaleDateString()}</p>
      </div>
    );
  };

  const ListRow = ({ file }) => {
    const Icon = icons[file.type] || icons.default;
    const st = statusMap[file.status] || statusMap.secure;
    return (
      <div className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300">
        <div className="flex items-center space-x-4 flex-1">
          <Icon className={`h-8 w-8 ${colors[file.type] || colors.default}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{file.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{file.sizeLabel} • {new Date(file.uploadDate).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
            <st.icon className="h-3 w-3" />
            <span className="hidden md:inline">{st.label}</span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => handleFileView(file)} className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/20 rounded-lg transition-colors duration-300" title="View file">
              <Eye className="h-4 w-4 text-cyan-500" />
            </button>
            <button onClick={(e) => handleDownloadFile(file, e)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-300" title="Download file">
              <Download className="h-4 w-4 text-blue-500" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.fileIdx, file.name); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300" title="Delete file">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return viewMode === 'list'
    ? <div className="divide-y divide-gray-200 dark:divide-gray-700">{files.map((f) => <ListRow key={f.fileIdx} file={f} />)}</div>
    : <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{files.map((f) => <GridCard key={f.fileIdx} file={f} />)}</div>;
};

// 


