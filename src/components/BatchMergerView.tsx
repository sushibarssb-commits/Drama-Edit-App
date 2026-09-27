import React, { useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Sparkles,
  Layers,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle,
  FileVideo,
  Terminal,
  HelpCircle,
  Tag,
  Smartphone,
} from 'lucide-react';
import { DramaEpisode, EpisodeBatch, NamingFormat } from '../types';
import { translations } from '../utils/translations';

interface BatchMergerViewProps {
  language: 'my' | 'en';
  episodes: DramaEpisode[];
  batches: EpisodeBatch[];
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  seriesName: string;
  onSeriesNameChange: (name: string) => void;
  namingFormat: NamingFormat;
  onNamingFormatChange: (format: NamingFormat) => void;
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
  onStartMergeAll: () => void;
  onClearAll: () => void;
  onGoToTools: () => void;
}

export const BatchMergerView: React.FC<BatchMergerViewProps> = ({
  language,
  episodes,
  batches,
  batchSize,
  onBatchSizeChange,
  seriesName,
  onSeriesNameChange,
  namingFormat,
  onNamingFormatChange,
  onFilesSelected,
  onLoadSample,
  isLoadingSample,
  onStartMergeAll,
  onClearAll,
  onGoToTools,
}) => {
  const t = translations[language].mergerView;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const hasEpisodes = episodes.length > 0;
  const totalDurationMinutes = Math.round(
    episodes.reduce((acc, ep) => acc + (ep.duration || 2.5), 0) / 60
  );

  // Detected resolution & aspect ratio from the first loaded episode
  const detectedResolution = episodes[0]?.resolution || 'Original HD';
  const detectedRatio = episodes[0]?.aspectRatio || 'Auto (Preserved 1:1)';

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-900/40 p-4 sm:p-5 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>{language === 'my' ? 'Android ဒရာမာ ဗီဒီယို ပေါင်းစက်' : 'Android Drama Video Stitcher'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {language === 'my'
              ? 'အပိုင်း ၁ မှ အဆုံးထိ ၅ ပိုင်းတစ်တွဲ အစဥ်လိုက် (1-5, 6-10...) ပေါင်းမည်'
              : 'Auto Batch-Merge from Ep 1 to End in 5-Ep Bundles (1-5, 6-10...)'}
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {t.selectFilesDesc}
          </p>

          {/* Action Buttons: Pick Files, Folder, Demo */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>{t.pickFilesBtn}</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 min-h-[44px]"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>{t.pickFolderBtn}</span>
            </button>

            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-200 text-xs font-semibold border border-indigo-700/50 transition-all active:scale-95 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{isLoadingSample ? t.loadingSample : t.loadSampleBtn}</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,.mp4,.mkv,.mov,.webm,.ts"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onFilesSelected(e.target.files);
              }
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory attribute is standard for directory picker
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onFilesSelected(e.target.files);
              }
            }}
          />
        </div>
      </div>

      {/* Selected Stats & Batch Configuration */}
      {hasEpisodes && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {language === 'my' ? 'အပိုင်းစုစုပေါင်း' : 'Total Episodes'}
              </span>
              <span className="text-xl font-black text-white tabular-nums">
                {episodes.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Ep {episodes[0]?.episodeNumber} – {episodes[episodes.length - 1]?.episodeNumber}
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {language === 'my' ? 'ထွက်ရှိမည့် အပိုင်းတွဲ' : 'Output Parts'}
              </span>
              <span className="text-xl font-black text-blue-400 tabular-nums">
                {batches.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {batchSize} {language === 'my' ? 'ပိုင်းတစ်တွဲ' : 'eps / part'}
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {language === 'my' ? 'ခန့်မှန်း ကြာချိန်' : 'Total Time'}
              </span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">
                {totalDurationMinutes > 0 ? `${totalDurationMinutes}m` : '~Auto'}
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">
                Lossless Ratio
              </span>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{t.batchConfigTitle}</span>
              </h3>
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearAll}</span>
              </button>
            </div>

            {/* Batch Size Selector (Default: 5 episodes) */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-2 block">
                {t.episodesPerBatch}
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10, 15].map((count) => (
                  <button
                    key={count}
                    onClick={() => onBatchSizeChange(count)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
                      batchSize === count
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{count} {t.episodesUnit}</span>
                    {count === 5 && (
                      <span className="ml-1 text-[9px] opacity-80 font-normal">
                        ({language === 'my' ? 'မူလ' : 'Def'})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Naming & Caption Style Selector (1-5.mp4 vs Drama_1-5.mp4) */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.namingFormatTitle}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onNamingFormatChange('range_only')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    namingFormat === 'range_only'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block font-mono text-blue-400">
                    1-5.mp4
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {language === 'my' ? 'ရိုးရှင်းသော နံပါတ်စဥ် (Default)' : 'Clean Range (Default)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNamingFormatChange('series_range')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    namingFormat === 'series_range'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block font-mono text-emerald-400 truncate">
                    {seriesName}_1-5.mp4
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {language === 'my' ? 'ဇာတ်လမ်းတွဲ အမည်ပါ' : 'With Series Title'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNamingFormatChange('part_range')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    namingFormat === 'part_range'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block font-mono text-amber-400 truncate">
                    Part01_Ep1-5.mp4
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {language === 'my' ? 'Part အမည်အပြည့်အစုံ' : 'Full Part Number'}
                  </span>
                </button>
              </div>
            </div>

            {/* Series Prefix Name Input (Optional if range_only, but useful for tags) */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1.5 block">
                {t.seriesTitleLabel}
              </label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => onSeriesNameChange(e.target.value)}
                placeholder="Drama_Series_Name"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Original Ratio & Size Assurance Box */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    {t.losslessBadge}
                  </span>
                  <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
                    {t.losslessDesc}
                  </p>
                </div>
              </div>

              {/* Detected Specs Badge */}
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-800/30 text-[10px] text-emerald-300 font-mono">
                <span className="px-2 py-0.5 bg-emerald-900/40 rounded border border-emerald-700/40">
                  {detectedRatio}
                </span>
                <span className="px-2 py-0.5 bg-emerald-900/40 rounded border border-emerald-700/40">
                  {detectedResolution}
                </span>
                <span className="text-slate-400">
                  100% Native Aspect Ratio
                </span>
              </div>
            </div>
          </div>

          {/* Planned Batches Preview List (Shows 1-5, 6-10, 11-15 sequentially) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 tracking-wide">
              {language === 'my'
                ? `ထုတ်မည့် အပိုင်းတွဲနှင့် Caption များ (${batches.length} Parts)`
                : `Output Bundles & Captions (${batches.length} Parts)`}
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 font-bold font-mono text-xs border border-blue-800/40 shrink-0">
                      {batch.caption}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">
                        Caption: {batch.caption}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block font-mono">
                        {batch.outputFileName}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pl-2">
                    {batch.episodes.length} {language === 'my' ? 'ပိုင်း' : 'eps'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onStartMergeAll}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.startBatchBtn}</span>
            </button>

            <button
              onClick={onGoToTools}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-98 min-h-[44px]"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{t.exportScriptBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State Instructions */}
      {!hasEpisodes && (
        <div className="p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 text-blue-400 flex items-center justify-center mx-auto border border-blue-800/40">
            <FileVideo className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {language === 'my' ? 'ဗီဒီယို ဖိုင်များ မရွေးရသေးပါ' : 'No Video Files Selected Yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {language === 'my'
                ? 'အပိုင်း ၁ မှ အဆုံးထိ ဒရာမာများကို ရွေးချယ်ပါက 1-5, 6-10 စသဖြင့် ၅ ပိုင်းတစ်တွဲစီ auto ပေါင်းပေးမည်ဖြစ်ပြီး မူလ Video Ratio နှင့် Size အတိုင်း ထိန်းသိမ်းပေးပါမည်'
                : 'Select episodes from 1 to end to auto-merge 1-5, 6-10 with original video ratio and quality preserved.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

