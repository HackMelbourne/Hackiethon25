// Hack timer -- ui a bit messed up

import React, { useState, useEffect } from 'react';
import videoFile from './MyAssets-hacktimer/subwaysurfersgameplay.mp4';

const HackTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(prev => !prev);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (amount) => {
    setTimeLeft(prev => {
      const newTime = Math.max(600, Math.min(prev + amount, 3600));
      setInitialTime(newTime);
      return newTime;
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-black rounded-xl shadow-lg text-center space-y-4">
      <h2 className="text-xl font-bold text-white">HACK TIMER</h2>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => adjustTime(-300)}
          className={`text-white text-2xl hover:text-gray-400 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isRunning}
        >
          &lt;
        </button>
        <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
        <button
          onClick={() => adjustTime(300)}
          className={`text-white text-2xl hover:text-gray-400 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isRunning}
        >
          &gt;
        </button>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          Reset
        </button>
      </div>
      
      {isRunning && (
        <div className="mt-4">
          <video 
          src={videoFile} 
          muted 
          autoPlay 
          loop 
          className="w-full rounded-lg" 
          />
        </div>
      )}
    </div>
  );
};

export default HackTimer;
