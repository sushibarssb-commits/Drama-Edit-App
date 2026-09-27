/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DramaEpisode, EpisodeBatch, NamingFormat } from './types';
import {
  extractEpisodeNumber,
  guessDramaTitle,
  sortEpisodesNaturally,
  groupEpisodesIntoBatches,
} from './utils/naturalSort';
import { generateSampleDramaSeries } from './utils/sampleDataGenerator';
import {
  mergeEpisodesInBrowser,
  downloadAllBatchesAsZip,
} from './utils/videoMerger';
import {
  saveVideoToStorage,
  getAllSavedVideos,
  deleteSavedVideo,
  deleteAllSavedVideos,
  SavedVideoRecord,
} from './utils/db';
import { AndroidHeader } from './components/AndroidHeader';
import { BottomNavigation, TabKey } from './components/BottomNavigation';
import { BatchMergerView } from './components/BatchMergerView';
import { EpisodesListView } from './components/EpisodesListView';
import { ProcessingQueueView } from './components/ProcessingQueueView';
import { SavedLibraryView } from './components/SavedLibraryView';
import { AndroidToolsView } from './components/AndroidToolsView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { InstallGuideModal } from './components/InstallGuideModal';

export default function App() {
  const [language, setLanguage] = useState<'my' | 'en'>('my');
  const [currentTab, setCurrentTab] = useState<TabKey>('merger');
  const [episodes, setEpisodes] = useState<DramaEpisode[]>([]);
  const [batchSize, setBatchSize] = useState<number>(5);
  const [seriesName, setSeriesName] = useState<string>('Drama_Series');
  const [namingFormat, setNamingFormat] = useState<NamingFormat>('range_only');
  const [batches, setBatches] = useState<EpisodeBatch[]>([]);

  // Persistent Saved Videos in IndexedDB
  const [savedVideos, setSavedVideos] = useState<SavedVideoRecord[]>([]);

  // Processing states
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Install guide modal
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Video modal preview state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl?: string;
    blob?: Blob;
    fileName?: string;
    subTitle?: string;
  }>({
    isOpen: false,
    title: '',
  });

  // Load saved videos from IndexedDB on initial mount
  const refreshSavedVideos = useCallback(async () => {
    try {
      const records = await getAllSavedVideos();
      setSavedVideos(records);
    } catch (err) {
      console.error('Failed to load saved videos from DB', err);
    }
  }, []);

  useEffect(() => {
    refreshSavedVideos();
  }, [refreshSavedVideos]);

  // Re-compute batches whenever episodes, batchSize, seriesName, or namingFormat changes
  useEffect(() => {
    if (episodes.length === 0) {
      setBatches([]);
      return;
    }
    const grouped = groupEpisodesIntoBatches(episodes, batchSize, seriesName, namingFormat);
    setBatches((prev) => {
      // Preserve completed state if batch ID matches
      return grouped.map((newB) => {
        const existing = prev.find((p) => p.id === newB.id);
        if (existing && existing.status === 'completed') {
          return {
            ...newB,
            status: existing.status,
            progress: 100,
            outputBlob: existing.outputBlob,
            outputUrl: existing.outputUrl,
            outputSize: existing.outputSize,
            totalDuration: existing.totalDuration,
          };
        }
        return newB;
      });
    });
  }, [episodes, batchSize, seriesName, namingFormat]);

  // Handle files selected via file picker or directory picker
  const handleFilesSelected = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    // Filter only video files
    const videoFiles = fileArray.filter(
      (f) =>
        f.type.startsWith('video/') ||
        /\.(mp4|mkv|mov|webm|avi|flv|ts|m4v)$/i.test(f.name)
    );

    if (videoFiles.length === 0) {
      alert(
        language === 'my'
          ? 'ဗီဒီယို ဖိုင်များ မပါဝင်ပါ။ ကျေးဇူးပြု၍ ဗီဒီယို ဖိုင်များသာ ရွေးချယ်ပါ'
          : 'No valid video files found in selection'
      );
      return;
    }

    // Auto guess drama title
    const guessedTitle = guessDramaTitle(videoFiles.map((f) => f.name));
    setSeriesName(guessedTitle);

    // Map to DramaEpisode items
    const parsedEpisodes: DramaEpisode[] = videoFiles.map((file, idx) => {
      const epNum = extractEpisodeNumber(file.name, idx);
      return {
        id: `ep-${file.name}-${idx}-${Date.now()}`,
        name: file.name,
        file,
        size: file.size,
        episodeNumber: epNum,
        url: URL.createObjectURL(file),
      };
    });

    const naturallySorted = sortEpisodesNaturally(parsedEpisodes);
    setEpisodes(naturallySorted);

    // Probe native video resolution & aspect ratio from the first video
    if (videoFiles[0]) {
      const probeVideo = document.createElement('video');
      const firstUrl = URL.createObjectURL(videoFiles[0]);
      probeVideo.src = firstUrl;
      probeVideo.onloadedmetadata = () => {
        const w = probeVideo.videoWidth;
        const h = probeVideo.videoHeight;
        const isVertical = w < h;
        const ratioStr = isVertical ? `9:16 (Vertical Reel ${w}x${h})` : `16:9 (Landscape ${w}x${h})`;

        setEpisodes((prev) =>
          prev.map((ep) => ({
            ...ep,
            width: w,
            height: h,
            resolution: `${w}x${h}`,
            aspectRatio: ratioStr,
          }))
        );
        URL.revokeObjectURL(firstUrl);
      };
    }

    setCurrentTab('merger');
  }, [language]);

  // Load 10 sample episodes for instant demonstration
  const handleLoadSample = useCallback(async () => {
    setIsLoadingSample(true);
    try {
      const sampleTitle = 'Revenge_Empress';
      setSeriesName(sampleTitle);
      const samples = await generateSampleDramaSeries(10);
      setEpisodes(samples);
      setCurrentTab('merger');
    } catch (err) {
      console.error('Failed to generate sample episodes', err);
    } finally {
      setIsLoadingSample(false);
    }
  }, []);

  // Sort episodes naturally
  const handleSortAuto = useCallback(() => {
    setEpisodes((prev) => sortEpisodesNaturally(prev));
  }, []);

  // Update a single episode number
  const handleUpdateEpisodeNumber = useCallback(
    (id: string, newEpNum: number) => {
      setEpisodes((prev) =>
        prev.map((ep) => (ep.id === id ? { ...ep, episodeNumber: newEpNum } : ep))
      );
    },
    []
  );

  // Delete an episode from list
  const handleDeleteEpisode = useCallback((id: string) => {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
  }, []);

  // Reorder episode manually
  const handleMoveEpisode = useCallback(
    (index: number, direction: 'up' | 'down') => {
      setEpisodes((prev) => {
        const next = [...prev];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return prev;
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        return next;
      });
    },
    []
  );

  // Delete a batch from the processing queue
  const handleDeleteBatch = useCallback((batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  }, []);

  // Save a batch to persistent IndexedDB
  const handleSaveBatchToLibrary = useCallback(
    async (batch: EpisodeBatch) => {
      if (!batch.outputBlob) return;
      try {
        const record: SavedVideoRecord = {
          id: `saved-${batch.id}-${Date.now()}`,
          seriesName,
          partNumber: batch.partNumber,
          title: batch.title,
          caption: batch.caption,
          fileName: batch.outputFileName,
          blob: batch.outputBlob,
          size: batch.outputBlob.size,
          duration: batch.totalDuration || 0,
          createdAt: Date.now(),
          episodesCount: batch.episodes.length,
          startEp: batch.startEp,
          endEp: batch.endEp,
          aspectRatio: batch.aspectRatio,
          resolution: batch.resolution,
        };
        await saveVideoToStorage(record);
        await refreshSavedVideos();
      } catch (err) {
        console.error('Failed to save video record', err);
      }
    },
    [seriesName, refreshSavedVideos]
  );

  // Process a single batch and auto-save into persistent library
  const processBatchItem = async (batchId: string): Promise<boolean> => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId ? { ...b, status: 'processing', progress: 5 } : b
      )
    );

    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return false;

    try {
      const result = await mergeEpisodesInBrowser(batch, (pct) => {
        setBatches((prev) =>
          prev.map((b) => (b.id === batchId ? { ...b, progress: pct } : b))
        );
      });

      const blobUrl = URL.createObjectURL(result.blob);

      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? {
                ...b,
                status: 'completed',
                progress: 100,
                outputBlob: result.blob,
                outputUrl: blobUrl,
                outputSize: result.blob.size,
                totalDuration: result.duration,
              }
            : b
        )
      );

      // Auto-save into IndexedDB so it's safely stored even after page refresh
      try {
        const record: SavedVideoRecord = {
          id: `saved-${batch.id}-${Date.now()}`,
          seriesName,
          partNumber: batch.partNumber,
          title: batch.title,
          caption: batch.caption,
          fileName: batch.outputFileName,
          blob: result.blob,
          size: result.blob.size,
          duration: result.duration,
          createdAt: Date.now(),
          episodesCount: batch.episodes.length,
          startEp: batch.startEp,
          endEp: batch.endEp,
          aspectRatio: batch.aspectRatio,
          resolution: batch.resolution,
        };
        await saveVideoToStorage(record);
        await refreshSavedVideos();
      } catch (err) {
        console.warn('Auto-save to storage error:', err);
      }

      return true;
    } catch (err: unknown) {
      console.error('Error merging batch:', err);
      const errorMsg = err instanceof Error ? err.message : 'Processing failed';
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? { ...b, status: 'error', error: errorMsg }
            : b
        )
      );
      return false;
    }
  };

  // Start processing all batches sequentially
  const handleStartProcessAll = async () => {
    setIsProcessingAll(true);
    setCurrentTab('queue');

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (batch.status !== 'completed') {
        await processBatchItem(batch.id);
      }
    }

    setIsProcessingAll(false);

    // Fire celebration confetti when all done!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  // Delete a saved video from library
  const handleDeleteSavedVideo = async (id: string) => {
    try {
      await deleteSavedVideo(id);
      await refreshSavedVideos();
    } catch (err) {
      console.error('Failed to delete video', err);
    }
  };

  // Delete all saved videos from library
  const handleDeleteAllSavedVideos = async () => {
    try {
      await deleteAllSavedVideos();
      await refreshSavedVideos();
    } catch (err) {
      console.error('Failed to delete all videos', err);
    }
  };

  // Download all completed batches as ZIP
  const handleDownloadZip = async () => {
    if (batches.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadAllBatchesAsZip(
        batches,
        `${seriesName}_Merged_Parts.zip`,
        (pct) => setZipProgress(pct)
      );
    } catch (err) {
      console.error('ZIP failed', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Preview batch or episode in modal
  const handlePreviewEpisode = (episode: DramaEpisode) => {
    setPreviewModal({
      isOpen: true,
      title: episode.name,
      videoUrl: episode.url,
      blob: episode.file,
      fileName: episode.name,
      subTitle: `Episode ${episode.episodeNumber} · ${episode.resolution || 'Original Quality'}`,
    });
  };

  const handlePreviewBatch = (batch: EpisodeBatch) => {
    setPreviewModal({
      isOpen: true,
      title: `Caption: ${batch.caption}`,
      videoUrl: batch.outputUrl,
      blob: batch.outputBlob,
      fileName: batch.outputFileName,
      subTitle: `${batch.episodes.length} Episodes Merged (${batch.outputFileName})`,
    });
  };

  const handlePreviewSavedVideo = (video: SavedVideoRecord) => {
    setPreviewModal({
      isOpen: true,
      title: `Caption: ${video.caption || video.title}`,
      blob: video.blob,
      fileName: video.fileName,
      subTitle: `${video.seriesName} · Ep ${video.startEp}-${video.endEp} (${video.episodesCount} Episodes)`,
    });
  };

  const completedCount = useMemo(
    () => batches.filter((b) => b.status === 'completed').length,
    [batches]
  );

  const savedBatchIds = useMemo(() => {
    return new Set(savedVideos.map((v) => v.fileName));
  }, [savedVideos]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Android Top Header */}
      <AndroidHeader
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'my' ? 'en' : 'my'))}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        isProcessing={isProcessingAll}
      />

      {/* Main Responsive Content Frame */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 pt-3.5">
        {currentTab === 'merger' && (
          <BatchMergerView
            language={language}
            episodes={episodes}
            batches={batches}
            batchSize={batchSize}
            onBatchSizeChange={setBatchSize}
            seriesName={seriesName}
            onSeriesNameChange={setSeriesName}
            namingFormat={namingFormat}
            onNamingFormatChange={setNamingFormat}
            onFilesSelected={handleFilesSelected}
            onLoadSample={handleLoadSample}
            isLoadingSample={isLoadingSample}
            onStartMergeAll={handleStartProcessAll}
            onClearAll={() => {
              setEpisodes([]);
              setBatches([]);
            }}
            onGoToTools={() => setCurrentTab('tools')}
          />
        )}

        {currentTab === 'episodes' && (
          <EpisodesListView
            language={language}
            episodes={episodes}
            batches={batches}
            batchSize={batchSize}
            onSortAuto={handleSortAuto}
            onUpdateEpisodeNumber={handleUpdateEpisodeNumber}
            onMoveEpisode={handleMoveEpisode}
            onPreviewEpisode={handlePreviewEpisode}
            onDeleteEpisode={handleDeleteEpisode}
          />
        )}

        {currentTab === 'queue' && (
          <ProcessingQueueView
            language={language}
            batches={batches}
            isProcessingAll={isProcessingAll}
            onStartProcessAll={handleStartProcessAll}
            onProcessSingleBatch={(id) => processBatchItem(id)}
            onDownloadZip={handleDownloadZip}
            isZipping={isZipping}
            zipProgress={zipProgress}
            onPreviewBatch={handlePreviewBatch}
            onDeleteBatch={handleDeleteBatch}
            onSaveBatchToLibrary={handleSaveBatchToLibrary}
            savedBatchIds={savedBatchIds}
          />
        )}

        {currentTab === 'library' && (
          <SavedLibraryView
            language={language}
            savedVideos={savedVideos}
            onDeleteVideo={handleDeleteSavedVideo}
            onDeleteAllVideos={handleDeleteAllSavedVideos}
            onPlayVideo={handlePreviewSavedVideo}
          />
        )}

        {currentTab === 'tools' && (
          <AndroidToolsView
            language={language}
            batches={batches}
            seriesName={seriesName}
            onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
          />
        )}
      </main>

      {/* Fixed Ergonomic Android Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        queueCount={isProcessingAll ? batches.length - completedCount : 0}
        completedCount={completedCount}
        savedCount={savedVideos.length}
      />

      {/* Modal Video Player */}
      <VideoPlayerModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((p) => ({ ...p, isOpen: false }))}
        title={previewModal.title}
        videoUrl={previewModal.videoUrl}
        blob={previewModal.blob}
        fileName={previewModal.fileName}
        subTitle={previewModal.subTitle}
      />

      {/* Android Install Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        language={language}
      />
    </div>
  );
}
