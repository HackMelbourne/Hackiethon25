import { useStopwatch } from 'react-timer-hook';
import React, { useState, useEffect } from 'react';

const BlankPage = ({ width = 800, height = 600, backgroundColor = "#FFFBE5", border = "1px solid #ccc" }) => {
  // Page state control
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'timer', 'reward' or 'collection'
  
  // User information
  const [username, setUsername] = useState('');
  const [userInput, setUserInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  // Collection related states
  const [collections, setCollections] = useState([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState('');
  
  // Timer related states and functions
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [focusTimeout, setFocusTimeout] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Reward page related states
  const [randomLetter, setRandomLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageData, setImageData] = useState('');
  const [currentBox, setCurrentBox] = useState('');
  const [bananaName, setBananaName] = useState('');
  const [collectionUpdated, setCollectionUpdated] = useState(false);

  // API base URL
  const API_BASE_URL = 'http://localhost:3001/api';

  // Calculate total time
  const totalElapsedTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

  // Determine reward box type based on time
  const getBoxTier = (elapsedTime) => {
    let boxTier = "";
    switch (true) {
      case elapsedTime < 60:
        boxTier = "Bronze";
        break;
      case elapsedTime < 120:
        boxTier = "Silver";
        break;
      case elapsedTime < 180:
        boxTier = "Gold";
        break;
      case elapsedTime < 240:
        boxTier = "Platinum";
        break;
      default:
        boxTier = "Platinum"; // Default to highest level
    }
    return boxTier;
  };

  const boxTier = getBoxTier(totalElapsedTimeInSeconds);

  // 检查用户名是否存在
  const checkUsername = async (name) => {
    setIsCheckingUsername(true);
    setUsernameError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/check-username?username=${encodeURIComponent(name)}`);
      const result = await response.json();
      
      if (result.success) {
        return { exists: result.exists, success: true };
      } else {
        setUsernameError(result.error || 'Error checking username');
        return { success: false };
      }
    } catch (error) {
      setUsernameError('Network error, please try again');
      return { success: false };
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Create user collection file
  const createUserCollection = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setUsernameError(result.error || 'Failed to create user file');
        return false;
      }
      
      return true;
    } catch (error) {
      setUsernameError('Network error, please try again');
      return false;
    }
  };

  // 修改后的处理用户名提交函数
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      setUsernameError('Please enter a username');
      return;
    }
    
    // 检查用户名格式
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(userInput)) {
      setUsernameError('Username can only contain letters, numbers and underscores, length between 3-15');
      return;
    }
    
    // 检查用户名是否存在
    setIsCheckingUsername(true);
    setUsernameError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/check-username?username=${encodeURIComponent(userInput)}`);
      const result = await response.json();
      
      if (result.success) {
        // 设置用户名并进入计时器页面
        setUsername(userInput);
        setCurrentPage('timer');
        
        // 如果用户不存在，创建新的收集文件
        if (!result.exists) {
          await createUserCollection(userInput);
        }
      } else {
        setUsernameError(result.error || 'Error checking username');
      }
    } catch (error) {
      setUsernameError('Network error, please try again');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Fetch user collection
  const fetchUserCollection = async () => {
    if (!username) return;
    
    setIsLoadingCollection(true);
    setCollectionError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/get-collection?username=${encodeURIComponent(username)}`);
      const result = await response.json();
      
      if (result.success) {
        setCollections(result.collections);
      } else {
        setCollectionError(result.error || 'Failed to fetch collection');
      }
    } catch (error) {
      setCollectionError('Network error, please try again');
    } finally {
      setIsLoadingCollection(false);
    }
  };

  // Fetch latest collection when collection page is shown
  useEffect(() => {
    if (currentPage === 'collection') {
      fetchUserCollection();
    }
  }, [currentPage]);

  // Window focus change handling
  useEffect(() => {
    // Only monitor window focus on timer page
    if (currentPage !== 'timer') return;
    
    const handleFocus = () => {
      setIsWindowFocused(true);
      clearTimeout(focusTimeout);
    };

    const handleBlur = () => {
      setIsWindowFocused(false);

      if (isRunning) {
        const timeout = setTimeout(() => {
          reset(0, false);
          setShowWarning(true);
        }, 30000); // 3 seconds for testing

        setFocusTimeout(timeout);
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning, reset, focusTimeout, currentPage]);

  // Generate image name based on box type, according to probability distribution
  const generateImageBasedOnBox = (boxType) => {
    const random = Math.random() * 100; // 0-100 random number
    let prefix = "";
    let randomNum = 1;
    
    // Choose image prefix based on different box types and probability distributions
    switch(boxType) {
      case "Bronze": // Bronze box
        if (random < 80) { // 80% Common
          prefix = "C_";
          randomNum = Math.floor(Math.random() * 20) + 1;
        } else if (random < 98) { // 18% Rare
          prefix = "R_";
          randomNum = Math.floor(Math.random() * 15) + 1;
        } else { // 2% Epic
          prefix = "E_";
          randomNum = Math.floor(Math.random() * 10) + 1;
        }
        break;
        
      case "Silver": // Silver box
        if (random < 60) { // 60% Common
          prefix = "C_";
          randomNum = Math.floor(Math.random() * 20) + 1;
        } else if (random < 90) { // 30% Rare
          prefix = "R_";
          randomNum = Math.floor(Math.random() * 15) + 1;
        } else if (random < 99) { // 9% Epic
          prefix = "E_";
          randomNum = Math.floor(Math.random() * 10) + 1;
        } else { // 1% Legendary
          prefix = "L_";
          randomNum = Math.floor(Math.random() * 5) + 1;
        }
        break;
        
      case "Gold": // Gold box
        if (random < 30) { // 30% Common
          prefix = "C_";
          randomNum = Math.floor(Math.random() * 20) + 1;
        } else if (random < 70) { // 40% Rare
          prefix = "R_";
          randomNum = Math.floor(Math.random() * 15) + 1;
        } else if (random < 95) { // 25% Epic
          prefix = "E_";
          randomNum = Math.floor(Math.random() * 10) + 1;
        } else { // 5% Legendary
          prefix = "L_";
          randomNum = Math.floor(Math.random() * 5) + 1;
        }
        break;
        
      case "Platinum": // Platinum box
        if (random < 10) { // 10% Common
          prefix = "C_";
          randomNum = Math.floor(Math.random() * 20) + 1;
        } else if (random < 45) { // 35% Rare
          prefix = "R_";
          randomNum = Math.floor(Math.random() * 15) + 1;
        } else if (random < 90) { // 45% Epic
          prefix = "E_";
          randomNum = Math.floor(Math.random() * 10) + 1;
        } else { // 10% Legendary
          prefix = "L_";
          randomNum = Math.floor(Math.random() * 5) + 1;
        }
        break;
        
      default: // Default to a Common
        prefix = "C_";
        randomNum = Math.floor(Math.random() * 20) + 1;
    }
    
    return prefix + randomNum + ".png";
  };

  // Load image function
  const loadImage = async (imageName) => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    setCollectionUpdated(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/image?name=${encodeURIComponent(imageName)}`);
      const result = await response.json();
      
      if (result.success) {
        setImageData(result.data);
        setBananaName(result.bananaName || "Unknown Banana");
        
        // Update collection
        const bananaId = imageName.replace('.png', '');
        const rarityType = getBananaTypeName(imageName);
        
        // Call API to update collection
        await updateCollection(bananaId, rarityType);
        
      } else {
        setMessage({ text: result.error || 'Failed to load image', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update user collection
  const updateCollection = async (bananaId, rarity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          bananaId: bananaId,
          rarity: rarity
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCollectionUpdated(true);
        console.log('Collection updated', result.collections);
      } else {
        console.error('Failed to update collection', result.error);
      }
    } catch (error) {
      console.error('Error updating collection', error);
    }
  };

  // Handle Stop button click - stop timer and go to reward page
  const handleStop = () => {
    // Save current box type
    setCurrentBox(boxTier);
    
    // Pause timer
    pause();
    
    // Generate image based on box type
    const imageName = generateImageBasedOnBox(boxTier);
    setRandomLetter(imageName);
    
    // Load image
    loadImage(imageName);
    
    // Switch to reward page
    setCurrentPage('reward');
  };

  // Return to timer page and reset timer
  const handleGainAnotherBanana = () => {
    // Reset timer
    reset(0, false);
    
    // Switch back to timer page
    setCurrentPage('timer');
    setImageData(''); // Clear image data
    setBananaName(''); // Clear banana name
    setCollectionUpdated(false); // Reset collection update status
  };

  // Switch to collection page
  const handleViewCollection = () => {
    setCurrentPage('collection');
  };

  // Return to timer page
  const handleBackToTimer = () => {
    setCurrentPage('timer');
  };

  // Get current image type name
  const getBananaTypeName = (imageName) => {
    if (!imageName) return "";
    
    if (imageName.startsWith("C_")) return "Common";
    if (imageName.startsWith("R_")) return "Rare";
    if (imageName.startsWith("E_")) return "Epic";
    if (imageName.startsWith("L_")) return "Legendary";
    
    return "";
  };

  // Get current box's probability distribution description
  const getBoxProbabilityDescription = (boxType) => {
    switch(boxType) {
      case "Bronze":
        return "Common = 80%, Rare = 18%, Epic = 2%, Legendary = 0%";
      case "Silver":
        return "Common = 60%, Rare = 30%, Epic = 9%, Legendary = 1%";
      case "Gold":
        return "Common = 30%, Rare = 40%, Epic = 25%, Legendary = 5%";
      case "Platinum":
        return "Common = 10%, Rare = 35%, Epic = 45%, Legendary = 10%";
      default:
        return "";
    }
  };

  // Get box color based on type
  const getBoxColor = (boxType) => {
    switch(boxType) {
      case "Bronze":
        return "from-amber-600 to-amber-800";
      case "Silver":
        return "from-gray-300 to-gray-500";
      case "Gold":
        return "from-yellow-300 to-yellow-500";
      case "Platinum":
        return "from-indigo-300 to-indigo-600";
      default:
        return "from-gray-300 to-gray-500";
    }
  };

  // Get style based on rarity
  const getRarityStyle = (rarity) => {
    switch(rarity.toLowerCase()) {
      case 'common':
        return 'text-gray-700';
      case 'rare':
        return 'text-blue-600 font-medium';
      case 'epic':
        return 'text-purple-600 font-semibold';
      case 'legendary':
        return 'text-yellow-600 font-bold';
      default:
        return 'text-gray-700';
    }
  };

  // Get background color based on rarity
  const getRarityBgColor = (rarity) => {
    switch(rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-100';
      case 'rare':
        return 'bg-blue-50';
      case 'epic':
        return 'bg-purple-50';
      case 'legendary':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-100';
    }
  };
  // Login page
  const renderLoginPage = () => (
    <div className="flex flex-col items-center justify-center h-full bg-[#FFFBE5] w-full">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-yellow-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-yellow-800">BananaStudy!</h1>
        <p className="text-yellow-700 text-center mb-8">Create a username to save your banana collection</p>
        
        <form onSubmit={handleUsernameSubmit} className="bg-yellow-50 p-6 rounded-lg shadow-inner">
          <div className="mb-4">
            <label className="block text-yellow-800 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="pl-10 shadow appearance-none border border-yellow-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter username (3-15 characters)"
                disabled={isCheckingUsername}
              />
            </div>
          </div>
          
          {usernameError && (
            <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {usernameError}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center"
              disabled={isCheckingUsername}
            >
              {isCheckingUsername ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Studying
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Timer page
  const renderTimerPage = () => (
    <div className="flex flex-col items-center pt-8 bg-[#FFFBE5] w-full h-full">
      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <h1 className="text-4xl mb-1 text-yellow-800 text-center font-bold">
        BananaStudy!
      </h1>
      <p className="max-w-xl mb-4 text-center leading-relaxed px-5 text-yellow-700">
        Study and earn boxes to unlock bananas!<br />
        Can you unlock all 50 bananas?
      </p>
      <div className="flex items-center justify-center mb-4">
        <p className="text-lg text-yellow-800">
          Welcome, <span className="font-bold">{username}</span>!
        </p>
        <button 
          onClick={handleViewCollection}
          className="ml-4 flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm transition duration-200 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          View Collection
        </button>
      </div>
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white max-w-md mx-auto shadow-lg border border-yellow-200">
        
        {/* Timer display */}
        <div className="flex items-center justify-center space-x-1 mb-6 bg-yellow-50 py-6 px-8 rounded-xl w-full shadow-inner border border-yellow-100">
          <div className="flex flex-col items-center w-16">
            <span className="text-4xl font-mono font-bold text-yellow-800">{hours.toString().padStart(2, '0')}</span>
            <span className="text-xs text-yellow-600 mt-1">HOURS</span>
          </div>
          <span className="text-4xl font-mono font-bold text-yellow-500">:</span>
          <div className="flex flex-col items-center w-16">
            <span className="text-4xl font-mono font-bold text-yellow-800">{minutes.toString().padStart(2, '0')}</span>
            <span className="text-xs text-yellow-600 mt-1">MINUTES</span>
          </div>
          <span className="text-4xl font-mono font-bold text-yellow-500">:</span>
          <div className="flex flex-col items-center w-16">
            <span className="text-4xl font-mono font-bold text-yellow-800">{seconds.toString().padStart(2, '0')}</span>
            <span className="text-xs text-yellow-600 mt-1">SECONDS</span>
          </div>
        </div>

        {/* Reward level display */}
        <div className="mt-2 w-full">
          <p className="text-center text-lg font-semibold text-gray-700 mb-2">
            Your Reward:
          </p>
          <div className={`bg-gradient-to-r ${getBoxColor(boxTier)} text-white font-bold py-3 px-4 rounded-lg text-center text-lg mb-4 shadow-md`}>
            {boxTier} Box
          </div>
        </div>

        {/* Window focus status */}
        <div className="mt-2 mb-4 w-full">
          <div className={`flex items-center justify-center py-2 px-4 rounded-lg ${isWindowFocused ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isWindowFocused ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
            <span className="font-medium">
              {isWindowFocused ? "Window is Focused" : "Window is Blurred"}
            </span>
          </div>
        </div>

        {/* Timer controls */}
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          {!isRunning ? (
            <button
              onClick={() => {
                start();
                setShowWarning(false);
              }}
              className="py-3 px-4 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={totalElapsedTimeInSeconds <= 0}
              className={`py-3 px-4 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none flex items-center justify-center shadow-md ${
                totalElapsedTimeInSeconds > 0
                  ? "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop
            </button>
          )}
          <button
            onClick={() => reset(0, false)}
            className="py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Timeout warning popup */}
      {showWarning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg z-10">
          <div className="bg-white p-6 rounded-lg shadow-2xl text-center w-96 border-2 border-red-500">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">⏳ Time's Up!</h2>
            <p className="text-gray-700 mb-4">You were gone too long! The timer has been reset.</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Collection page
  const renderCollectionPage = () => (
    <div className="flex flex-col pt-6 px-4 bg-[#FFFBE5] w-full h-full">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBackToTimer}
          className="text-yellow-800 hover:text-yellow-600 flex items-center transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div className="flex items-center ml-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-2xl font-bold text-yellow-800">My Banana Collection</h2>
        </div>
      </div>
      
      {isLoadingCollection ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white rounded-xl shadow-md">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-yellow-800">Loading your collection...</p>
        </div>
      ) : collectionError ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 border border-red-300 shadow-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {collectionError}
          </div>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-yellow-200">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-xl text-yellow-800 font-medium">You haven't collected any bananas yet</p>
          <p className="mt-2 text-yellow-600">Study and earn more bananas!</p>
          <button 
            onClick={handleBackToTimer}
            className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Studying
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((item, index) => (
            <div key={index} className={`${getRarityBgColor(item.status.rarity)} rounded-lg p-4 flex flex-col items-center shadow-md border border-yellow-200 transform hover:scale-105 transition duration-200`}>
              <div className="text-right w-full">
                <span className="inline-block bg-yellow-200 rounded-full px-3 py-1 text-xs font-semibold text-yellow-800 shadow">
                  {item.status.count}x
                </span>
              </div>
              <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center mb-2 shadow-inner overflow-hidden border">
                {item.imageData ? (
                  <img 
                    src={item.imageData} 
                    alt={item.name}
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Banana Image</span>
                  </div>
                )}
              </div>
              <div className={`text-center mt-2 ${getRarityStyle(item.status.rarity)} px-3 py-1 rounded-full w-full`}>
                {item.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

// Reward page
const renderRewardPage = () => (
  <div className="flex flex-col items-center pt-8 bg-[#FFFBE5] w-full h-full">
    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    </div>
    
    <h3 className="text-3xl mb-4 font-bold text-yellow-800">Your Banana Reward!</h3>
    
    <div className={`bg-gradient-to-r ${getBoxColor(currentBox)} text-white font-bold py-2 px-6 rounded-full text-xl mb-2 shadow-lg flex items-center`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      {currentBox} Box
    </div>
    
    <p className="text-sm text-gray-600 mb-4 bg-white px-3 py-1 rounded-lg shadow-sm">
      {getBoxProbabilityDescription(currentBox)}
    </p>

    {message.text && (
      <div className={`p-3 rounded-lg mb-4 w-full max-w-md flex items-center ${message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {message.type === 'error' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
        {message.text}
      </div>
    )}

    {/* 高度翻倍、宽度减半的香蕉预览图 */}
    {loading ? (
      <div className="flex flex-col justify-center items-center h-[400px] w-full max-w-xl bg-white rounded-xl shadow-md mb-8 border border-yellow-200">
        <svg className="animate-spin h-16 w-16 text-yellow-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-yellow-800">Unpacking banana...</p>
      </div>
    ) : imageData && (
      <div className="relative w-full max-w-xl h-[500px] overflow-hidden rounded-xl shadow-xl border-4 border-yellow-300 mb-8">
        <div className="absolute inset-0 bg-yellow-100 opacity-20"></div>
        <div className="flex justify-center items-center h-full">
          <img src={imageData} alt="Banana Image" className="max-w-[80%] max-h-[80%] object-contain relative z-10" />
        </div>
      </div>
    )}
    
    {/* 减小高度的香蕉信息区域 */}
    {bananaName && (
      <div className="w-full max-w-sm mb-6 bg-white rounded-lg shadow-md border border-yellow-200">
        <div className="py-2 px-4">
          <div className="flex justify-center mb-1">
            <div className={`inline-block px-4 py-1 rounded-full text-sm ${
              getBananaTypeName(randomLetter) === "Common" ? "bg-gray-200 text-gray-800" :
              getBananaTypeName(randomLetter) === "Rare" ? "bg-blue-200 text-blue-800" :
              getBananaTypeName(randomLetter) === "Epic" ? "bg-purple-200 text-purple-800" :
              "bg-yellow-200 text-yellow-800"
            }`}>
              {getBananaTypeName(randomLetter)}
            </div>
          </div>
          
          <p className="text-center font-bold text-yellow-800 mt-1 text-sm">You found:</p>
          <p className="text-xl font-bold text-yellow-600 my-1 text-center">{bananaName}</p>
          
          {collectionUpdated && (
            <div className="text-green-600 text-xs p-1 my-1 rounded-lg border border-green-200 bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Added to your collection!
            </div>
          )}
        </div>
      </div>
    )}

    <div className="flex space-x-4">
      <button
        onClick={handleGainAnotherBanana}
        className="py-3 px-8 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg shadow-md transition duration-200 flex items-center text-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Gain Another Banana
      </button>
    </div>
  </div>
);

  // Render different content based on current page state
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "#FFFBE5",
        border,
        position: 'relative',
        overflow: 'auto'
      }}
    >
      {currentPage === 'login' 
        ? renderLoginPage() 
        : currentPage === 'timer' 
          ? renderTimerPage() 
          : currentPage === 'collection'
            ? renderCollectionPage()
            : renderRewardPage()
      }
    </div>
  );
};

export default BlankPage;