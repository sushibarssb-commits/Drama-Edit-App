import { DramaEpisode, EpisodeBatch, NamingFormat } from '../types';

/**
 * Extract episode number from a filename or text
 * Supports: Ep 1, Ep01, EP.02, Episode 3, [04], (05), _06, 07.mp4, etc.
 */
export function extractEpisodeNumber(filename: string, fallbackIndex: number): number {
  const cleanName = filename.replace(/\.[^/.]+$/, ''); // Remove extension

  // Patterns ordered from most specific to general
  const patterns = [
    /(?:ep|episode|e|part|အပိုင်း)[\s._-]*(\d+)/i,
    /(?:\[|\()(\d+)(?:\]|\))/,
    /(?:^|[^\d])0*(\d{1,4})(?:[^\d]|$)/,
  ];

  for (const regex of patterns) {
    const match = cleanName.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 10000) {
        return num;
      }
    }
  }

  // Fallback to sequential index if no number detected
  return fallbackIndex + 1;
}

/**
 * Guess the common Drama / Series title from a list of filenames
 */
export function guessDramaTitle(filenames: string[]): string {
  if (!filenames.length) return 'Drama_Series';

  const cleanNames = filenames.map(f => {
    return f
      .replace(/\.[^/.]+$/, '') // remove ext
      .replace(/(?:ep|episode|e|part|အပိုင်း)[\s._-]*\d+/gi, '') // remove ep tags
      .replace(/\[\d+\]|\(\d+\)|_\d+|\b\d+\b/g, '') // remove numbers
      .replace(/[_-]+/g, ' ')
      .trim();
  });

  // Find most frequent or common prefix
  const first = cleanNames[0];
  if (first && first.length >= 3) {
    return first.replace(/\s+/g, '_');
  }

  return 'Drama_Series';
}

/**
 * Natural Alphanumeric Sort for Episodes
 */
export function sortEpisodesNaturally(episodes: DramaEpisode[]): DramaEpisode[] {
  return [...episodes].sort((a, b) => {
    if (a.episodeNumber !== b.episodeNumber) {
      return a.episodeNumber - b.episodeNumber;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Group sorted episodes into 5-episode bundles (or user defined chunk size)
 * Captions and filenames strictly follow sequential ranges: 1-5, 6-10, 11-15, etc.
 */
export function groupEpisodesIntoBatches(
  episodes: DramaEpisode[],
  batchSize: number = 5,
  seriesPrefix: string = 'Drama',
  namingFormat: NamingFormat = 'range_only'
): EpisodeBatch[] {
  const sorted = sortEpisodesNaturally(episodes);
  const batches: EpisodeBatch[] = [];

  const safeBatchSize = Math.max(1, batchSize);
  const totalBatches = Math.ceil(sorted.length / safeBatchSize);

  for (let i = 0; i < totalBatches; i++) {
    const startIdx = i * safeBatchSize;
    const chunk = sorted.slice(startIdx, startIdx + safeBatchSize);
    const startEp = chunk[0].episodeNumber;
    const endEp = chunk[chunk.length - 1].episodeNumber;
    const partNum = i + 1;

    // Caption strictly formatted as requested: "1-5", "6-10", "11-15"
    const caption = `${startEp}-${endEp}`;

    let outputFileName = `${caption}.mp4`;
    if (namingFormat === 'series_range') {
      outputFileName = `${seriesPrefix}_${caption}.mp4`;
    } else if (namingFormat === 'part_range') {
      const partPadded = String(partNum).padStart(2, '0');
      outputFileName = `${seriesPrefix}_Part${partPadded}_Ep${caption}.mp4`;
    }

    // Determine resolution and aspect ratio from the first episode in the chunk
    const sampleEp = chunk[0];
    const resolution = sampleEp.resolution || (sampleEp.width && sampleEp.height ? `${sampleEp.width}x${sampleEp.height}` : undefined);
    const aspectRatio = sampleEp.aspectRatio;

    batches.push({
      id: `batch-${partNum}-${startEp}-${endEp}`,
      partNumber: partNum,
      title: `${caption}`,
      caption,
      startEp,
      endEp,
      episodes: chunk,
      status: 'idle',
      progress: 0,
      outputFileName,
      resolution,
      aspectRatio,
    });
  }

  return batches;
}

