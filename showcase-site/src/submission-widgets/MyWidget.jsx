import React, { useState } from 'react';

const LabelWidget = () => {
  const [text, setText] = useState('');

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-blue-600">
          {text}
        </div>

        <div className="flex justify-center">
          {/* The input is hidden but still functional */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="p-4 border border-gray-300 rounded-md w-full h-32 resize-none opacity-0 absolute"
            placeholder="Type something..."
          />
        </div>
      </div>
    </div>
  );
};

export default LabelWidget;
