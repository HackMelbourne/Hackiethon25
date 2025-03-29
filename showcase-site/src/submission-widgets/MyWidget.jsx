import React, { useState } from 'react';

const MyWidget = () => {
  const [text, setText] = useState('Hello, World!');

  const changeText = () => setText('Text has been changed!');

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Our habit tracker</h2>

        <div className="text-2xl font-bold text-blue-600">
          {text}
        </div>

        <div className="flex justify-center">
          <button
            onClick={changeText}
            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            Change Text
          </button>
        </div>
      </div>
      <ProgressBar type="hp" />
      <ProgressBar type="xp" />
    </div>
  );
};

const ProgressBar = (props) => {
  const colors = {
    5: "darkred",
    10: "firebrick",
    20: "darkorange",
    40: "orange",
    60: "gold",
    80: "olivedrab",
    100: "limegreen",
  }
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("limegreen"); // Default xp bar colour

  const updateProgress = () => {
    // Modify if needed
    if (progress == 100) {
      setProgress(0);
    } else if (progress >= 90) {
      setProgress(100);
    } else {
      setProgress(progress+10);
    }

    // Manages colour of hp bar
    if (props.type == 'hp') {
      for (let i in colors) {
        if (progress <= i) {
          setColor(colors[i]);
          break
        }
      }
    }
  }


  return (
    <div>
      <div className="size-100% bg-gray-200 rounded-full h-4 block mt-4 mb-4"> 
        <div 
          className="rounded-full h-full transition-all duration-500"
          style={{
                  width: `${progress}%`,
                  background: color,
                }}
        ></div>
      </div>
      {/* Remove later */}
      <button className="bg-red-100" onClick={updateProgress}>Change</button>
    </div>
  )
}

export default MyWidget;
