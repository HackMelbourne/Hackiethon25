// By Tanmay Warkhede
import React, { useState, useEffect } from "react";

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsBreak(!isBreak);
            setTimeLeft(isBreak ? 25 * 60 : 5 * 60); // Switch between work/break
            return isBreak ? 25 * 60 : 5 * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, isBreak]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-container p-4 bg-gray-100 rounded-lg text-center shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">{isBreak ? "Break Time" : "Work Time"}</h2>
      <p className="text-4xl font-mono my-4 text-gray-900">{formatTime(timeLeft)}</p>
      <div className="space-x-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(25 * 60);
            setIsBreak(false);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
