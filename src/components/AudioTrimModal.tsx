"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  HardDrive,
  Heart,
} from "lucide-react";
import { Mp3Encoder } from "@breezystack/lamejs";

interface AudioTrimModalProps {
  file: File;
  onCancel: () => void;
  onComplete: (trimmedFile: File) => void;
  maxSizeBytes?: number; // default 2MB (2 * 1024 * 1024)
}

const MAX_ALLOWED_BYTES = 2 * 1024 * 1024; // Strict 2MB Limit
const MP3_BITRATE_KBPS = 128; // 128 kbps stereo provides crisp fidelity at ~15.6 KB/sec

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function floatToInt16(floatSamples: Float32Array): Int16Array {
  const int16 = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, floatSamples[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export default function AudioTrimModal({
  file,
  onCancel,
  onComplete,
  maxSizeBytes = MAX_ALLOWED_BYTES,
}: AudioTrimModalProps) {
  const [isDecoding, setIsDecoding] = useState(true);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);

  // Selection range in seconds
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Encoding & Export state
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Measure canvas and watch for screen/modal resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(canvas);
    window.addEventListener("resize", updateSize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Load & Decode Audio File
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    async function loadAudio() {
      setIsDecoding(true);
      setDecodeError(null);

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const arrayBuffer = await file.arrayBuffer();
        if (isCancelled) return;

        const decoded = await ctx.decodeAudioData(arrayBuffer);
        if (isCancelled) return;

        setAudioBuffer(decoded);
        const totalSec = decoded.duration;
        setDuration(totalSec);

        // Default selection: up to 60 seconds (or full if under 60s)
        const initialEnd = Math.min(totalSec, 60);
        setStartTime(0);
        setEndTime(initialEnd);
        setCurrentTime(0);

        // Generate high-resolution waveform peaks (240 points for smooth adaptive scaling)
        const numBars = 240;
        const channelData = decoded.getChannelData(0);
        const blockSize = Math.floor(channelData.length / numBars);
        const peaks: number[] = [];
        let maxPeak = 0;

        for (let i = 0; i < numBars; i++) {
          const start = i * blockSize;
          const end = Math.min(start + blockSize, channelData.length);
          let sum = 0;
          for (let j = start; j < end; j += 4) {
            // subsample for fast calculation
            const val = Math.abs(channelData[j]);
            if (val > sum) sum = val;
          }
          peaks.push(sum);
          if (sum > maxPeak) maxPeak = sum;
        }

        // Normalize peaks
        const normalized = peaks.map((p) => (maxPeak > 0 ? Math.max(0.1, p / maxPeak) : 0.2));
        setWaveformPeaks(normalized);
        setIsDecoding(false);
      } catch (err: any) {
        console.error("Failed to decode audio file:", err);
        if (!isCancelled) {
          setDecodeError(
            err?.message || "Could not decode audio. Please ensure this is a valid MP3, WAV, or AAC file."
          );
          setIsDecoding(false);
        }
      }
    }

    loadAudio();

    return () => {
      isCancelled = true;
      stopPlayback();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [file]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Playback Engine
  // ─────────────────────────────────────────────────────────────────────────
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(
    (offsetSec?: number) => {
      if (!audioBuffer || !audioContextRef.current) return;
      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopPlayback();

      // Determine starting offset
      let startOffset = offsetSec !== undefined ? offsetSec : currentTime;
      if (startOffset < startTime || startOffset >= endTime) {
        startOffset = startTime;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gain;

      source.connect(gain);
      gain.connect(ctx.destination);

      const playDuration = Math.max(0.1, endTime - startOffset);
      source.start(0, startOffset, playDuration);

      playbackStartTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = startOffset;
      sourceNodeRef.current = source;
      setIsPlaying(true);

      const updateProgress = () => {
        if (!sourceNodeRef.current || !audioContextRef.current) return;
        const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
        const currentPos = playbackStartOffsetRef.current + elapsed;

        if (currentPos >= endTime) {
          if (isLooping) {
            startPlayback(startTime);
          } else {
            stopPlayback();
            setCurrentTime(startTime);
          }
          return;
        }

        setCurrentTime(currentPos);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    },
    [audioBuffer, startTime, endTime, currentTime, isLooping, isMuted, volume, stopPlayback]
  );

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Sync volume with gain node
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioContextRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Adjust current time when start time moves ahead of it
  useEffect(() => {
    if (currentTime < startTime || currentTime > endTime) {
      setCurrentTime(startTime);
      if (isPlaying) {
        startPlayback(startTime);
      }
    }
  }, [startTime, endTime]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Render Waveform Canvas (Adaptive & strictly aligned on all screen sizes)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformPeaks.length === 0 || duration === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvasSize.width || 300;
    const height = canvas.clientHeight || canvasSize.height || 112;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Dynamic bar calculation: fits the exact canvas width with 0 overflow
    // On small screens (~280px-340px): ~70-85 bars
    // On desktop (~500px+): ~120-150 bars
    const targetStep = width < 360 ? 3.5 : 4;
    const numBars = Math.max(20, Math.floor(width / targetStep));
    const step = width / numBars;
    const barWidth = Math.max(1.2, step * 0.6);

    const startRatio = startTime / duration;
    const endRatio = endTime / duration;
    const currentRatio = currentTime / duration;

    // Draw bars strictly aligned with startRatio and endRatio
    for (let i = 0; i < numBars; i++) {
      const xCenter = (i + 0.5) * step;
      const barRatio = xCenter / width;
      const isSelected = barRatio >= startRatio && barRatio <= endRatio;
      const isPastPlayhead = barRatio <= currentRatio && isSelected;

      // Smoothly sample from waveformPeaks
      const peakIndex = Math.min(
        waveformPeaks.length - 1,
        Math.floor((i / numBars) * waveformPeaks.length)
      );
      const peak = waveformPeaks[peakIndex] ?? 0.2;
      const barHeight = Math.max(4, peak * (height - 14));
      const x = Math.round(xCenter - barWidth / 2);
      const y = Math.round((height - barHeight) / 2);

      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(1, Math.round(barWidth)), barHeight, 2);

      if (isPastPlayhead) {
        ctx.fillStyle = "#ec4899"; // glowing pink for played section
      } else if (isSelected) {
        ctx.fillStyle = "#f43f5e"; // bright rose for selected section
      } else {
        ctx.fillStyle = "#334155"; // muted dark slate for excluded section
      }
      ctx.fill();
    }

    // Draw playhead cursor
    if (currentRatio >= 0 && currentRatio <= 1) {
      const playheadX = Math.round(currentRatio * width);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
      ctx.shadowBlur = 4;
      ctx.fillRect(playheadX - 1, 0, 2, height);
      ctx.shadowBlur = 0;
    }
  }, [waveformPeaks, duration, startTime, endTime, currentTime, canvasSize]);

  // Handle clicking or touching waveform to seek
  const handleWaveformSeek = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;

    const boundedTime = Math.max(startTime, Math.min(endTime, targetTime));
    setCurrentTime(boundedTime);
    if (isPlaying) {
      startPlayback(boundedTime);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Calculations & 2MB Constraint
  // ─────────────────────────────────────────────────────────────────────────
  const selectedDuration = Math.max(0, endTime - startTime);
  // 128 kbps = 16,000 bytes per second
  const estimatedSizeBytes = Math.round((selectedDuration * (MP3_BITRATE_KBPS * 1000)) / 8);
  const isOverSizeLimit = estimatedSizeBytes > maxSizeBytes;
  const isOriginalUnderLimit = file.size <= maxSizeBytes;

  // Max duration allowed to stay safely under 2MB at 128kbps
  const maxSafeDurationSec = Math.floor((maxSizeBytes * 8) / (MP3_BITRATE_KBPS * 1000));

  // Quick nudges
  const nudgeStart = (delta: number) => {
    const newStart = Math.max(0, Math.min(endTime - 1, startTime + delta));
    setStartTime(newStart);
  };

  const nudgeEnd = (delta: number) => {
    const newEnd = Math.min(duration, Math.max(startTime + 1, endTime + delta));
    setEndTime(newEnd);
  };

  const setPreset = (presetSec: number) => {
    const newEnd = Math.min(duration, startTime + presetSec);
    setEndTime(newEnd);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Slice & MP3 Encoding
  // ─────────────────────────────────────────────────────────────────────────
  const handleSaveTrimmedAudio = async () => {
    if (!audioBuffer) return;
    stopPlayback();
    setIsEncoding(true);
    setEncodeProgress(5);
    setExportError(null);

    try {
      const sliceDuration = endTime - startTime;
      if (sliceDuration <= 0.5) {
        throw new Error("Please select an audio clip of at least 1 second.");
      }

      // 1. Resample & slice cleanly using standard 44.1kHz OfflineAudioContext
      const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
      const TARGET_SAMPLE_RATE = 44100;
      const numSamples = Math.max(1, Math.ceil(sliceDuration * TARGET_SAMPLE_RATE));

      const offlineCtx = new OfflineAudioContext(
        numChannels,
        numSamples,
        TARGET_SAMPLE_RATE
      );

      const bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(offlineCtx.destination);
      bufferSource.start(0, startTime, sliceDuration);

      setEncodeProgress(25);
      const renderedBuffer = await offlineCtx.startRendering();
      setEncodeProgress(50);

      // 2. Convert PCM Float32 to Int16
      const leftInt16 = floatToInt16(renderedBuffer.getChannelData(0));
      const rightInt16 =
        numChannels === 2 ? floatToInt16(renderedBuffer.getChannelData(1)) : undefined;

      // 3. Encode to MP3 using standard 128kbps LAME
      const encoder = new Mp3Encoder(numChannels, TARGET_SAMPLE_RATE, MP3_BITRATE_KBPS);
      const sampleBlockSize = 1152;
      const mp3Chunks: Uint8Array[] = [];

      for (let i = 0; i < renderedBuffer.length; i += sampleBlockSize) {
        const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
        let chunk: any;
        if (numChannels === 2 && rightInt16) {
          const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
          chunk = encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
          chunk = encoder.encodeBuffer(leftChunk);
        }
        if (chunk && chunk.length > 0) {
          mp3Chunks.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
        }

        // Periodic UI update
        if (i % (sampleBlockSize * 40) === 0) {
          const pct = Math.min(90, Math.round(50 + (i / renderedBuffer.length) * 40));
          setEncodeProgress(pct);
        }
      }

      const flush: any = encoder.flush();
      if (flush && flush.length > 0) {
        mp3Chunks.push(new Uint8Array(flush.buffer, flush.byteOffset, flush.byteLength));
      }

      setEncodeProgress(98);
      const mp3Blob = new Blob(mp3Chunks as unknown as BlobPart[], { type: "audio/mpeg" });

      // 4. Strict 2MB Verification
      if (mp3Blob.size > maxSizeBytes) {
        throw new Error(
          `Encoded audio (${formatBytes(mp3Blob.size)}) exceeds the strict 2.0 MB limit. Please shorten your selection to under ${formatTime(maxSafeDurationSec)}.`
        );
      }

      const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
      const outputFileName = `${originalBaseName}_trimmed.mp3`;
      const trimmedFile = new File([mp3Blob], outputFileName, { type: "audio/mpeg" });

      setEncodeProgress(100);
      onComplete(trimmedFile);
    } catch (err: any) {
      console.error("Audio trimming error:", err);
      setExportError(err?.message || "Failed to trim and encode audio.");
      setIsEncoding(false);
    }
  };

  const handleUseOriginalAudio = () => {
    if (!isOriginalUnderLimit) {
      setExportError(
        `Original file (${formatBytes(file.size)}) is larger than the 2MB limit. Please trim a segment to continue.`
      );
      return;
    }
    stopPlayback();
    onComplete(file);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Modal View
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Audio Editor & Trimmer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  Max 2MB
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[260px] sm:max-w-xs">
                {file.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isEncoding}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Loading / Error Banner */}
          {isDecoding && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-xs sm:text-sm font-medium">Decoding and analyzing audio waveform…</p>
            </div>
          )}

          {decodeError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Unable to load audio</p>
                <p className="text-rose-300/80">{decodeError}</p>
              </div>
            </div>
          )}

          {!isDecoding && !decodeError && (
            <>
              {/* File Info & Size Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                    Original File
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white block mt-0.5">
                    {formatBytes(file.size)} ({formatTime(duration)})
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                    Selected Clip
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-rose-400 block mt-0.5">
                    {formatTime(selectedDuration)}
                  </span>
                </div>

                <div
                  className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border ${
                    isOverSizeLimit
                      ? "bg-rose-950/40 border-rose-500/60 text-rose-300"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  <span className="text-[10px] font-medium block uppercase tracking-wider opacity-80">
                    Est. Output Size
                  </span>
                  <span className="text-xs sm:text-sm font-bold block mt-0.5">
                    ~{formatBytes(estimatedSizeBytes)} / 2.0 MB
                  </span>
                </div>
              </div>

              {/* 2MB Warning Banner if selection is too long */}
              {isOverSizeLimit && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold">Clip exceeds 2.0 MB maximum size</p>
                    <p className="text-[11px] text-rose-300/80 mt-0.5">
                      Please shorten your selection to under {formatTime(maxSafeDurationSec)} (currently{" "}
                      {formatTime(selectedDuration)}) to stay within the 2MB cloud limit.
                    </p>
                  </div>
                </div>
              )}

              {/* Waveform Canvas & Interactive Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-mono">{formatTime(startTime)}</span>
                  <span className="text-[11px] text-slate-500">Tap waveform to seek</span>
                  <span className="font-mono">{formatTime(endTime)}</span>
                </div>

                <div className="relative h-28 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner select-none">
                  <div className="relative w-full h-full">
                    <canvas
                      ref={canvasRef}
                      onClick={(e) => handleWaveformSeek(e.clientX)}
                      onTouchStart={(e) => {
                        if (e.touches[0]) handleWaveformSeek(e.touches[0].clientX);
                      }}
                      className="w-full h-full cursor-pointer block"
                    />

                    {/* Dimmed unselected region: Left */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-slate-950/65 backdrop-blur-[0.5px] pointer-events-none"
                      style={{ width: `${(startTime / duration) * 100}%` }}
                    />

                    {/* Selected range highlight area */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none bg-rose-500/[0.04] border-y border-rose-500/20"
                      style={{
                        left: `${(startTime / duration) * 100}%`,
                        width: `${Math.max(0, (endTime - startTime) / duration) * 100}%`,
                      }}
                    />

                    {/* Dimmed unselected region: Right */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-slate-950/65 backdrop-blur-[0.5px] pointer-events-none"
                      style={{ width: `${Math.max(0, (1 - endTime / duration) * 100)}%` }}
                    />

                    {/* Left boundary trim line with top/bottom grab handles */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none -translate-x-1/2 flex flex-col items-center justify-between z-10"
                      style={{ left: `${(startTime / duration) * 100}%` }}
                    >
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-md shadow-rose-500/50 -mt-0.5" />
                      <div className="w-[2px] h-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-md shadow-rose-500/50 -mb-0.5" />
                    </div>

                    {/* Right boundary trim line with top/bottom grab handles */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none -translate-x-1/2 flex flex-col items-center justify-between z-10"
                      style={{ left: `${(endTime / duration) * 100}%` }}
                    >
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-md shadow-rose-500/50 -mt-0.5" />
                      <div className="w-[2px] h-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-md shadow-rose-500/50 -mb-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Precision Dual Sliders */}
              <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl">
                {/* Start Time Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Start Position</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => nudgeStart(-5)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                      >
                        -5s
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeStart(5)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                      >
                        +5s
                      </button>
                      <span className="font-mono font-bold text-white text-xs ml-1">
                        {formatTime(startTime)}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={startTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < endTime) setStartTime(val);
                    }}
                    className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* End Time Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">End Position</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => nudgeEnd(-5)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                      >
                        -5s
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeEnd(5)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition"
                      >
                        +5s
                      </button>
                      <span className="font-mono font-bold text-white text-xs ml-1">
                        {formatTime(endTime)}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > startTime) setEndTime(val);
                    }}
                    className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPreset(30)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-[11px] text-slate-300 transition"
                  >
                    30 Sec
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(45)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-[11px] text-slate-300 transition"
                  >
                    45 Sec
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(60)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-[11px] text-slate-300 transition"
                  >
                    60 Sec
                  </button>
                  {duration <= maxSafeDurationSec && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartTime(0);
                        setEndTime(duration);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-[11px] text-slate-300 transition"
                    >
                      Entire Song
                    </button>
                  )}
                </div>
              </div>

              {/* Playback Controls Bar */}
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-11 h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isPlaying ? "Previewing Trim" : "Play Selection"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTime(currentTime)} / {formatTime(endTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Loop Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    title={isLooping ? "Looping Enabled" : "Looping Disabled"}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition ${
                      isLooping
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Loop 🔁
                  </button>

                  {/* Volume Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Export error banner */}
              {exportError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isEncoding}
            className="px-4 py-2.5 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition disabled:opacity-40"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {/* If original file is already under 2MB, allow using without trimming */}
            {isOriginalUnderLimit && (
              <button
                type="button"
                onClick={handleUseOriginalAudio}
                disabled={isEncoding || isDecoding}
                title="Use full original audio without trimming"
                className="px-3.5 py-2.5 rounded-2xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium transition disabled:opacity-40"
              >
                Use Full Audio ({formatBytes(file.size)})
              </button>
            )}

            {/* Primary Save Trimmed Audio Button */}
            <button
              type="button"
              onClick={handleSaveTrimmedAudio}
              disabled={isEncoding || isDecoding || isOverSizeLimit || Boolean(decodeError)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {isEncoding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Trimming ({encodeProgress}%)…</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Attach Audio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
