import React, { useRef, useState } from 'react';
import { X, Play, Pause, Download, Volume2, VolumeX, Maximize } from 'lucide-react';
import { triggerFileDownload } from '../utils/videoMerger';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
  blob?: Blob;
  fileName?: string;
  subTitle?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  videoUrl,
  blob,
  fileName = 'video.mp4',
  subTitle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen || (!videoUrl && !blob)) return null;

  const activeUrl = videoUrl || (blob ? URL.createObjectURL(blob) : '');

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleDownload = () => {
    if (blob) {
      triggerFileDownload(blob, fileName);
    } else if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = fileName;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            {subTitle && <p className="text-xs text-slate-400 truncate">{subTitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg active:scale-95 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-black flex items-center justify-center aspect-video w-full">
          <video
            ref={videoRef}
            src={activeUrl}
            controls
            playsInline
            className="w-full h-full object-contain max-h-[55vh]"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 truncate font-mono">
            {fileName}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
