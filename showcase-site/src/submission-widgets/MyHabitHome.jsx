// By: fairy Zhao
import React, { useState, useEffect } from "react";
import bg0 from "./myhabithomeimages/bg0.png";
import bg1 from "./myhabithomeimages/bg1.png";
import bg2 from "./myhabithomeimages/bg2.png";
import bg3 from "./myhabithomeimages/bg3.png";
import bg4 from "./myhabithomeimages/bg4.png";


const MyHabitHome = () => {
  const [habitCount, setHabitCount] = useState(0);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [levelUp, setLevelUp] = useState(false);
  const [prevHabitCount, setPrevHabitCount] = useState(0);
  const [streakIncrementedToday, setStreakIncrementedToday] = useState(false);

  useEffect(() => {
    const savedHabitCount = localStorage.getItem("habitCount");
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    const savedStreak = localStorage.getItem("streak");
    const savedLastDate = localStorage.getItem("lastCompletedDate");

    if (savedHabitCount !== null) setHabitCount(Number(savedHabitCount));
    if (savedTodos.length) setTodos(savedTodos);
    if (savedStreak !== null) setStreak(Number(savedStreak));
    if (savedLastDate) setLastCompletedDate(savedLastDate);
  }, []);

  useEffect(() => {
    localStorage.setItem("habitCount", habitCount);
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCompletedDate", lastCompletedDate);
  }, [habitCount, todos, streak, lastCompletedDate]);

  useEffect(() => {
    if (habitCount > prevHabitCount) {
      setLevelUp(true);
      setTimeout(() => setLevelUp(false), 1000);
    }
    setPrevHabitCount(habitCount);
  }, [habitCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.reminderTime && !todo.done) {
          const [hours, minutes] = todo.reminderTime.split(":");
          const taskTime = new Date();
          taskTime.setHours(hours);
          taskTime.setMinutes(minutes);
          taskTime.setSeconds(0);

          if (now.getHours() === taskTime.getHours() && now.getMinutes() === taskTime.getMinutes()) {
            alert(`⏰ Reminder: ${todo.text}`);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [todos]);

  useEffect(() => {
    const today = new Date().toDateString();
    const allCompleted = todos.length > 0 && todos.every(todo => todo.done);

    if (allCompleted && !streakIncrementedToday && lastCompletedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastCompletedDate === yesterday.toDateString()) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(1);
      }

      setLastCompletedDate(today);
      setStreakIncrementedToday(true);
    }
  }, [todos, lastCompletedDate, streakIncrementedToday]);

  const completeTask = () => {
    setHabitCount((prev) => Math.min(prev + 1, 4));
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);

    if (newTodos[index].done) {
      completeTask();
    } else {
      setHabitCount((prev) => Math.max(prev - 1, 0));
    }
  };

  const deleteTodo = (index) => {
    const updatedTodos = [...todos];
    updatedTodos.splice(index, 1);
    setTodos(updatedTodos);
  };

  const resetDay = () => {
    setTodos([]);
    setHabitCount(0);
    setStreakIncrementedToday(false);
    setLastCompletedDate(null); // Ensure this resets properly
  };

  const getHouseImage = () => {
    if (habitCount === 0) return bg0;
    if (habitCount === 1) return bg1;
    if (habitCount === 2) return bg2;
    if (habitCount === 3) return bg3;
    return bg4;
  };

  return (
    <div className={`relative w-80 max-w-xs mx-auto border rounded-3xl overflow-visible shadow-xl transition-all duration-700 ${levelUp ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
      <div className="w-full aspect-square bg-cover bg-center rounded-t-3xl overflow-hidden" style={{ backgroundImage: `url(${getHouseImage()})` }}>
        <div className="absolute top-2 w-full text-center">
          <h2 className="text-xl font-bold text-white drop-shadow-md">🏡 HabitHouse</h2>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md p-4 rounded-b-3xl">
        <p className="text-sm text-center text-gray-800">
          ✅ Complete your tasks to upgrade your home!
        </p>

        <p className="text-center font-semibold text-base text-gray-800 mt-1">
          Tasks completed: {todos.filter(t => t.done).length}/{todos.length}
        </p>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add task ✍️"
            className="px-2 py-1 border rounded w-full"
          />
          <button
            onClick={() => {
              if (newTodo.trim()) {
                setTodos([...todos, { text: newTodo, done: false, reminderTime: "" }]);
                setNewTodo("");
              }
            }}
            className="bg-green-500 text-white px-3 rounded hover:bg-green-600"
          >Add</button>
        </div>

        <ul className="mt-2 space-y-2 text-sm max-h-60 overflow-y-auto">
          {todos.map((todo, i) => (
            <li key={i} className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(i)}
                />
                <span className={todo.done ? "line-through text-gray-400" : "text-gray-800"}>{todo.text}</span>
                <button
                  onClick={() => deleteTodo(i)}
                  className="text-red-500 text-xs ml-auto hover:underline"
                >Delete</button>
              </div>
              {!todo.done && (
                <div className="flex items-center gap-2 ml-6 mt-1">
                  <input
                    type="time"
                    value={todo.reminderTime || ""}
                    onChange={(e) => {
                      const updatedTodos = [...todos];
                      updatedTodos[i].reminderTime = e.target.value;
                      setTodos(updatedTodos);
                    }}
                    className="text-xs border px-2 py-1 rounded"
                  />
                  <span className="text-xs text-gray-500">Set reminder</span>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-700">🔥 Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
          <button
            onClick={resetDay}
            className="text-xs text-blue-600 underline hover:text-blue-800"
          >Move on to next day</button>
        </div>
      </div>
    </div>
  );
};

export default MyHabitHome;
