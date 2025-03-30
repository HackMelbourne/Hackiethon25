import React, { useState, useEffect, useRef } from 'react';
import petHealthy1 from './assetss-guilt/pet_healthy1.png';
import petHealthy2 from './assetss-guilt/pet_healthy2.png';
import petNeutral1 from './assetss-guilt/pet_neutral1.png';
import petNeutral2 from './assetss-guilt/pet_neutral2.png';
import petSad1 from './assetss-guilt/pet_sad1.png';
import petSad2 from './assetss-guilt/pet_sad2.png';
import petSick1 from './assetss-guilt/pet_sick1.png';
import petSick2 from './assetss-guilt/pet_sick2.png';
import frame12 from './assetss-guilt/Frame 12.png';


const petFrames = {
  healthy: [petHealthy1, petHealthy2],
  neutral: [petNeutral1, petNeutral2],
  sad: [petSad1, petSad2],
  sick: [petSick1, petSick2],
};

function getPetMood(missedTotal, completedTotal) {
  const completedLevels = Math.floor(completedTotal / 3);
  const missedLevels = Math.floor(missedTotal / 3);
  const netLevel = completedLevels - missedLevels;
  if (netLevel > 0) return 'healthy';
  if (netLevel === 0) return 'neutral';
  if (netLevel === -1) return 'sad';
  return 'sick';
}
const guiltTripMessages = {
  neutral: [
    "If you don't finish {taskName} by {dueDate}, I might lose my home... but it's fine I guess...",
  ],
  sick: [
    "I… I don’t feel so good… please... do your work... before all your overdue tasks kill us both.",
  ],
  sad: [
    "I was really hoping you’d do {taskName} on time… but I see how it is. Due: {dueDate}. No pressure.",
  ],
  healthy: [
    "Because you finished {taskName}, I can finally eat today. You're my hero!",
  ],
};

function getPartialStyleColors(mood) {
  switch (mood) {
    case 'sick':
      return { entireTextColor: 'white', placeholderColor: '#15e684' };
    case 'sad':
      return { entireTextColor: 'black', placeholderColor: 'olive' };
    case 'neutral':
      return { entireTextColor: 'black', placeholderColor: '#006400' };
    case 'healthy':
      return { entireTextColor: 'black', placeholderColor: '#228B22' };
    default:
      return { entireTextColor: 'black', placeholderColor: 'black' };
  }
}

const GuiltTrip = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [dialoguePhase, setDialoguePhase] = useState(1);
  const [typedText, setTypedText] = useState('');
  const [guiltTripMessage, setGuiltTripMessage] = useState('');
  const message = 'This is your pet. Take care of it well!';
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const removalTimeouts = useRef({});
  const [missedTotal, setMissedTotal] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrameIndex(prev => prev + 1);
    }, 500);
    return () => clearInterval(frameInterval);
  }, []);
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700;900&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  function calculateDaysUntil(year, month, day) {
    const due = new Date(year, month - 1, day);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  }

  function addTask() {
    if (!task.trim()) return;
    const dueDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const daysUntilDue = calculateDaysUntil(selectedYear, selectedMonth, selectedDay);
    const newTask = {
      id: Date.now(),
      name: task,
      dueDate: dueDateStr,
      daysUntilDue,
      completed: false,
      alreadyMissed: false,
    };
    setTasks(prev => [...prev, newTask]);
    setTask('');
    const newToday = new Date();
    setSelectedYear(newToday.getFullYear());
    setSelectedMonth(newToday.getMonth() + 1);
    setSelectedDay(newToday.getDate());
  }

  function toggleTaskCompletion(id) {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const wasCompleted = t.completed;
          const newCompleted = !wasCompleted;
          if (!wasCompleted && newCompleted) {
            if (t.daysUntilDue < 0) {
              setMissedTotal(m => m + 1);
            } else {
              setCompletedTotal(c => c + 1);
            }
            const timeoutId = setTimeout(() => {
              setTasks(p2 => p2.filter(x => x.id !== id));
              delete removalTimeouts.current[id];
            }, 10000);
            removalTimeouts.current[id] = timeoutId;
          } else if (wasCompleted && !newCompleted) {
            if (removalTimeouts.current[id]) {
              clearTimeout(removalTimeouts.current[id]);
              delete removalTimeouts.current[id];
            }
          }
          return { ...t, completed: newCompleted };
        }
        return t;
      })
    );
  }
  useEffect(() => {
    const overdueInterval = setInterval(() => {
      setTasks(prev =>
        prev.map(t => {
          const [y, m, d] = t.dueDate.split('-').map(Number);
          const newDays = calculateDaysUntil(y, m, d);
          if (!t.completed && newDays < 0 && !t.alreadyMissed) {
            setMissedTotal(m2 => m2 + 1);
            return { ...t, daysUntilDue: newDays, alreadyMissed: true };
          }
          return { ...t, daysUntilDue: newDays };
        })
      );
    }, 1000);
    return () => clearInterval(overdueInterval);
  }, []);
  const petMood = getPetMood(missedTotal, completedTotal);
  const framesForMood = petFrames[petMood] || petFrames.neutral;
  const petImg = (
    <img
      src={framesForMood[frameIndex % framesForMood.length]}
      alt="Pet"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
      }}
    />
  );
  useEffect(() => {
    if (!tasks.length) {
      setGuiltTripMessage('');
      return;
    }
    const sorted = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const nearest = sorted[0];
    const moodMsgs = guiltTripMessages[petMood] || ["Don't forget your task!"];
    const chosen = moodMsgs[Math.floor(Math.random() * moodMsgs.length)];

    const { entireTextColor, placeholderColor } = getPartialStyleColors(petMood);

    let replaced = chosen
      .replace(
        '{taskName}',
        `<span style="color:${placeholderColor}">${nearest.name}</span>`
      )
      .replace(
        '{dueDate}',
        `<span style="color:${placeholderColor}">${nearest.dueDate}</span>`
      );

    replaced = `<span style="color:${entireTextColor}">${replaced}</span>`;

    setGuiltTripMessage(replaced);
  }, [tasks, petMood]);

  useEffect(() => {
    if (currentPage !== 'home') return;
    setDialoguePhase(1);
    setTypedText('');
    let i = 0;
    const timeouts = [];
    const typingInterval = setInterval(() => {
      if (i < message.length) {
        i++;
        setTypedText(message.slice(0, i));
      } else {
        clearInterval(typingInterval);
        const t1 = setTimeout(() => {
          setDialoguePhase(2);
          const t2 = setTimeout(() => {
            setDialoguePhase(0);
          }, 4000);
          timeouts.push(t2);
        }, 3000);
        timeouts.push(t1);
      }
    }, 50);
    return () => {
      clearInterval(typingInterval);
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [currentPage, message]);

  // Date pickers
  const currentYearVal = today.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYearVal + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const completedCountNow = tasks.filter(t => t.completed).length;
  const missedCountNow = tasks.filter(t => !t.completed && t.daysUntilDue < 0).length;
  const totalTasksNow = tasks.length;

  return (
    <div
      style={{
        position: 'relative',
        width: 400,
        height: 400,
        fontFamily: '"Pixelify Sans", sans-serif',
        overflow: 'hidden',
      }}
      className="mx-auto rounded-xl shadow-lg"
    >
      {currentPage === 'home' && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {petImg}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, fontSize: 12, color: '#000' }}>
            <p>{completedCountNow}/{totalTasksNow} finished tasks</p>
            <p>{missedCountNow}/{totalTasksNow} missed tasks</p>
          </div>
          <button
            onClick={() => setCurrentPage('todolist')}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 80,
              padding: '6px',
              fontSize: 12,
              backgroundColor: '#ccf',
              borderRadius: 8,
              border: '1px solid #888',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            ToDo List
          </button>

          {dialoguePhase === 1 && (
            <p
              style={{
                position: 'absolute',
                top: '20%',
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#000',
                zIndex: 1,
                whiteSpace: 'pre-wrap',
                padding: '0 10px',
              }}
            >
              {typedText}
            </p>
          )}

          {dialoguePhase === 2 && guiltTripMessage && (
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 1,
                padding: '0 10px',
              }}
              dangerouslySetInnerHTML={{ __html: guiltTripMessage }}
            />
          )}
        </div>
      )}
      {currentPage === 'todolist' && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundImage: `url(${frame12})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              padding: '6px 10px',
              fontSize: 12,
              backgroundColor: '#fff',
              border: '2px solid #888',
              cursor: 'pointer',
            }}
          >
            PET
          </button>
          <button
            onClick={() => setCurrentPage('addtask')}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '6px 10px',
              fontSize: 12,
              backgroundColor: '#fff',
              border: '2px solid #888',
              cursor: 'pointer',
            }}
          >
            ADD
          </button>
          <div
            style={{
              position: 'absolute',
              top: 110,
              left: 100,
              right: 90,
              bottom: 90,
              overflowY: 'auto',
            }}
          >
            {tasks.length === 0 ? (
              <p style={{ color: '#000', textAlign: 'center' }}>No tasks yet.</p>
            ) : (
              tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskCompletion(t.id)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #CCC',
                    marginBottom: 6,
                    padding: 6,
                    cursor: 'pointer',
                    borderRadius: 8,
                  }}
                >
                  <div style={t.completed ? { textDecoration: 'line-through', color: '#999' } : { fontWeight: 'bold' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    Due: {t.dueDate} (in {t.daysUntilDue} day{t.daysUntilDue !== 1 ? 's' : ''})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )
      }
      {
        currentPage === 'addtask' && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${frame12})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <button
              onClick={() => setCurrentPage('todolist')}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                padding: '6px 10px',
                fontSize: 12,
                backgroundColor: '#fff',
                border: '2px solid #888',
                cursor: 'pointer',
              }}
            >
              BACK
            </button>
            <div
              style={{
                position: 'absolute',
                top: 110,
                left: 50,
                right: 50,
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  color: '#fff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                NEW TASK
              </h2>
              <input
                type="text"
                placeholder="Enter task name..."
                style={{
                  display: 'block',
                  margin: '0 auto',
                  width: '60%',
                  backgroundColor: '#fff',
                  padding: 8,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  marginBottom: 12,
                  fontSize: 12,
                }}
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: 4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  DUE DATE
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{
                      width: 60,
                      padding: 4,
                      borderRadius: 4,
                      fontSize: 12,
                      backgroundColor: '#fff',
                    }}
                  >
                    {years.map(yr => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    style={{
                      width: 40,
                      padding: 4,
                      borderRadius: 4,
                      fontSize: 12,
                      backgroundColor: '#fff',
                    }}
                  >
                    {months.map(m => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    style={{
                      width: 40,
                      padding: 4,
                      borderRadius: 4,
                      fontSize: 12,
                      backgroundColor: '#fff',
                    }}
                  >
                    {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        {String(d).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  addTask();
                  setCurrentPage('todolist');
                }}
                style={{
                  backgroundColor: '#fff',
                  border: '2px solid #888',
                  borderRadius: 8,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ADD
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}


export default GuiltTrip;