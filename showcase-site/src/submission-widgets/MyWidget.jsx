import React, { useState } from 'react';

const MyWidget = () => {
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

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Habit Tracker</h2>

        <div className="justify-center bg-white">
          <div>
          <ul>
            {habits.map((habit, index) => <li key={index}>{habit}</li>)}
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWidget;
