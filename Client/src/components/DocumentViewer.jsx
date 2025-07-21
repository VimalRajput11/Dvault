import React, { useState, useEffect, useRef } from "react";
import {
  X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, FileText, Image, Video, Music, File,
  Play, Pause, Volume2, VolumeX, Shield, Lock, Calendar, HardDrive
} from "lucide-react";

/* ---------- helpers ---------- */
const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};
const formatTime = (t = 0) => {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function DocumentViewer({ isOpen, onClose, file, onDownload }) {
  /* ---------- generic viewer state ---------- */
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---------- audio state & refs ---------- */
  const audioRef = useRef(null);
  const audioProgressBarRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  /* ---------- video state & refs ---------- */
  const videoRef = useRef(null);
  const videoProgressBarRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  /* ---------- pdf page state ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5); // mock

  /* ---------- side‑effects ---------- */
  useEffect(() => {
    // lock body scroll
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    const onEsc = (e) => e.key === "Escape" && isOpen && onClose();
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", onEsc);
    };
  }, [isOpen, onClose]);

  // audio play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    audioPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [audioPlaying]);

  // audio mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = audioMuted;
  }, [audioMuted]);

  if (!isOpen || !file) return null;

  /* ---------- common controls ---------- */
  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const iconMap = { pdf: FileText, document: FileText, image: Image, video: Video, audio: Music };
  const FileIcon = iconMap[file.type] || File;
  const fileUrl = file.url || file.blobUrl || "";

  /* ---------- seek helpers (shareable) ---------- */
  const makeSeekHandlers = (mediaRef, setProgress, progressBarRef) => ({
    onPointerDown: (e) => {
      const seek = (ev) => {
        const bar = progressBarRef.current;
        const media = mediaRef.current;
        if (!bar || !media || !media.duration) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.min(Math.max(0, (ev.clientX - rect.left) / rect.width), 1);
        media.currentTime = pct * media.duration;
        setProgress(pct * 100);
      };
      seek(e);
      const move = (ev) => seek(ev);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
  });

  /* ---------- main content renderer ---------- */
  const renderFileContent = () => {
    switch (file.type) {
      /* ----- IMAGE ----- */
      case "image":
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={file.name}
              className="transition-all duration-300 max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
              draggable={false}
            />
          </div>
        );

      /* ----- VIDEO ----- */
      case "video":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative group bg-black rounded-lg overflow-hidden shadow-2xl max-w-full max-h-full w-[700px]">
              <video
                ref={videoRef}
                className="w-full"
                src={fileUrl}
                poster={file.thumbnailUrl}
                muted={videoMuted}
                onTimeUpdate={() => {
                  const v = videoRef.current;
                  if (!v || !v.duration) return;
                  setVideoProgress((v.currentTime / v.duration) * 100);
                }}
                onEnded={() => setVideoPlaying(false)}
              />
              {/* Controls on hover */}
              <div className="absolute bottom-0 w-full bg-black/50 p-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress bar */}
                <div
                  ref={videoProgressBarRef}
                  {...makeSeekHandlers(videoRef, setVideoProgress, videoProgressBarRef)}
                  className="w-full bg-white/30 rounded-full h-2 cursor-pointer"
                >
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${videoProgress}%` }} />
                </div>
                {/* Buttons + Time */}
                <div className="flex items-center justify-between text-white text-sm">
                  <button
                    onClick={() => {
                      const v = videoRef.current;
                      if (!v) return;
                      v.paused ? v.play() : v.pause();
                      setVideoPlaying(!v.paused);
                    }}
                    className="p-2 rounded-full hover:bg-white/10"
                  >
                    {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 text-center">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}
                  </div>
                  <button
                    onClick={() => {
                      const v = videoRef.current;
                      if (!v) return;
                      v.muted = !videoMuted;
                      setVideoMuted(!videoMuted);
                    }}
                    className="p-2 rounded-full hover:bg-white/10"
                  >
                    {videoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      /* ----- AUDIO ----- */
      case "audio":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative group bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-12 text-white text-center shadow-2xl max-w-md w-full">
              <Music className="h-24 w-24 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2 truncate">{file.name}</h3>
              <p className="text-purple-100 mb-8">Audio File</p>

              <audio
                ref={audioRef}
                src={fileUrl}
                onTimeUpdate={() => {
                  const a = audioRef.current;
                  if (!a || !a.duration) return;
                  setAudioProgress((a.currentTime / a.duration) * 100);
                }}
                onEnded={() => setAudioPlaying(false)}
              />

              {/* Hover-only controls */}
              <div className="space-y-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setAudioPlaying((p) => !p)}
                    className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    {audioPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div
                  ref={audioProgressBarRef}
                  {...makeSeekHandlers(audioRef, setAudioProgress, audioProgressBarRef)}
                  className="w-full bg-white/30 rounded-full h-2 cursor-pointer"
                >
                  <div className="bg-white h-2 rounded-full" style={{ width: `${audioProgress}%` }} />
                </div>

                <div className="flex items-center justify-between text-sm font-mono">
                  <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <button
                    onClick={() => setAudioMuted((m) => !m)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <span>{formatTime(audioRef.current?.duration || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      /* ----- PDF / DOC ----- */
      case "pdf":
      case "document":
        return fileUrl ? (
          <iframe src={fileUrl} title={file.name} className="w-full h-full rounded-lg shadow-2xl" />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">{currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div className="bg-white shadow-2xl" style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}>
                <div className="w-[600px] h-[800px] p-8 text-gray-800">
                  <h1 className="text-2xl font-bold mb-4">Document Preview</h1>
                  <p className="text-gray-600">{file.name}</p>
                </div>
              </div>
            </div>
          </div>
        );

      /* ----- FALLBACK ----- */
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <File className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">File Preview Not Available</h3>
              <p className="text-gray-600 mb-6">This file type cannot be previewed in the browser.</p>
              <button
                onClick={() => onDownload(file)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white">
                <Download className="h-5 w-5" /><span>Download to View</span>
              </button>
            </div>
          </div>
        );
    }
  };

  /* ---------- viewer shell ---------- */
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300
        ${isFullscreen ? "w-full h-full" : "w-[95vw] h-[95vh] max-w-7xl"}`}>
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <FileIcon className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold truncate max-w-md">{file.name}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1"><HardDrive className="h-4 w-4" /><span>{formatBytes(file.size)}</span></div>
                <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{new Date(file.uploadDate).toLocaleDateString("en-GB")}</span></div>
                <div className="flex items-center space-x-1"><Shield className="h-4 w-4 text-green-500" /><span>Encrypted</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {(file.type === "image" || file.type === "pdf" || file.type === "document") && (
              <>
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><ZoomOut className="h-4 w-4" /></button>
                <span className="min-w-[3rem] text-center text-sm">{zoom}%</span>
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><ZoomIn className="h-4 w-4" /></button>
              </>
            )}
            {file.type === "image" && (
              <button onClick={handleRotate} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><RotateCw className="h-4 w-4" /></button>
            )}
            <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={() => onDownload(file)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"><Download className="h-4 w-4 text-blue-500" /></button>
            <button onClick={onClose} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"><X className="h-4 w-4 text-red-500" /></button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden" style={{ height: "calc(100% - 88px)" }}>
          {renderFileContent()}
        </div>

        <div className="absolute bottom-6 left-6">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Securely Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
