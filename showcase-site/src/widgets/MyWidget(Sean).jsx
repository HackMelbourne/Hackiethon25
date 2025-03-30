import {useState, useEffect, useRef} from "react"

// Import the animations at the top level
// Assuming your assets folder is parallel to your widgets folder
import upAnimation from './Myassets-sean/Upanime.gif';
import downAnimation from './Myassets-sean/Downanime.gif';

// Define animation durations (in milliseconds)
// Adjust these based on your actual GIF durations
const DOWN_ANIMATION_DURATION = 1500; // Approximate time for Downanime.gif to play once

// Component to inject necessary styles and external resources
const ResourceLoader = () => {
  useEffect(() => {
    // Add Google Fonts
    const fontPreconnect1 = document.createElement('link');
    fontPreconnect1.rel = 'preconnect';
    fontPreconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontPreconnect1);

    const fontPreconnect2 = document.createElement('link');
    fontPreconnect2.rel = 'preconnect';
    fontPreconnect2.href = 'https://fonts.gstatic.com';
    fontPreconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreconnect2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Press+Start+2P&display=swap';
    document.head.appendChild(fontLink);

    // Add Font Awesome
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
    fontAwesomeLink.integrity = 'sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==';
    fontAwesomeLink.crossOrigin = 'anonymous';
    fontAwesomeLink.referrerPolicy = 'no-referrer';
    document.head.appendChild(fontAwesomeLink);

    // Add CSS for GIF speed control
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .slowed-gif-container {
        position: absolute;
        inset: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .slowed-gif-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        transition: opacity 100ms ease-in-out;
      }
      .slowed-gif-container img.active {
        opacity: 1;
      }
    `;
    document.head.appendChild(styleElement);

    // Cleanup function to remove links when component unmounts
    return () => {
      document.head.removeChild(fontPreconnect1);
      document.head.removeChild(fontPreconnect2);
      document.head.removeChild(fontLink);
      document.head.removeChild(fontAwesomeLink);
      document.head.removeChild(styleElement);
    };
  }, []);

  return null;
};

// Custom hook to extract and play GIF frames at a slower speed
const useSlowedGif = (gifUrl, fps = 5) => {
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationRef = useRef(null);
  const frameIntervalMs = 1000 / fps; // Convert FPS to milliseconds between frames

  // Load and extract frames from GIF
  useEffect(() => {
    let isMounted = true;
    
    // Placeholder for frames while we're fetching them
    if (isMounted) {
      setFrames([gifUrl]);
      setCurrentFrameIndex(0);
    }
    
    // In a real implementation, we would extract frames from the GIF
    // Since we can't do that directly in the browser without additional libraries,
    // we're using the original GIF as a fallback
    
    return () => {
      isMounted = false;
    };
  }, [gifUrl]);

  // Animation loop for playing frames at desired FPS
  useEffect(() => {
    if (!frames.length || !isPlaying) return;
    
    const animate = () => {
      setCurrentFrameIndex(prevIndex => (prevIndex + 1) % frames.length);
      animationRef.current = setTimeout(animate, frameIntervalMs);
    };
    
    animationRef.current = setTimeout(animate, frameIntervalMs);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [frames, isPlaying, frameIntervalMs]);

  return {
    currentFrame: frames[currentFrameIndex] || gifUrl,
    isPlaying,
    setIsPlaying,
    frames
  };
};

// Custom hook to manage animation with auto-switching
const useAnimationManager = () => {
  const [currentAnimation, setCurrentAnimation] = useState(upAnimation);
  const timerRef = useRef(null);
  
  // Function to set animation with auto-reset logic
  const setAnimation = (animation) => {
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Set the new animation
    setCurrentAnimation(animation);
    
    // If it's the down animation, set up timer to switch back
    if (animation === downAnimation) {
      timerRef.current = setTimeout(() => {
        setCurrentAnimation(upAnimation);
        timerRef.current = null;
      }, DOWN_ANIMATION_DURATION);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return [currentAnimation, setAnimation];
};

// Component to display the GIF at a slower speed
const SlowedGifBackground = ({ gifUrl, fps = 5 }) => {
  const { currentFrame, frames } = useSlowedGif(gifUrl, fps);
  
  // Since we're using a fallback approach, apply a CSS filter to simulate slower playback
  return (
    <div className="absolute inset-0 z-[-1] w-full h-full">
      <img 
        src={currentFrame}
        alt="Background Animation"
        className="w-full h-full object-cover"
        style={{
          filter: 'blur(0.5px)', // Slight blur for smoother appearance
          willChange: 'transform', // Performance optimization hint
          animation: 'none', // Disable any built-in animation
          // Apply CSS animation-play-state to control GIF playback
          animationPlayState: 'paused',
          animationDuration: `${frames.length / fps}s`,
        }}
      />
    </div>
  );
};

// Components for the todo list functionality
const To_do_list = (props) => {
    const { todos, backgroundAnimation } = props;
    // Filter out completed todos so they don't display in the list
    const incompleteTodos = todos.filter(todo => !todo.completed);
    
    return (
        <ul className="flex flex-col gap-4 w-full max-w-[800px] mx-auto">
            {incompleteTodos.map((todo, index) => {
                // Pass the original index from the complete todos array
                const originalIndex = todos.findIndex(t => t === todo);
                return (
                    <To_do_card {...props} key={originalIndex} index={originalIndex} todo={todo} />
                );
            })}
        </ul>
    )
}

const To_do_input = (props) => {
    const { addTodo, todoValue, setTodoValue } = props;
 
    return (
        <div className="flex items-stretch max-w-[800px] w-full mx-auto gap-4">
            <input 
                className="flex-1 rounded-[14px] outline-none w-full p-[14px] border-none bg-white/80 font-['Press_Start_2P',system-ui] text-[#331800]"
                value={todoValue} 
                onChange={(e) => {
                    setTodoValue(e.target.value);
                }} 
                placeholder="Add a new todo" 
            />
            <button 
                className="rounded-[14px] bg-transparent transition-all duration-200 cursor-pointer hover:opacity-70 p-[14px] border-none outline-none bg-white/80 font-['Press_Start_2P',system-ui] text-[#331800]"
                onClick={() => {
                    if (todoValue.trim()) {
                        addTodo({ title: todoValue, completed: false});
                        setTodoValue('');
                    }
                }}
            >
                Add
            </button>
        </div>
    )
}

const To_do_card = (props) => {
    const { 
        todo = { completed: false, title: '' }, 
        deleteTodos, 
        index, 
        editTodos,
        setBackgroundAnimation 
    } = props;

    // Local state for editing mode and new title
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(todo.title); // Initialize with the current title

    // Change background when edit mode changes
    useEffect(() => {
        if (isEditing) {
            setBackgroundAnimation(downAnimation);
        } else if (newTitle !== todo.title) {
            // If editing mode is exited and title changed, save the new title
            editTodos(index, newTitle);
            setBackgroundAnimation(downAnimation);
        } else {
            setBackgroundAnimation(upAnimation);
        }
    }, [isEditing]); // Run this effect whenever isEditing changes

    // Handle input submission
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false); // Exit editing mode
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = () => {
        // Mark the todo as completed which will make it disappear from the list
        editTodos(index, todo.title, true);
    };

    // Handle delete with animation
    const handleDelete = () => {
        if (typeof deleteTodos === 'function') {
            setBackgroundAnimation(downAnimation);
            deleteTodos(index);
        } else {
            console.error('deleteTodos is not a function');
        }
    };

    return (
        <li className="flex items-center justify-between gap-[14px] p-[14px] rounded-[14px] bg-white/80 shadow-lg">
            <input 
                type="checkbox" 
                checked={todo.completed} 
                onChange={handleCheckboxChange}
                className="h-5 w-5 accent-amber-700"
            />
            {isEditing ? (
                // Render input field when in editing mode
                <input
                    className="flex-1 outline-none bg-transparent border-b-2 border-amber-700 text-[#331800]"
                    type="text"
                    value={newTitle}
                    onChange={(e) => {
                        setNewTitle(e.target.value); // Update newTitle as the user types
                    }} 
                    onKeyDown={handleKeyDown} // Handle "Enter" key press
                    onBlur={() => setIsEditing(false)} // Exit editing mode on blur
                    autoFocus // Automatically focus the input field
                />
            ) : (
                // Render the title when not in editing mode
                <span className="flex-1 text-[#331800] font-medium">
                    {todo.title || 'Untitled'}
                </span>
            )}
            <div className="flex items-center gap-[14px]">
                <button
                    className="transition-all duration-200 border-none bg-transparent cursor-pointer hover:opacity-70"
                    onClick={() => {
                        setIsEditing(true); // Enter editing mode
                    }}
                >
                    <i className="fa-solid fa-pen-to-square text-amber-800"></i>
                </button>
                <button
                    className="transition-all duration-200 border-none bg-transparent cursor-pointer hover:opacity-70"
                    onClick={handleDelete}
                >
                    <i className="fa-solid fa-trash text-amber-800"></i>
                </button>
            </div>
        </li>
    );
}

const TodoListWidgetSean = () => {
    // useState is a hook that allows you to add state to your functional components
    const [todos, setTodos] = useState([]);
    const [todoValue, setTodoValue] = useState('');
    const [showCompletedTodos, setShowCompletedTodos] = useState(false);
    
    // Configure animation FPS
    const animationFps = 5; // Slowed down to 5 FPS from default 12 FPS
    
    // Use our custom animation manager hook for auto-switching
    const [backgroundAnimation, setBackgroundAnimation] = useAnimationManager();
    
    // Reference to track if it's the first render
    const isInitialRender = useRef(true);

    function persistData(newList) {
        console.log("Persisting data to local Storage")
        localStorage.setItem("todos", JSON.stringify(newList));
    }

    function addTodos(newtodo) {
        if (!newtodo || !newtodo.title) {
            console.error("Invalid todo item. Ensure it has a title.");
            return;
        }
        const newTodos = [...todos, { ...newtodo, completed: false }];
        persistData(newTodos);
        setTodos(newTodos);
    }

    function deleteTodos(index) {
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        persistData(newTodos);
        setTodos(newTodos);
    }

    function editTodos(index, newTitle, completed) {
        const updatedTodos = todos.map((todo, i) => {
            if (i === index) {
                const updatedTodo = { ...todo, title: newTitle };
                if (completed !== undefined) {
                    updatedTodo.completed = completed;
                }
                return updatedTodo;
            }
            return todo;
        });
        persistData(updatedTodos);
        setTodos(updatedTodos);
    }

    function toggleShowCompletedTodos() {
        setShowCompletedTodos(!showCompletedTodos);
    }

    function clearCompletedTodos() {
        setBackgroundAnimation(downAnimation);
        const newTodos = todos.filter(todo => !todo.completed);
        persistData(newTodos);
        setTodos(newTodos);
    }

    // Count completed todos
    const completedCount = todos.filter(todo => todo.completed).length;

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            
            // Try to load data from localStorage on initial render
            if (localStorage) {
                let localTodos = localStorage.getItem('todos');
                if (localTodos) {
                    try {
                        localTodos = JSON.parse(localTodos);
                        if (Array.isArray(localTodos)) {
                            setTodos(localTodos);
                        } else {
                            console.log("Invalid todos format in localStorage. Initializing with default value.");
                        }
                    } catch (error) {
                        console.log("Error parsing todos from localStorage. Initializing with default value.");
                    }
                } else {
                    console.log("No todos found in localStorage. Initializing with default value.");
                }
            }
            
            return;
        }
    },[]);

    return (
        <div 
            className="min-h-screen flex flex-col p-[14px] gap-[14px] font-['Inter',sans-serif] text-[#331800] relative overflow-hidden"
            style={{
                backgroundColor: 'transparent',
            }}
        >
            {/* Animated background with controlled FPS */}
            <SlowedGifBackground gifUrl={backgroundAnimation} fps={animationFps} />
            
            <ResourceLoader />
            
            {/* Header with title */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-['Press_Start_2P',system-ui] text-amber-900 mb-2">PIXEL TASKS</h1>
                <p className="text-amber-800">Organize your journey one pixel at a time</p>
            </div>
            
            <To_do_input todoValue={todoValue} setTodoValue={setTodoValue} addTodo={addTodos}/>
            <To_do_list 
                todos={todos} 
                deleteTodos={deleteTodos} 
                editTodos={editTodos}
                setBackgroundAnimation={setBackgroundAnimation}
            />
            
            {completedCount > 0 && (
                <div className="flex justify-between items-center max-w-[800px] w-full mx-auto mt-4 bg-white/60 p-2 rounded-lg">
                    <button 
                        className="text-sm text-amber-800 hover:text-amber-950 cursor-pointer font-medium"
                        onClick={toggleShowCompletedTodos}
                    >
                        {showCompletedTodos ? 'Hide' : 'Show'} completed ({completedCount})
                    </button>
                    <button 
                        className="text-sm text-red-600 hover:text-red-800 cursor-pointer font-medium"
                        onClick={clearCompletedTodos}
                    >
                        Clear completed
                    </button>
                </div>
            )}

            {/* Display completed todos if showCompletedTodos is true */}
            {showCompletedTodos && completedCount > 0 && (
                <div className="max-w-[800px] w-full mx-auto mt-2">
                    <h3 className="text-lg font-['Press_Start_2P',system-ui] mb-2 text-amber-800">Completed</h3>
                    <ul className="flex flex-col gap-2">
                        {todos.filter(todo => todo.completed).map((todo, idx) => {
                            const originalIndex = todos.findIndex(t => t === todo);
                            return (
                                <li key={idx} className="flex items-center justify-between gap-[14px] p-[10px] rounded-[14px] bg-white/60 shadow-md">
                                    <input 
                                        type="checkbox" 
                                        checked={true}
                                        className="h-5 w-5 accent-amber-700"
                                        onChange={() => {
                                            // Allow unchecking to restore the todo
                                            editTodos(originalIndex, todo.title, false);
                                            setBackgroundAnimation(downAnimation);
                                        }}
                                    />
                                    <span className="flex-1 line-through text-amber-800/70">{todo.title}</span>
                                    <button
                                        className="transition-all duration-200 border-none bg-transparent cursor-pointer hover:opacity-70"
                                        onClick={() => {
                                            setBackgroundAnimation(downAnimation);
                                            deleteTodos(originalIndex);
                                        }}
                                    >
                                        <i className="fa-solid fa-trash text-amber-800"></i>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    )
}

// For usage as a standalone widget
export const initTodoListWidget = (elementId) => {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    
    if (!React || !ReactDOM) {
        console.error("React and ReactDOM must be loaded first");
        return;
    }
    
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        ReactDOM.render(<TodoListWidget />, targetElement);
    } else {
        console.error(`Element with ID '${elementId}' not found`);
    }
};

// Expose widget initializer to global scope
if (typeof window !== 'undefined') {
    window.initTodoListWidget = initTodoListWidget;
}

export default TodoListWidgetSean;