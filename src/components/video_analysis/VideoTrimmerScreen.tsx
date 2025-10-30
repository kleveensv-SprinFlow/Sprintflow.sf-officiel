// Fichier: src/components/video_analysis/VideoTrimmerScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Scissors } from 'lucide-react';

interface VideoTrimmerScreenProps {
  videoFile: File;
  onComplete: (startTime: number, endTime: number) => void;
  onBack: () => void;
}

export function VideoTrimmerScreen({ videoFile, onComplete, onBack }: VideoTrimmerScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(videoDuration);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        if (video.currentTime < startTime || video.currentTime >= endTime) {
          video.currentTime = startTime;
        }
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col h-full">
      <div className="flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold">Découper la vidéo</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Utilisez les curseurs pour sélectionner uniquement les répétitions pertinentes.
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center my-6">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-w-lg aspect-video bg-gray-900 rounded-lg"
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
        />
      </div>

      <div className="flex-shrink-0 space-y-4">
        {duration > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="relative h-12 mb-2">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Début: {formatTime(startTime)}</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={startTime}
                  onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fin: {formatTime(endTime)}</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => onComplete(startTime, endTime)}
          className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg"
          disabled={endTime - startTime <= 0}
        >
          <Scissors className="w-6 h-6" />
          Découper et Analyser
        </button>
      </div>
    </div>
  );
}
