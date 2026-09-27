export interface DramaEpisode {
  id: string;
  name: string;
  file?: File;
  size: number;
  duration?: number; // in seconds
  episodeNumber: number;
  url?: string;
  resolution?: string; // e.g. "1080x1920" or "720x1280"
  aspectRatio?: string; // e.g. "9:16 (Vertical)" or "16:9"
  width?: number;
  height?: number;
  format?: string;
  isSample?: boolean;
}

export type NamingFormat = 'range_only' | 'series_range' | 'part_range'; // e.g. "1-5.mp4" vs "Drama 1-5.mp4"

export interface EpisodeBatch {
  id: string;
  partNumber: number;
  title: string;
  caption: string; // e.g. "1-5", "6-10", "11-15"
  startEp: number;
  endEp: number;
  episodes: DramaEpisode[];
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number; // 0 to 100
  outputFileName: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  totalDuration?: number;
  resolution?: string;
  aspectRatio?: string;
  error?: string;
}

export type MergeEngineMode = 'lossless_stream' | 'media_canvas' | 'android_termux';

export interface MergeSettings {
  episodesPerBatch: number; // default 5
  prefixName: string;
  namingFormat: NamingFormat;
  keepOriginalQuality: boolean; // true
  language: 'my' | 'en';
  autoSort: boolean;
}

