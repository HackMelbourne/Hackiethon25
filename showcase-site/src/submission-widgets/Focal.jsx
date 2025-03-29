// By: Han-Fong-Hsu

import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./Focal.css";

const formatTime = (timeMs) => {
  const validTimeMs = Math.max(0, timeMs);
  const totalSeconds = Math.floor(validTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((validTimeMs % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 text-white">
      <div className="font-mono text-4xl tracking-tight">{formatTime(time)}</div>
      <div className="flex space-x-3">
        <button onClick={handleStartStop} className="px-4 py-1 bg-white/15 hover:bg-white/25 rounded text-sm transition-colors min-w-[50px]">
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button onClick={handleReset} className="px-4 py-1 bg-white/15 hover:bg-white/25 rounded text-sm transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
};

const CountdownTimer = ({ initialMinutes = 5 }) => {
  const [customMinutes, setCustomMinutes] = useState(initialMinutes);
  const [time, setTime] = useState(customMinutes * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const targetTimeRef = useRef(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      setTime(customMinutes * 60 * 1000);
    }
  }, [customMinutes, isRunning]);

  useEffect(() => {
    if (isRunning) {
      targetTimeRef.current = Date.now() + time;
      intervalRef.current = setInterval(() => {
        const remaining = targetTimeRef.current - Date.now();
        if (remaining <= 0) {
          setTime(0);
          setIsRunning(false);
          setIsFinished(true);
          clearInterval(intervalRef.current);
        } else {
          setTime(remaining);
        }
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, time]);

  const handleStartStop = () => {
    if (time > 0) {
      setIsRunning(!isRunning);
      setIsFinished(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(customMinutes * 60 * 1000);
    setIsFinished(false);
  };

  const getButtonText = () => {
    if (isRunning) return 'Pause';
    if (time === 0 && !isFinished) return 'Start';
    if (time < customMinutes * 60 * 1000 && time > 0) return 'Resume';
    return 'Start';
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 text-white">
      <div className="flex items-center space-x-1">
        <label htmlFor="minutesInput" className="text-xs text-white/80">Minutes:</label>
        <input
          id="minutesInput"
          type="number"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(Number(e.target.value))}
          disabled={isRunning}
          className="w-16 text-center bg-transparent border border-white/20 rounded px-1 py-0.5 text-white focus:outline-none"
        />
      </div>
      <div className={`font-mono text-4xl tracking-tight ${isFinished ? 'text-red-400' : ''}`}>
        {formatTime(time)}
      </div>
      <div className="flex space-x-3">
        <button onClick={handleStartStop} disabled={time === 0 && !isRunning && isFinished} className="px-4 py-1 bg-white/15 hover:bg-white/25 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px]">
          {getButtonText()}
        </button>
        <button onClick={handleReset} className="px-4 py-1 bg-white/15 hover:bg-white/25 rounded text-sm transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
};

const MusicPlayer = ({ isPlaying, trackName, onPlayPause, audioSrc }) => {
  return (
    <div className="mt-4 pt-3 text-white text-center w-full max-w-xs mx-auto">
      <p className="text-xs truncate mb-2 px-2" title={trackName}>
        {trackName.replace(/\.(mp3|wav)$/, '') || 'Drop a MP3 file'}
      </p>
      <div className="flex justify-center items-center">
        <button onClick={onPlayPause} disabled={!audioSrc} className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" aria-label={isPlaying ? "Pause music" : "Play music"}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
              <path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
              <path d="M320-200v-560l440 280-440 280Z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

const AudioVisualizer = React.memo(({ analyser, isPlaying, barCount = 16 }) => {
  const [barHeights, setBarHeights] = useState(() => new Array(barCount).fill(0));
  const animationFrameRef = useRef();
  const dataArrayRef = useRef(null);
  const previousHeightsRef = useRef(new Array(barCount).fill(0));
  const isFadingOutRef = useRef(false);
  const smoothing = 0.8;
  const dampingFactor = 0.2;

  useEffect(() => {
    if (analyser) {
      if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      previousHeightsRef.current.fill(0);
      setBarHeights(new Array(barCount).fill(0));
      isFadingOutRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };
  }, [analyser, barCount]);

  useEffect(() => {
    let isActive = true;

    const updateVisualizer = () => {
      if (!isActive || !analyser || !dataArrayRef.current || !isPlaying || isFadingOutRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        return;
      }

      analyser.getByteFrequencyData(dataArrayRef.current);
      const newHeights = [];
      const bufferLength = analyser.frequencyBinCount;
      const relevantLength = Math.floor(bufferLength * 0.75);
      const step = Math.max(1, Math.floor(relevantLength / barCount));

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        const start = i * step;
        const end = Math.min(start + step, relevantLength);
        if (end > start) {
          for (let j = start; j < end; j++) {
            sum += dataArrayRef.current[j];
          }
          sum = sum / (end - start);
        } else {
          sum = dataArrayRef.current[start] || 0;
        }

        let average = Math.min(sum / 255, 1);
        const smoothed = previousHeightsRef.current[i] * smoothing + average * (1 - smoothing);
        previousHeightsRef.current[i] = smoothed;
        const center = (barCount - 1) / 2;
        const distFromCenter = Math.abs(i - center);
        const damping = center > 0 ? (1 - dampingFactor * Math.pow(distFromCenter / center, 2)) : 1;
        const dampedHeight = Math.max(0, smoothed * damping);
        newHeights.push(dampedHeight);
      }

      if (isActive) {
        setBarHeights(newHeights);
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    const smoothFadeOut = () => {
      if (!isActive) return;
      isFadingOutRef.current = true;
      const fade = () => {
        if (!isActive) {
          isFadingOutRef.current = false;
          return;
        }
        let changed = false;
        const next = previousHeightsRef.current.map(h => {
          const nextH = Math.max(0, h * 0.85 - 0.005);
          if (nextH !== h && nextH > 0) changed = true;
          return nextH;
        });
        previousHeightsRef.current = next;
        setBarHeights(next);
        if (changed && isFadingOutRef.current) {
          animationFrameRef.current = requestAnimationFrame(fade);
        } else {
          if (isActive && isFadingOutRef.current) {
            setBarHeights(new Array(barCount).fill(0));
            previousHeightsRef.current.fill(0);
          }
          isFadingOutRef.current = false;
          if (isPlaying && analyser && isActive) {
            animationFrameRef.current = requestAnimationFrame(updateVisualizer);
          }
        }
      };
      animationFrameRef.current = requestAnimationFrame(fade);
    };

    cancelAnimationFrame(animationFrameRef.current);
    isFadingOutRef.current = false;
    if (isPlaying && analyser) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (analyser && previousHeightsRef.current.some(h => h > 0.01)) {
        smoothFadeOut();
      } else {
        setBarHeights(new Array(barCount).fill(0));
        previousHeightsRef.current.fill(0);
        animationFrameRef.current = null;
      }
    }
    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameRef.current);
      isFadingOutRef.current = false;
      animationFrameRef.current = null;
    };
  }, [isPlaying, analyser, barCount]);

  return (
    <div className="flex justify-center items-end w-full h-10 gap-0.5" aria-hidden="true">
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="flex-1 bg-white/60 rounded-t-md"
          style={{ height: `${Math.max(1, height * 40)}px` }}
        />
      ))}
    </div>
  );
});

const FocalWidget = () => {
  const [shape, setShape] = useState(0);
  const [mode, setMode] = useState('stopwatch');
  const [audioSrc, setAudioSrc] = useState(null);
  const [trackName, setTrackName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [visualizerReady, setVisualizerReady] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  const audioRef = useRef(null);
  const dropZoneRef = useRef(null);
  const progressBarRef = useRef(null);
  const isDraggingProgressBarRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const playlistBlobUrlsRef = useRef(new Set());

  useEffect(() => {
    const previousUrls = playlistBlobUrlsRef.current || new Set();
    const currentUrls = new Set(playlist.map(item => item.url));
    previousUrls.forEach(url => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });
    playlistBlobUrlsRef.current = currentUrls;
  }, [playlist]);

  useEffect(() => {
    return () => {
      if (playlistBlobUrlsRef.current) {
        playlistBlobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      const error = audioElement.error;

      setTrackName('');
      setAudioSrc(null);
      setIsPlaying(false);
      setAudioProgress(0);
      setVisualizerReady(false);
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      analyserRef.current = null;
    };
    const updateProgress = () => {
      if (!isDraggingProgressBarRef.current && audioElement.duration && isFinite(audioElement.duration)) {
        const progress = audioElement.currentTime / audioElement.duration;
        if (isFinite(progress)) {
          setAudioProgress(progress);
        } else {
          setAudioProgress(0);
        }
      }
    };
    const handleLoadStart = () => {
      setAudioProgress(0);
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      setVisualizerReady(false);
    };
    const handleCanPlay = () => {};

    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('canplay', handleCanPlay);

    return () => {
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadstart', handleLoadStart);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioRef]);

  const setupAudioContext = useCallback(() => {
    if (!audioRef.current) {
      setVisualizerReady(false);
      return false;
    }
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceNodeRef.current = null;
      analyserRef.current = null;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0;
    }
    if (sourceNodeRef.current && sourceNodeRef.current.mediaElement === audioRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      setVisualizerReady(true);
      return true;
    } else {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      setVisualizerReady(true);
      return true;
    }
  }, []);

  const cycleShape = () => {
    setShape((prev) => (prev + 1) % 2);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'stopwatch' ? 'countdown' : 'stopwatch');
  };

  const handlePlayPause = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioSrc) return;
    const contextSetupSuccess = setupAudioContext();
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioContextRef.current?.resume().then(() => {
        audioElement.play().catch(error => {
          setIsPlaying(false);
          if (error.name === 'NotAllowedError') {
            alert("Playback was blocked. Please interact with the page to enable audio.");
          } else {
            alert(`Error playing audio: ${error.message}`);
          }
        });
      });
    }
  }, [isPlaying, audioSrc, setupAudioContext]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      let newPlaylist = [...playlist];
      let audioFiles = [];
      let imageFile = null;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          if (!imageFile) {
            imageFile = file;
          }
        } else if (
          file.type === 'audio/mpeg' ||
          file.type === 'audio/mp3' ||
          file.type === 'audio/wav' ||
          file.name.toLowerCase().endsWith('.mp3') ||
          file.name.toLowerCase().endsWith('.wav')
        ) {
          audioFiles.push(file);
        }
      }
      if (imageFile) {
        if (backgroundImage && backgroundImage.startsWith('blob:')) {
          URL.revokeObjectURL(backgroundImage);
        }
        const objectURL = URL.createObjectURL(imageFile);
        setBackgroundImage(objectURL);
      }
      if (audioFiles.length > 0) {
        audioFiles.forEach((file, i) => {
          const exists = newPlaylist.some(item => item.name === file.name);
          if (exists) return;
          const objectURL = URL.createObjectURL(file);
          newPlaylist.push({ id: Date.now() + i, file, name: file.name, url: objectURL });
        });
        setPlaylist(newPlaylist);
        if (!audioSrc && newPlaylist.length > 0) {
          const firstAudio = newPlaylist[0];
          setTrackName(firstAudio.name);
          setAudioSrc(firstAudio.url);
        }
      }
    }
  }, [playlist, audioSrc, backgroundImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
    e.dataTransfer.dropEffect = 'copy';
  }, [isDraggingOver]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  }, []);

  const updateAudioTime = useCallback((clientX) => {
    const bar = progressBarRef.current;
    const audioElement = audioRef.current;
    if (!bar || !audioElement || !audioElement.duration || !isFinite(audioElement.duration)) return;
    const rect = bar.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const newTime = ratio * audioElement.duration;
    if (isFinite(newTime) && Math.abs(audioElement.currentTime - newTime) > 0.1) {
      audioElement.currentTime = newTime;
      setAudioProgress(ratio);
    }
  }, []);

  const handleProgressMouseDown = useCallback((e) => {
    if (!audioRef.current || !isFinite(audioRef.current.duration)) return;
    isDraggingProgressBarRef.current = true;
    document.body.style.userSelect = 'none';
    updateAudioTime(e.clientX);
    window.addEventListener('mousemove', handleProgressMouseMove, true);
    window.addEventListener('mouseup', handleProgressMouseUp, true);
  }, [updateAudioTime]);

  const handleProgressMouseMove = useCallback((e) => {
    if (!isDraggingProgressBarRef.current) return;
    updateAudioTime(e.clientX);
  }, [updateAudioTime]);

  const handleProgressMouseUp = useCallback((e) => {
    if (isDraggingProgressBarRef.current) {
      isDraggingProgressBarRef.current = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleProgressMouseMove, true);
      window.removeEventListener('mouseup', handleProgressMouseUp, true);
    }
  }, [handleProgressMouseMove]);

  const handleProgressTouchStart = useCallback((e) => {
    if (!audioRef.current || !isFinite(audioRef.current.duration)) return;
    if (e.touches.length > 0) {
      isDraggingProgressBarRef.current = true;
      updateAudioTime(e.touches[0].clientX);
      window.addEventListener('touchmove', handleProgressTouchMove, { passive: false });
      window.addEventListener('touchend', handleProgressTouchEnd);
      window.addEventListener('touchcancel', handleProgressTouchEnd);
    }
  }, [updateAudioTime]);

  const handleProgressTouchMove = useCallback((e) => {
    if (!isDraggingProgressBarRef.current) return;
    e.preventDefault();
    if (e.touches.length > 0) {
      updateAudioTime(e.touches[0].clientX);
    }
  }, [updateAudioTime]);

  const handleProgressTouchEnd = useCallback(() => {
    if (isDraggingProgressBarRef.current) {
      isDraggingProgressBarRef.current = false;
      window.removeEventListener('touchmove', handleProgressTouchMove);
      window.removeEventListener('touchend', handleProgressTouchEnd);
      window.removeEventListener('touchcancel', handleProgressTouchEnd);
    }
  }, [handleProgressTouchMove]);

  const getSizeClasses = () => {
    switch (shape) {
      case 0: return "w-[16rem] h-auto md:w-64";
      case 1: return "w-[32rem] h-auto md:w-[32rem]";
      default: return "w-[16rem] h-auto md:w-64";
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handlePlaylistSelect = (item) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setVisualizerReady(false);
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    setTrackName(item.name);
    setAudioSrc(item.url);
  };

  return (
    <div className="relative">
      {isMenuOpen && (
        <div className="absolute left-0 top-0 w-64 bg-black/70 text-white p-4 z-0 h-full rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Playlist</h3>
        <div className="p-2 min-h-[150px] overflow-y-auto">
          {playlist.length === 0 ? (
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16px"
                viewBox="0 0 24 24"
                width="16px"
                fill="currentColor"
                className="flex-shrink-0"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <p>Drop audio files here</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {playlist.map(item => (
                <li
                  key={item.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 py-1 px-2 rounded text-sm"
                  onClick={() => handlePlaylistSelect(item)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"/></svg>
                  <span className="truncate">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      )}
      <div className={`transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-64' : 'translate-x-0'} z-10`}>
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`focal-glass p-4 md:p-6 mx-auto relative transition-all duration-500 ease-in-out flex flex-col justify-start items-center ${getSizeClasses()} min-h-[280px] overflow-hidden ${backgroundImage ? 'focal-has-background' : ''}`}
          style={{
            '--bg-image': backgroundImage ? `url(${backgroundImage})` : 'none'
          }}
        >
          <button onClick={toggleMenu} className="absolute top-2 left-2 text-white w-8 h-8 rounded-full flex items-center justify-center focus:outline-none transition-all duration-300 active:scale-90 hover:bg-white/10 z-10" aria-label="Toggle playlist menu">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
          <button onClick={cycleShape} className="absolute top-2 right-2 text-white w-8 h-8 rounded-full flex items-center justify-center focus:outline-none transition-all duration-300 active:scale-90 hover:bg-white/10 z-10" aria-label="Change container shape">
            {shape === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3">
                <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3">
                <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/>
              </svg>
            )}
          </button>
          <div className="text-center space-y-1 w-full mb-4 flex-shrink-0">
            <h2 onClick={toggleMode} className="inline-block px-2 py-0.5 text-sm text-white/80 font-semibold mb-2 capitalize cursor-pointer select-none border border-transparent rounded hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-300" aria-label="Toggle Timer Mode" role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMode()}>
              {mode}
            </h2>
            {mode === 'stopwatch' ? <Stopwatch /> : <CountdownTimer initialMinutes={5} />}
          </div>
          <div className="w-full max-w-xs mx-auto mt-auto flex flex-col flex-grow justify-end">
            <audio ref={audioRef} src={audioSrc || ''} preload="metadata" className="hidden" crossOrigin="anonymous" />
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${analyserRef.current && visualizerReady && isPlaying ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-2">
                {analyserRef.current && (
                  <AudioVisualizer analyser={analyserRef.current} isPlaying={isPlaying} />
                )}
              </div>
            </div>
            <div
              ref={progressBarRef}
              className={`w-full ${audioSrc == null ? "h-0.5" : "h-2"} bg-white/30 rounded cursor-pointer relative overflow-hidden mt-1 touch-none`}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(audioProgress * 100)}
              aria-label="Audio progress"
            >
              <div
                className="h-full bg-white absolute left-0 top-0 pointer-events-none"
                style={{
                  width: `${audioProgress * 100}%`,
                  borderRadius: 'inherit',
                  transition: isDraggingProgressBarRef.current ? 'none' : 'width 0.1s linear'
                }}
              />
            </div>
            <MusicPlayer isPlaying={isPlaying} trackName={trackName} onPlayPause={handlePlayPause} audioSrc={audioSrc} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocalWidget;