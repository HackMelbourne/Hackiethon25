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
      <ProgressBar color="Red" />
    </div>
  );
};

const ProgressBar = (props) => {
  const [progress, setProgress] = useState(0);
  return (
    <div className="size-100% bg-gray-200 rounded-full h-4 block mt-4 mb-4"> 
    <div 
      className="rounded-full h-10 transition-all duration-500"
      style={{
              width: `${progress}%`,
              color: props.color
            }}
    ></div>
    </div>
  )
}

export default MyWidget;
