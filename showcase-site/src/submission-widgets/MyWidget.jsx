import React, { useState } from 'react';
import { TiHeartFullOutline } from "react-icons/ti";
import { TiStarFullOutline } from "react-icons/ti";

const MyWidget = () => {
  const [level, setLevel] = useState(0)
  const [habits, setHabits] = useState(["Test Habit"])

  //Tracks the habit that is currently being edited (null if none are being edited)
  const [editingHabit, setEditingHabit] = useState(null)

  const addHabit = (newHabitName) => setHabits([...habits, newHabitName])

  const editHabit = (habitIndex, newHabitName) => {
    let newHabits = [...habits]
    newHabits[habitIndex] = newHabitName
    setHabits(newHabits)
  }

  const deleteHabit = (habitIndex) => {
    let newHabits = []
    for(let i = 0; i < habits.length; i++) {
      if (i !== habitIndex)
        newHabits.push(habits[i])
    }


    setHabits(newHabits)
  }

  const levelUp = () => {
    if (level < 10) {
      setLevel(level+1);
    } else {
      setLevel(0);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Our habit tracker</h2>

        <div className="text-2xl font-bold text-blue-600">
        </div>

        <div className="justify-center bg-white">
          <div>
          <ul>
            {habits.map((habit, index) => <li key={index}>{habit}</li>)}
          </ul>
          </div>
        </div>
      </div>
      <ProgressBar type="hp" level={level} />
      <ProgressBar type="xp" level={level} />
      <p>Level: {level}</p>
      <button className="bg-red-100" onClick={levelUp}>Increase level</button>
    </div>
  );
};

const ProgressBar = (props) => {
  const hpcolors = {
    5: "#740000",
    10: "#e24221",
    25: "#f7921a",
    37: "#fbb72a",
    50: "#ffe13d",
    70: "#bce444",
    100: "#66e74e",
  }
  const xpcolors = [
    "#05003d",
    "#261ca3",
    "#4f0b99",
    "#9d49ff",
    "#d841ff",
    "#ff4099",
    "red", // Do some fancy gradients or something
    "red",
    "red",
    "red",
    "red",
  ]
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("blue"); // Error

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
      for (let i in hpcolors) {
        if (progress <= i) {
          setColor(hpcolors[i]);
          break
        }
      }
    } else {
      console.log(`level is ${props.level}`)
      setColor(xpcolors[props.level]);
      console.log(`set colour to ${color}`)
    }
  }

  return (
    <div className="block mt-4 mb-4">
      {props.type == "hp" ? <TiHeartFullOutline /> : <TiStarFullOutline />}
      <div className="size-100% bg-gray-200 rounded-full h-4"> 
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
