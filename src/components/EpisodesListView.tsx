import React, { useState } from 'react';
import { DramaEpisode, EpisodeBatch } from '../types';
import { Play, ArrowUpDown, ChevronUp, ChevronDown, Check, Film, Trash2 } from 'lucide-react';
import { translations } from '../utils/translations';

interface EpisodesListViewProps {
  language: 'my' | 'en';
  episodes: DramaEpisode[];
  batches: EpisodeBatch[];
  batchSize: number;
  onSortAuto: () => void;
  onUpdateEpisodeNumber: (id: string, newEpNum: number) => void;
  onMoveEpisode: (index: number, direction: 'up' | 'down') => void;
  onPreviewEpisode: (episode: DramaEpisode) => void;
  onDeleteEpisode: (id: string) => void;
}

export const EpisodesListView: React.FC<EpisodesListViewProps> = ({
  language,
  episodes,
  batches,
  batchSize,
  onSortAuto,
  onUpdateEpisodeNumber,
  onMoveEpisode,
  onPreviewEpisode,
  onDeleteEpisode,
}) => {
  const t = translations[language].episodesView;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (ep: DramaEpisode) => {
    setEditingId(ep.id);
    setEditValue(String(ep.episodeNumber));
  };

  const saveEdit = (id: string) => {
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num > 0) {
      onUpdateEpisodeNumber(id, num);
    }
    setEditingId(null);
  };

  if (episodes.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
        <Film className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">
          {language === 'my'
            ? 'စိစစ်ထားသော အပိုင်းများ မရှိသေးပါ။ ကျေးဇူးပြု၍ Batch Merger tab တွင် ဖိုင်များ ရွေးချယ်ပါ'
            : 'No episodes loaded yet. Please select files from the Batch Merger tab'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-xs text-slate-400">
            {episodes.length} {language === 'my' ? 'ပိုင်း' : 'episodes'} · {batches.length} {language === 'my' ? 'တွဲ (၅ ပိုင်းတစ်တွဲ)' : 'parts (5 eps each)'}
          </p>
        </div>

        <button
          onClick={onSortAuto}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 border border-slate-700 active:scale-95 transition-all"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{t.sortAuto}</span>
        </button>
      </div>

      {/* Batches view with episodes inside each 5-in-1 container */}
      <div className="space-y-3">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800"
          >
            {/* Batch Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                  Part {batch.partNumber}
                </span>
                <span className="text-xs font-bold text-white">
                  Ep {batch.startEp} – {batch.endEp}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                {batch.outputFileName}
              </span>
            </div>

            {/* List of episodes inside this batch */}
            <div className="divide-y divide-slate-800/50">
              {batch.episodes.map((ep, idx) => {
                const globalIndex = episodes.findIndex((e) => e.id === ep.id);
                const isEditing = editingId === ep.id;

                return (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Episode Number badge */}
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 px-1.5 py-1 text-xs bg-slate-950 border border-blue-500 rounded text-center text-white font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(ep.id)}
                            className="p-1 rounded bg-blue-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(ep)}
                          className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-700/80 hover:border-blue-500 transition-colors"
                          title="Click to edit episode number"
                        >
                          {ep.episodeNumber}
                        </button>
                      )}

                      {/* Episode details */}
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs font-medium text-slate-200 block truncate">
                          {ep.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>
                            {(ep.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{ep.resolution || 'HD'}</span>
                          {ep.duration && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{Math.round(ep.duration)}s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Preview Button */}
                      <button
                        onClick={() => onPreviewEpisode(ep)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                        title={t.previewPlay}
                        aria-label="Play Episode"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Delete Episode Button */}
                      <button
                        onClick={() => onDeleteEpisode(ep.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
                        title={t.deleteEp}
                        aria-label="Delete Episode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Move up / down buttons */}
                      <div className="flex flex-col">
                        <button
                          disabled={globalIndex === 0}
                          onClick={() => onMoveEpisode(globalIndex, 'up')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity"
                          aria-label="Move Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={globalIndex === episodes.length - 1}
                          onClick={() => onMoveEpisode(globalIndex, 'down')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity"
                          aria-label="Move Down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
