import { DramaEpisode } from '../types';

/**
 * Generate a real synthetic playable mini video episode using HTML5 Canvas & Web Audio
 * Episode duration is ~2.5 seconds with clear text: "Drama Ep 01", timestamp, and audio chime.
 */
export async function generateSyntheticEpisode(
  episodeNumber: number,
  seriesName: string = 'Destiny_Love'
): Promise<DramaEpisode> {
  // 9:16 vertical short drama ratio (typical for mobile dramas, TikTok, Reels, ShortMax)
  const width = 360;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create AudioContext for tone
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  const dest = audioCtx.createMediaStreamDestination();

  // Create oscillator for pleasant tone
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const baseFreq = 220 + (episodeNumber % 12) * 35;
  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(30); // 30 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  // Check supported mime type
  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
    ? 'video/mp4;codecs=avc1'
    : MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<DramaEpisode>((resolve) => {
    recorder.onstop = () => {
      osc.stop();
      audioCtx.close();
      const blob = new Blob(chunks, { type: mimeType });
      const paddedEp = String(episodeNumber).padStart(2, '0');
      const filename = `${seriesName}_Ep_${paddedEp}.mp4`;
      const file = new File([blob], filename, { type: mimeType });
      const url = URL.createObjectURL(blob);

      resolve({
        id: `sample-ep-${episodeNumber}-${Date.now()}`,
        name: filename,
        file,
        size: blob.size,
        duration: 2.5,
        episodeNumber,
        url,
        resolution: '360x640',
        aspectRatio: '9:16 (Vertical Reel)',
        width: 360,
        height: 640,
        format: mimeType.includes('mp4') ? 'MP4' : 'WebM',
        isSample: true,
      });
    };

    recorder.start();

    // Render 75 frames (~2.5 seconds at 30 fps)
    let frame = 0;
    const totalFrames = 75;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      // Draw background gradient (Vertical format)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const hue1 = (episodeNumber * 37 + frame) % 360;
      const hue2 = (hue1 + 60) % 360;
      grad.addColorStop(0, `hsl(${hue1}, 70%, 15%)`);
      grad.addColorStop(1, `hsl(${hue2}, 80%, 8%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw stylized card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(20, 28, width - 40, height - 56, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Drama Series Name
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(seriesName.replace(/_/g, ' '), 36, 70);

      // Episode Big Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(`Episode ${episodeNumber}`, 36, 140);

      // Burmese Subtitle indication
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 17px sans-serif';
      ctx.fillText(`အပိုင်း (${episodeNumber})`, 36, 180);

      ctx.fillStyle = '#10b981';
      ctx.font = '500 13px sans-serif';
      ctx.fillText(`9:16 Vertical · Lossless Ratio`, 36, 210);

      // Center play circle
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 12, height / 2 - 18);
      ctx.lineTo(width / 2 + 18, height / 2);
      ctx.lineTo(width / 2 - 12, height / 2 + 18);
      ctx.fill();

      // Progress bar within the episode
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(36, height - 90, width - 72, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(36, height - 90, (width - 72) * progress, 6);

      // Timecode
      const sec = (progress * 2.5).toFixed(1);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.fillText(`00:0${sec} / 00:02.5 · 30 FPS`, 36, height - 60);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          recorder.stop();
        }, 100);
      }
    }, 1000 / 30);
  });
}

/**
 * Generate 10 sample episodes sequentially with progress callback
 */
export async function generateSampleDramaSeries(
  count: number = 10,
  onProgress?: (current: number, total: number) => void
): Promise<DramaEpisode[]> {
  const episodes: DramaEpisode[] = [];
  for (let i = 1; i <= count; i++) {
    if (onProgress) onProgress(i, count);
    const ep = await generateSyntheticEpisode(i, 'Revenge_Empress');
    episodes.push(ep);
  }
  return episodes;
}
