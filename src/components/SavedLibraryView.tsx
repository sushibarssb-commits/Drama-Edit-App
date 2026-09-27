import React, { useState } from 'react';
import {
  Trash2,
  Download,
  Play,
  Film,
  HardDrive,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { SavedVideoRecord } from '../utils/db';
import { triggerFileDownload } from '../utils/videoMerger';
import { translations } from '../utils/translations';

interface SavedLibraryViewProps {
  language: 'my' | 'en';
  savedVideos: SavedVideoRecord[];
  onDeleteVideo: (id: string) => void;
  onDeleteAllVideos: () => void;
  onPlayVideo: (video: SavedVideoRecord) => void;
}

export const SavedLibraryView: React.FC<SavedLibraryViewProps> = ({
  language,
  savedVideos,
  onDeleteVideo,
  onDeleteAllVideos,
  onPlayVideo,
}) => {
  const t = translations[language].libraryView;
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalBytes = savedVideos.reduce((acc, v) => acc + (v.size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  const handleConfirmDeleteSingle = (id: string) => {
    onDeleteVideo(id);
    setDeletingId(null);
  };

  const handleConfirmDeleteAll = () => {
    onDeleteAllVideos();
    setShowConfirmDeleteAll(false);
  };

  const handleCopyCaption = (video: SavedVideoRecord) => {
    const textToCopy = video.caption || `${video.startEp}-${video.endEp}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(video.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (savedVideos.length === 0) {
    return (
      <div className="space-y-4 pb-24">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-xs text-slate-400">{t.subtitle}</p>
        </div>

        <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-2">
          <Film className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">{t.emptyTitle}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t.emptyDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-xs text-slate-400">{t.subtitle}</p>
        </div>

        <button
          onClick={() => setShowConfirmDeleteAll(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold active:scale-95 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.deleteAll}</span>
        </button>
      </div>

      {/* Storage usage summary */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">{t.totalSaved}</span>
          <span className="text-lg font-black text-white tabular-nums">
            {savedVideos.length} {language === 'my' ? 'တွဲ' : 'parts'}
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">{t.totalStorage}</span>
          <span className="text-lg font-black text-blue-400 tabular-nums">
            {totalMB} MB
          </span>
        </div>
      </div>

      {/* Confirmation Modal for Delete All */}
      {showConfirmDeleteAll && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="font-semibold">{t.deleteAllConfirm}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmDeleteAll}
              className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all min-h-[40px]"
            >
              {language === 'my' ? 'ဟုတ်ကဲ့၊ အားလုံးဖျက်မည်' : 'Yes, Delete All'}
            </button>
            <button
              onClick={() => setShowConfirmDeleteAll(false)}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition-all min-h-[40px]"
            >
              {language === 'my' ? 'မဖျက်တော့ပါ' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* List of Saved Videos */}
      <div className="space-y-3">
        {savedVideos.map((video) => {
          const isDeleting = deletingId === video.id;
          const mbSize = (video.size / (1024 * 1024)).toFixed(1);
          const dateStr = new Date(video.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const caption = video.caption || `${video.startEp}-${video.endEp}`;
          const isCopied = copiedId === video.id;

          return (
            <div
              key={video.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {/* Caption badge: 1-5, 6-10 */}
                    <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40 text-xs font-bold font-mono">
                      {caption}
                    </span>

                    {/* Copy Caption button */}
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(video)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700 active:scale-95 transition-all"
                      title="Copy Caption"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Caption</span>
                        </>
                      )}
                    </button>

                    <h3 className="text-xs font-bold text-white truncate">
                      {video.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                    {video.fileName}
                  </p>
                </div>

                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {mbSize} MB
                </span>
              </div>

              {/* Metadata row */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span>{video.episodesCount} {language === 'my' ? 'ပိုင်း ပေါင်းထားသည်' : 'episodes'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.seriesName}</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Single Item Delete Confirmation */}
              {isDeleting ? (
                <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded-lg space-y-2">
                  <p className="text-[11px] text-rose-300 font-semibold">
                    {t.deleteSingleConfirm}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirmDeleteSingle(video.id)}
                      className="flex-1 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold active:scale-95 transition-all"
                    >
                      {t.deleteBtn}
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Action buttons: Play, Save to Phone, Delete */
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onPlayVideo(video)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold active:scale-95 transition-all min-h-[40px]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.playBtn}</span>
                  </button>

                  <button
                    onClick={() => triggerFileDownload(video.blob, video.fileName)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.saveToDeviceBtn}</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(video.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 active:scale-95 transition-all"
                    title={t.deleteBtn}
                    aria-label="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
