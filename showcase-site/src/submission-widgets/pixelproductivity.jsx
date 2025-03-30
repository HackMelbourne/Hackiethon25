"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import VirtualPet from "./components-pixel/virtual-pet.jsx"
import "./styles-pixel/page.css"

// Default assignments to use if no saved data exists
const defaultAssignments = [
  {
    id: "1",
    title: "Complete Project Milestone",
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
    priority: "medium",
    tasks: [
      {
        id: "1",
        title: "Design UI components",
        completed: false,
      },
      {
        id: "2",
        title: "Implement backend API",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: "2",
    title: "Team Meeting Preparation",
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
    priority: "high",
    tasks: [
      {
        id: "1",
        title: "Create presentation slides",
        completed: false,
      },
      {
        id: "2",
        title: "Gather project updates",
        completed: false,
      },
    ],
    progress: 0,
  },
]

const PixelProductivityWidget = () => {
  // Initialize assignments from localStorage or use defaults
  const [assignments, setAssignments] = useState(() => {
    // Try to get assignments from localStorage
    const savedAssignments = localStorage.getItem("pixelProductivityAssignments")
    if (savedAssignments) {
      try {
        // Parse the saved JSON and convert date strings back to Date objects
        const parsedAssignments = JSON.parse(savedAssignments)
        return parsedAssignments.map((assignment) => ({
          ...assignment,
          deadline: new Date(assignment.deadline),
        }))
      } catch (error) {
        console.error("Error parsing saved assignments:", error)
        return defaultAssignments
      }
    }
    // If no saved assignments, use default ones
    return defaultAssignments
  })

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pixelProductivityAssignments", JSON.stringify(assignments))
  }, [assignments])

  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    deadline: new Date(),
    priority: "medium",
    tasks: [],
  })
  const [newTask, setNewTask] = useState("")
  const [currentTask, setCurrentTask] = useState("")
  const [editingTitle, setEditingTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewAllDialog, setShowViewAllDialog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showPrioritySelect, setShowPrioritySelect] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const titleInputRef = useRef(null)

  // Function to reset all data to defaults (optional)
  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all assignments? This cannot be undone.")) {
      setAssignments(defaultAssignments)
    }
  }

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get color class based on days remaining
  const getDeadlineColorClass = (deadline) => {
    const daysRemaining = getDaysRemaining(deadline)
    if (daysRemaining <= 2) return "deadline-critical"
    if (daysRemaining <= 5) return "deadline-warning"
    return "deadline-good"
  }

  // Get color class based on priority
  const getPriorityColorClass = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
    }
  }

  // Add new task to the new assignment form
  const addTaskToNewAssignment = () => {
    if (newTask.trim() === "") return

    const task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
    }

    setNewAssignment({
      ...newAssignment,
      tasks: [...(newAssignment.tasks || []), task],
    })

    setNewTask("")
  }

  // Remove task from new assignment form
  const removeTaskFromNewAssignment = (taskId) => {
    setNewAssignment({
      ...newAssignment,
      tasks: (newAssignment.tasks || []).filter((task) => task.id !== taskId),
    })
  }

  // Create new assignment
  const createAssignment = () => {
    if (!newAssignment.title || !newAssignment.deadline) return

    const assignment = {
      id: Date.now().toString(),
      title: newAssignment.title,
      deadline: newAssignment.deadline,
      priority: newAssignment.priority || "medium",
      progress: 0,
      tasks: newAssignment.tasks || [],
    }

    setAssignments([...assignments, assignment])

    // Reset form
    setNewAssignment({
      title: "",
      deadline: new Date(),
      priority: "medium",
      tasks: [],
    })

    setShowAddDialog(false)
  }

  // Toggle task completion
  const toggleTaskCompletion = (assignmentId, taskId) => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          const updatedTasks = assignment.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed }
            }
            return task
          })

          // Calculate new progress
          const completedTasks = updatedTasks.filter((task) => task.completed).length
          const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0

          return { ...assignment, tasks: updatedTasks, progress }
        }
        return assignment
      }),
    )
  }

  // Delete assignment
  const deleteAssignment = (id) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id))
    if (currentAssignmentIndex >= assignments.length - 1) {
      setCurrentAssignmentIndex(Math.max(0, assignments.length - 2))
    }
    setShowMenu(false)
  }

  // Add task to existing assignment
  const addTaskToAssignment = (assignmentId) => {
    if (currentTask.trim() === "") return

    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          const newTasks = [
            ...assignment.tasks,
            {
              id: Date.now().toString(),
              title: currentTask,
              completed: false,
            },
          ]

          // Recalculate progress
          const completedTasks = newTasks.filter((task) => task.completed).length
          const progress = newTasks.length > 0 ? Math.round((completedTasks / newTasks.length) * 100) : 0

          return { ...assignment, tasks: newTasks, progress }
        }
        return assignment
      }),
    )

    setCurrentTask("")
  }

  // Remove task from existing assignment
  const removeTaskFromAssignment = (assignmentId, taskId) => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          const filteredTasks = assignment.tasks.filter((task) => task.id !== taskId)

          // Recalculate progress
          const completedTasks = filteredTasks.filter((task) => task.completed).length
          const progress = filteredTasks.length > 0 ? Math.round((completedTasks / filteredTasks.length) * 100) : 0

          return { ...assignment, tasks: filteredTasks, progress }
        }
        return assignment
      }),
    )
  }

  // Update assignment title
  const updateAssignmentTitle = (assignmentId) => {
    if (editingTitle.trim() === "") return

    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          return { ...assignment, title: editingTitle }
        }
        return assignment
      }),
    )

    setIsEditingTitle(false)
  }

  // Start editing title
  const startEditingTitle = (title) => {
    setEditingTitle(title)
    setIsEditingTitle(true)
    setShowMenu(false)
    setTimeout(() => {
      titleInputRef.current?.focus()
    }, 100)
  }

  // Update assignment deadline
  const updateDeadline = (assignmentId, date) => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          return { ...assignment, deadline: date }
        }
        return assignment
      }),
    )
    setShowCalendar(false)
  }

  // Update assignment priority
  const updatePriority = (assignmentId, priority) => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          return { ...assignment, priority }
        }
        return assignment
      }),
    )
    setShowPrioritySelect(false)
  }

  // Navigate to previous assignment
  const prevAssignment = () => {
    setCurrentAssignmentIndex((prev) => (prev > 0 ? prev - 1 : assignments.length - 1))
  }

  // Navigate to next assignment
  const nextAssignment = () => {
    setCurrentAssignmentIndex((prev) => (prev < assignments.length - 1 ? prev + 1 : 0))
  }

  // Current assignment
  const currentAssignment = assignments[currentAssignmentIndex]

  // Simple calendar component
  const Calendar = ({ selected, onSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay()
    }

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected =
        selected &&
        date.getDate() === selected.getDate() &&
        date.getMonth() === selected.getMonth() &&
        date.getFullYear() === selected.getFullYear()

      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isPast ? "past" : ""}`}
          onClick={() => !isPast && onSelect(date)}
        >
          {day}
        </div>,
      )
    }

    const prevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1))
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} className="calendar-nav-btn">
            &lt;
          </button>
          <div>{format(currentMonth, "MMMM yyyy")}</div>
          <button onClick={nextMonth} className="calendar-nav-btn">
            &gt;
          </button>
        </div>
        <div className="calendar-weekdays">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="calendar-days">{days}</div>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="widget-container">
        {/* Top Navigation */}
        <div className="top-nav">
          {/* VirtualPet (left side) */}
          <div className="pet-container">
            <VirtualPet />
          </div>

          <div className="top-nav-buttons">
            <button className="view-all-btn" onClick={() => setShowViewAllDialog(true)}>
              View All
            </button>
            <button className="add-btn" onClick={() => setShowAddDialog(true)}>
              +
            </button>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">No assignments yet!</p>
            <p className="empty-hint">Click the + button to add your first assignment.</p>
          </div>
        ) : (
          <>
            {/* Assignment Card */}
            <div className="assignment-card">
              <div className="assignment-header">
                {isEditingTitle ? (
                  <div className="title-edit-container">
                    <input
                      ref={titleInputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="title-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateAssignmentTitle(currentAssignment.id)
                        }
                      }}
                    />
                    <button onClick={() => updateAssignmentTitle(currentAssignment.id)} className="save-btn">
                      Save
                    </button>
                  </div>
                ) : (
                  <h2 className="assignment-title">{currentAssignment.title}</h2>
                )}
                <div className="menu-container">
                  <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
                    •••
                  </button>
                  {showMenu && (
                    <div className="dropdown-menu">
                      <button
                        className="menu-item edit-item"
                        onClick={() => startEditingTitle(currentAssignment.title)}
                      >
                        ✏️ Edit Title
                      </button>
                      <button className="menu-item delete-item" onClick={() => deleteAssignment(currentAssignment.id)}>
                        🗑️ Delete
                      </button>
                      <button className="menu-item reset-item" onClick={resetToDefaults}>
                        🔄 Reset All Data
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="assignment-tags">
                <div className="tag-container">
                  <button className="deadline-tag" onClick={() => setShowCalendar(!showCalendar)}>
                    Due: {format(currentAssignment.deadline, "MMM d, yyyy")} ✏️
                  </button>
                  {showCalendar && (
                    <div className="popover calendar-popover">
                      <Calendar
                        selected={currentAssignment.deadline}
                        onSelect={(date) => updateDeadline(currentAssignment.id, date)}
                      />
                    </div>
                  )}
                </div>

                <div className="tag-container">
                  <button
                    className={`priority-tag ${getPriorityColorClass(currentAssignment.priority)}`}
                    onClick={() => setShowPrioritySelect(!showPrioritySelect)}
                  >
                    {currentAssignment.priority.charAt(0).toUpperCase() + currentAssignment.priority.slice(1)} ✏️
                  </button>
                  {showPrioritySelect && (
                    <div className="popover priority-popover">
                      <h4 className="popover-title">Select Priority</h4>
                      <div className="priority-options">
                        <button
                          className="priority-option priority-low"
                          onClick={() => updatePriority(currentAssignment.id, "low")}
                        >
                          Low
                        </button>
                        <button
                          className="priority-option priority-medium"
                          onClick={() => updatePriority(currentAssignment.id, "medium")}
                        >
                          Medium
                        </button>
                        <button
                          className="priority-option priority-high"
                          onClick={() => updatePriority(currentAssignment.id, "high")}
                        >
                          High
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className={`days-tag ${getDeadlineColorClass(currentAssignment.deadline)}`}>
                  {getDaysRemaining(currentAssignment.deadline)} days left
                </span>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{currentAssignment.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${currentAssignment.progress}%` }}></div>
                </div>
              </div>

              <div className="tasks-section">
                <div className="tasks-header">
                  <h3 className="tasks-title">Tasks</h3>
                  <span className="tasks-count">
                    {currentAssignment.tasks.filter((t) => t.completed).length} of {currentAssignment.tasks.length}{" "}
                    completed
                  </span>
                </div>

                <div className="tasks-list">
                  {currentAssignment.tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-content">
                        <input
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(currentAssignment.id, task.id)}
                          className="task-checkbox"
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`task-label ${task.completed ? "completed" : ""}`}
                        >
                          {task.title}
                        </label>
                      </div>
                      <button
                        onClick={() => removeTaskFromAssignment(currentAssignment.id, task.id)}
                        className="remove-task-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add-task-form">
                  <input
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    placeholder="Add a new task"
                    className="add-task-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTaskToAssignment(currentAssignment.id)
                      }
                    }}
                  />
                  <button onClick={() => addTaskToAssignment(currentAssignment.id)} className="add-task-btn">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {assignments.length > 1 && (
              <div className="navigation">
                <button onClick={prevAssignment} className="nav-btn prev-btn">
                  &lt;
                </button>
                <span className="nav-indicator">
                  {currentAssignmentIndex + 1} of {assignments.length}
                </span>
                <button onClick={nextAssignment} className="nav-btn next-btn">
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Assignment Dialog */}
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Add New Assignment</h2>
              <button className="close-dialog-btn" onClick={() => setShowAddDialog(false)}>
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline" className="form-label">
                  Deadline
                </label>
                <button className="date-picker-btn" onClick={() => setShowCalendar(!showCalendar)}>
                  {newAssignment.deadline ? format(newAssignment.deadline, "PPP") : "Pick a date"}
                </button>
                {showCalendar && (
                  <div className="calendar-container">
                    <Calendar
                      selected={newAssignment.deadline}
                      onSelect={(date) => {
                        setNewAssignment({ ...newAssignment, deadline: date })
                        setShowCalendar(false)
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tasks" className="form-label">
                  Tasks
                </label>
                <div className="add-task-container">
                  <input
                    id="task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task"
                    className="form-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTaskToNewAssignment()
                      }
                    }}
                  />
                  <button onClick={addTaskToNewAssignment} className="add-task-btn">
                    Add
                  </button>
                </div>
                <div className="tasks-preview">
                  {(newAssignment.tasks || []).map((task) => (
                    <div key={task.id} className="task-preview-item">
                      <span className="task-preview-title">{task.title}</span>
                      <button onClick={() => removeTaskFromNewAssignment(task.id)} className="remove-task-btn">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button onClick={createAssignment} className="create-btn">
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Dialog */}
      {showViewAllDialog && (
        <div className="dialog-overlay" onClick={() => setShowViewAllDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">All Assignments</h2>
              <button className="close-dialog-btn" onClick={() => setShowViewAllDialog(false)}>
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="assignments-list">
                {assignments.length === 0 ? (
                  <p className="empty-message">No assignments yet!</p>
                ) : (
                  assignments.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      className="assignment-list-item"
                      onClick={() => {
                        setCurrentAssignmentIndex(index)
                        setShowViewAllDialog(false)
                      }}
                    >
                      <div className="assignment-list-header">
                        <h3 className="assignment-list-title">{assignment.title}</h3>
                        <span className={`days-remaining ${getDeadlineColorClass(assignment.deadline)}`}>
                          {getDaysRemaining(assignment.deadline)} days left
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${assignment.progress}%` }}></div>
                      </div>
                      <div className="assignment-list-footer">
                        <span className={`priority-indicator ${getPriorityColorClass(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
                        </span>
                        <span className="tasks-indicator">
                          {assignment.tasks.filter((t) => t.completed).length} of {assignment.tasks.length} tasks done
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PixelProductivityWidget;
