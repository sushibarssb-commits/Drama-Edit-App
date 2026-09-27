import React, { useState } from 'react';
import { EpisodeBatch } from '../types';
import {
  Play,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Archive,
  Film,
  Trash2,
  FolderDown,
  BookmarkCheck,
  Copy,
  Check,
} from 'lucide-react';
import { triggerFileDownload } from '../utils/videoMerger';
import { translations } from '../utils/translations';

interface ProcessingQueueViewProps {
  language: 'my' | 'en';
  batches: EpisodeBatch[];
  isProcessingAll: boolean;
  onStartProcessAll: () => void;
  onProcessSingleBatch: (batchId: string) => void;
  onDownloadZip: () => void;
  isZipping: boolean;
  zipProgress: number;
  onPreviewBatch: (batch: EpisodeBatch) => void;
  onDeleteBatch: (batchId: string) => void;
  onSaveBatchToLibrary: (batch: EpisodeBatch) => void;
  savedBatchIds: Set<string>;
}

export const ProcessingQueueView: React.FC<ProcessingQueueViewProps> = ({
  language,
  batches,
  isProcessingAll,
  onStartProcessAll,
  onProcessSingleBatch,
  onDownloadZip,
  isZipping,
  zipProgress,
  onPreviewBatch,
  onDeleteBatch,
  onSaveBatchToLibrary,
  savedBatchIds,
}) => {
  const t = translations[language].queueView;
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);

  const completedBatches = batches.filter((b) => b.status === 'completed');
  const hasCompleted = completedBatches.length > 0;
  const isAllCompleted = completedBatches.length === batches.length && batches.length > 0;

  const handleCopyCaption = (batch: EpisodeBatch) => {
    navigator.clipboard.writeText(batch.caption);
    setCopiedBatchId(batch.id);
    setTimeout(() => setCopiedBatchId(null), 2000);
  };

  if (batches.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
        <Film className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">{t.emptyQueue}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-xs text-slate-400">
            {completedBatches.length} / {batches.length} {language === 'my' ? 'တွဲ ပြီးစီး' : 'completed'}
          </p>
        </div>

        {/* Global Action: Start / Download Zip */}
        <div className="flex items-center gap-2">
          {hasCompleted && (
            <button
              onClick={onDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {isZipping ? `${zipProgress}%` : t.downloadAllZip}
              </span>
            </button>
          )}

          {!isAllCompleted && (
            <button
              onClick={onStartProcessAll}
              disabled={isProcessingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-blue-600/30 active:scale-95 transition-all"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.statusProcessing}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'my' ? 'အားလုံး ပေါင်းမည်' : 'Process All'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar of Overall Batch Process */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            {language === 'my' ? 'စုစုပေါင်း ပြီးစီးမှု' : 'Overall Progress'}
          </span>
          <span className="font-mono text-blue-400 font-bold">
            {Math.round((completedBatches.length / batches.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${(completedBatches.length / batches.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-3">
        {batches.map((batch) => {
          const isDone = batch.status === 'completed';
          const isCurrent = batch.status === 'processing';
          const isError = batch.status === 'error';
          const isSaved = savedBatchIds.has(batch.id);
          const isCaptionCopied = copiedBatchId === batch.id;

          return (
            <div
              key={batch.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-900/90 border-emerald-900/50'
                  : isCurrent
                  ? 'bg-blue-950/20 border-blue-600/60 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {/* Caption badge: 1-5, 6-10, 11-15 */}
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/40 text-xs font-bold font-mono">
                      {batch.caption}
                    </span>

                    {/* Copy Caption button */}
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(batch)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700 active:scale-95 transition-all"
                      title="Copy Caption (1-5)"
                    >
                      {isCaptionCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{t.copiedCaption}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Caption</span>
                        </>
                      )}
                    </button>

                    <h3 className="text-xs font-bold text-white truncate">
                      {batch.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                    {batch.outputFileName}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isDone && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.statusCompleted}</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{batch.progress}%</span>
                    </span>
                  )}
                  {isError && (
                    <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t.statusError}</span>
                    </span>
                  )}
                  {batch.status === 'idle' && (
                    <span className="text-[11px] text-slate-400">
                      {t.statusIdle}
                    </span>
                  )}

                  {/* Delete Batch Trigger */}
                  <button
                    onClick={() => onDeleteBatch(batch.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors ml-1"
                    title={t.deleteBatch}
                    aria-label="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* In-Progress Micro Bar */}
              {isCurrent && (
                <div className="mt-2.5">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${batch.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {batch.episodes.length} {language === 'my' ? 'ပိုင်းပေါင်းစပ်ထားသည်' : 'episodes merged'}
                  {batch.outputSize && (
                    <span className="ml-1 text-slate-400 font-mono">
                      ({(batch.outputSize / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Single Batch Play Preview */}
                  {isDone && (
                    <button
                      onClick={() => onPreviewBatch(batch)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t.previewPart}</span>
                    </button>
                  )}

                  {/* Save to Persistent Library */}
                  {isDone && batch.outputBlob && (
                    <button
                      onClick={() => onSaveBatchToLibrary(batch)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                        isSaved
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                      title={isSaved ? t.savedInLibrary : t.saveToLibraryBtn}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-3 h-3 text-indigo-400" />
                          <span>{t.savedInLibrary}</span>
                        </>
                      ) : (
                        <>
                          <FolderDown className="w-3 h-3" />
                          <span>{t.saveToLibraryBtn}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Single Batch Download */}
                  {isDone && batch.outputBlob && (
                    <button
                      onClick={() => triggerFileDownload(batch.outputBlob!, batch.outputFileName)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>{t.downloadBtn}</span>
                    </button>
                  )}

                  {/* Manual Run Single Batch */}
                  {!isDone && !isCurrent && (
                    <button
                      onClick={() => onProcessSingleBatch(batch.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span>{language === 'my' ? 'ဤတွဲ ပေါင်းမည်' : 'Merge'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

