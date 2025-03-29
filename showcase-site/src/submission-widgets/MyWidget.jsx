import React, { useState } from 'react';

const MyWidget = () => {
  const [text, setText] = useState('Hello, World!');
  const userName = "Name"; // corresponding level name

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex justify-between items-start">
      <div className="bg-white rounded-xl shadow-md  h-[500px] flex flex-col">
        <h2 className="text-3xl font-bold text-gray-800">Hello {userName}!</h2>
        <div className="text-xl font-bold text-blue-600">
          Daily Tasks

        </div>
        <div className="border-4 bg-green-500 w-40 h-70 bg-clip-border p-3">To-do List
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-end">
          <div className="text-xl font-bold text-indigo-600">Current Status</div>
          <div className="border-4 bg-blue-500 w-40 h-10 bg-clip-border p-3">HP Bar</div>
          <div className="border-4 bg-cyan-500 w-40 h-10 bg-clip-border p-3">XP Bar</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 w-1/2 h-[500px] flex flex-col justify-between ">
        <div className="text-xl font-bold text-indigo-600">User Profile</div>
        <div className="border-4 bg-blue-500 w-40 h-40 bg-clip-border p-3">Emoji Here</div>
        <div className="border-4 bg-cyan-500 w-50 h-40 bg-clip-border p-3">Level Description</div>
      </div>



    </div>
  );
};

export default MyWidget;