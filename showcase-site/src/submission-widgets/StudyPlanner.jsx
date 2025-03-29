// By: Sher-Wen Chan and Stuti Gupta
import React, { useState } from 'react';
import './StudyPlanner.css';

const StudyPlanner = () => {
  const [task, setTask] = useState('Study');
  const [idealSchedule, setIdealSchedule] = useState([]);
  const [real, setReal] = useState(null);

  const addTask = async () => {
    if (!task) return;
    const task1 = task;
    setIdealSchedule((prev) => [...prev, task1]);
    setTask("");
  };

  const fetchReal = () => {
    setReal(idealSchedule); 

  };
  
  function Item({task1}) {
    if (task1 == 'Entertainment') {
      return (
        <ul>
          <li
            className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
            >
            <span>Entertainment</span>
          </li>
          <li
            className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
            >
            <span>Entertainment</span>
          </li>
        </ul>
        );
    }
    else if (task1 == 'Study') {
      return (
        <li
          className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
          > 
          <span>aRe YoU rEaLlY sTuDyInG???</span>
        </li>
      );
    }
    return (
      <li
        className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
        >
        <span>{task1}</span>
      </li>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Study Planner</h2>
      <select
        value={task}
        onChange={(e) => setTask(e.target.value)}
        id = "task"
        className="flex-1 p-2 mb-3 bg-gray-800 rounded text-white"
      >
        <option value="Study">Study</option>
        <option value="Sleep">Sleep</option>
        <option value="Food">Food</option>
        <option value="Entertainment">Entertainment</option>
      </select>
      <button 
        onClick={addTask}
        className="ml-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition"
        >
          Insert Task
      </button>

      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className= "text -lg font-semibold mb-2">Ideal Schedule</h2>
        {idealSchedule.length > 0 ? (
          <ul>
            {idealSchedule.map((task1) => (
              <li
                key={task1}
                className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
              >
              <span>{task1}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No tasks added yet</p>
        )}
      </div>

      <button 
        onClick={fetchReal}
        className="studyplanner-go mb-3 justify-center bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition"
        >
          Generate
      </button>


      {/*outputs the real schedule*/}
      {real && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className= "text -lg font-semibold mb-2">Real Schedule</h2>
        
        
        {real.length > 0 ? (
          <ul>
            <li
            className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
            >
            <span>Sleep</span>
            </li>
            {real.map((task1) => (
              <Item
                task1={task1}
              />        
            ))}
            <li
            className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 transition"
            >
            <span>Sleep</span>
            </li>
          </ul>
        ) : (
          <p className="text-gray-400">No tasks added yet</p>
        )}
        </div>
      )}

    </div>
  );
};

export default StudyPlanner;
