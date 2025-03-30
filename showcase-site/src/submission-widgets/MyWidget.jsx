import React, { useState, useEffect, useRef } from 'react';

// 이미지를 상대 경로로 import
import grassImage from "./resources/grass_small.jpeg";
import uncheckIcon from './resources/black_pocketball.png';
import checkIcon from './resources/Pokemonball.png';
import accomplishSound from './resources/accomplish.mp3'; // 체크 시 소리
import backSound from './resources/back.mp3'; // 체크 해제 시 소리
import addedSound from './resources/added.mp3';
import removeSound from './resources/remove.mp3';
import logoImage from './resources/Logo.png';
import pokedoneSound from './resources/pokedone.mp3'; // 박수 소리에서 변경
import pokesmileImage from './resources/pokesmile.gif';
import speakerIcon from './resources/speaekr.png'; // 음량 켜짐 아이콘
import speakerMuteIcon from './resources/speaker_no.png'; // 음량 꺼짐 아이콘
import resetSound from './resources/reset.mp3'; // 초기화 소리 추가

const PokeMe = () => {
  const [inputValue, setInputValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [pikachuVisible, setPikachuVisible] = useState(false);
  // 모든 작업이 완료되었는지 추적하는 상태 추가
  const [allComplete, setAllComplete] = useState(false);
  // 초기화 진행 중인지 추적하는 상태 추가
  const [isResetting, setIsResetting] = useState(false);
  
  // 추가: 축하 메시지 표시를 위한 별도 상태
  const [showCongrats, setShowCongrats] = useState(false);
  
  // 추가: 축하 메시지 텍스트용 상태
  const [congratsMessage, setCongratsMessage] = useState("");
  
  // 음소거 상태 추가
  const [isMuted, setIsMuted] = useState(false);

  // useRef로 오디오 객체를 안전하게 생성 - 페이지 로드 시 한 번만 초기화되도록 변경
  const checkAudioRef = useRef(null);
  const uncheckAudioRef = useRef(null);
  const addedAudioRef = useRef(null);
  const removeAudioRef = useRef(null);
  const pokedoneAudioRef = useRef(null);
  const resetAudioRef = useRef(null); // 초기화 소리 추가
  
  // 오디오 객체 초기화를 위한 useEffect
  useEffect(() => {
    // 오디오 객체 생성
    checkAudioRef.current = new Audio(accomplishSound);
    uncheckAudioRef.current = new Audio(backSound);
    addedAudioRef.current = new Audio(addedSound);
    removeAudioRef.current = new Audio(removeSound);
    pokedoneAudioRef.current = new Audio(pokedoneSound);
    resetAudioRef.current = new Audio(resetSound); // 초기화 소리 추가
    
    // 음소거 상태 설정
    const audioElements = [
      checkAudioRef.current,
      uncheckAudioRef.current,
      addedAudioRef.current,
      removeAudioRef.current,
      pokedoneAudioRef.current,
      resetAudioRef.current // 초기화 소리 추가
    ];
    
    audioElements.forEach(audio => {
      audio.muted = isMuted;
      // 모바일 재생을 위한 설정
      audio.preload = 'auto';
    });
    
    console.log("오디오 객체 초기화 완료");
    
    // 컴포넌트 언마운트 시 오디오 객체 정리
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  // 음소거 토글 함수
  const toggleMute = () => {
    const newMutedState = !isMuted;
    console.log("음소거 상태 변경:", newMutedState);
    setIsMuted(newMutedState);
    
    // 모든 오디오 요소의 음소거 상태 변경
    checkAudioRef.current.muted = newMutedState;
    uncheckAudioRef.current.muted = newMutedState;
    addedAudioRef.current.muted = newMutedState;
    removeAudioRef.current.muted = newMutedState;
    pokedoneAudioRef.current.muted = newMutedState;
    resetAudioRef.current.muted = newMutedState; // 초기화 소리 추가
    
    // 현재 재생 중인 소리가 있다면 볼륨 조절로 즉시 적용
    const audioElements = [
      checkAudioRef.current,
      uncheckAudioRef.current,
      addedAudioRef.current,
      removeAudioRef.current,
      pokedoneAudioRef.current,
      resetAudioRef.current // 초기화 소리 추가
    ];
    
    audioElements.forEach(audio => {
      if (audio.currentTime > 0 && !audio.paused) {
        audio.volume = newMutedState ? 0 : 1;
      }
    });
  };

  const playUncheckSound = () => {
    // 오디오를 처음부터 재생하도록 설정
    uncheckAudioRef.current.currentTime = 0;
    uncheckAudioRef.current.play()
      .catch(error => {
        console.error("언체크 소리 재생 실패:", error);
      });
  };

  const playAddedSound = () => {
    // 오디오를 처음부터 재생하도록 설정
    addedAudioRef.current.currentTime = 0;
    addedAudioRef.current.play()
      .catch(error => {
        console.error("추가 소리 재생 실패:", error);
      });
  };

  const playRemoveSound = () => {
    // 오디오를 처음부터 재생하도록 설정
    removeAudioRef.current.currentTime = 0;
    removeAudioRef.current.play()
      .catch(error => {
        console.error("삭제 소리 재생 실패:", error);
      });
  };

  // playApplauseSound 함수 이름 변경
  const playCelebrationSound = () => {
    console.log("축하 이벤트 발생!"); // 디버깅용 로그
    setPikachuVisible(true);
    setShowCongrats(false); // 초기화
    
    // 포켓몬 소리 재생 전에 항상 처음부터 시작하도록 설정
    pokedoneAudioRef.current.currentTime = 0;
    pokedoneAudioRef.current.muted = isMuted; // 현재 음소거 상태 적용
    
    pokedoneAudioRef.current.play()
      .catch(error => {
        console.error("포켓몬 소리 재생 실패:", error);
        // 오디오 재생에 실패해도 이벤트는 3초 후 종료
        setTimeout(() => {
          finishCelebration();
        }, 3000);
      });

    // onended 이벤트는 이미지 onLoad에서 관리함
  };

  // 축하 이벤트 종료 및 초기화 함수 분리
  const finishCelebration = () => {
    console.log("축하 이벤트 종료, 초기화 시작");
    setPikachuVisible(false);
    setShowCongrats(false);
    
    // 상태 초기화
    setTasks([]);
    saveData([]);
    setAllComplete(false);
    
    // 초기화 완료
    setTimeout(() => {
      console.log("초기화 완료");
    }, 1000);
  };

  const stopApplauseSound = () => {
    pokedoneAudioRef.current.pause();
    pokedoneAudioRef.current.currentTime = 0;
    setPikachuVisible(false);
    setShowCongrats(false);
  };

  // 모든 작업을 완전히 삭제하는 함수로 수정
  const resetAllTasks = () => {
    // 모든 작업 항목을 삭제
    setTasks([]);
    saveData([]);
    setAllComplete(false);
    
    // 초기화 메시지를 더 오래 표시 (3초)
    setTimeout(() => {
      setIsResetting(false);
      console.log("초기화 완료");
    }, 3000);
  };

  // 모든 작업 완료 상태 감시
  useEffect(() => {
    // 초기화 중일 때는 이벤트 발생 방지
    if (isResetting) {
      return;
    }
    
    if (tasks.length > 0) {
      const allChecked = tasks.every(task => task.checked);
      
      // 디버깅용 로그
      // console.log("tasks 변경:", tasks.length, "allChecked:", allChecked);
      
      // 이전에 모든 작업이 완료되지 않았고, 지금 모든 작업이 완료된 경우
      // 그리고 최소 2개 이상의 작업이 있을 때만 축하 이벤트 발생
      if (allChecked && !allComplete && tasks.length >= 2) {
        playCelebrationSound();
        setAllComplete(true);
      } 
      // 이전에 모든 작업이 완료되었고, 지금은 완료되지 않은 경우
      else if (!allChecked && allComplete) {
        stopApplauseSound();
        setAllComplete(false);
      }
    } else {
      // 작업이 없는 경우
      if (allComplete) {
        stopApplauseSound();
        setAllComplete(false);
      }
    }
  }, [tasks, allComplete, isResetting]);

  // 모든 오디오 요소의 음소거 상태 초기화를 위한 효과
  useEffect(() => {
    const audioElements = [
      checkAudioRef.current,
      uncheckAudioRef.current,
      addedAudioRef.current,
      removeAudioRef.current,
      pokedoneAudioRef.current
    ];
    
    audioElements.forEach(audio => {
      audio.muted = isMuted;
    });
    
    console.log("오디오 음소거 상태 초기화:", isMuted);
  }, [isMuted]);

  // 폰트 로딩 및 초기 데이터 로드
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');
    `;
    document.head.appendChild(style);

    const savedData = localStorage.getItem("data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setTasks(parsedData);
      
      // 초기 로드 시 모든 작업이 완료되었는지 확인
      if (parsedData.length > 0 && parsedData.every(task => task.checked)) {
        setAllComplete(true);
      }
    }

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      stopApplauseSound(); // 컴포넌트가 언마운트될 때 소리 중지
    };
  }, []);

  const saveData = (updatedTasks) => {
    localStorage.setItem("data", JSON.stringify(updatedTasks));
  };

  // 할 일 최대 글자 수 제한
  const MAX_TASK_LENGTH = 20;

  const addTask = () => {
    // 축하 이벤트가 진행 중이면 즉시 중지
    if (pikachuVisible) {
      stopApplauseSound();
      setPikachuVisible(false);
    }
    
    if (inputValue.trim() === '') {
      alert("You must write something!");
      return;
    }
    
    // 글자 수 제한 확인
    if (inputValue.length > MAX_TASK_LENGTH) {
      alert(`Please limit your task to ${MAX_TASK_LENGTH} characters!`);
      return;
    }

    const newTask = {
      text: inputValue.trim(),
      checked: false,
      id: Date.now()
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveData(updatedTasks);
    
    // 추가 소리 직접 재생
    console.log("추가 소리 재생 시도");
    const audio = addedAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.muted = isMuted;
      audio.volume = 1;
      audio.play()
        .then(() => console.log("추가 소리 재생 성공"))
        .catch(error => {
          console.error("추가 소리 재생 실패:", error);
        });
    }
    
    setInputValue('');
  };

  const toggleCheck = (id) => {
    // 초기화 중에는 체크 상태 변경 방지
    if (isResetting) {
      return;
    }
    
    // 축하 이벤트가 진행 중일 때 다른 작업의 체크를 변경하면 이벤트 중지
    if (pikachuVisible) {
      stopApplauseSound();
      setPikachuVisible(false);
    }
    
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, checked: !task.checked } : task
    );
    setTasks(updatedTasks);
    saveData(updatedTasks);

    const taskBeingToggled = updatedTasks.find(task => task.id === id);

    if (taskBeingToggled.checked) {
      console.log("체크 소리 재생 시도");
      // 체크 소리 직접 재생
      const audio = checkAudioRef.current;
      audio.currentTime = 0;
      audio.muted = isMuted;
      audio.volume = 1;
      audio.play()
        .then(() => console.log("체크 소리 재생 성공"))
        .catch(error => {
          console.error("체크 소리 재생 실패:", error);
        });
    } else {
      console.log("언체크 소리 재생 시도");
      // 언체크 소리 직접 재생
      const audio = uncheckAudioRef.current;
      audio.currentTime = 0;
      audio.muted = isMuted;
      audio.volume = 1;
      audio.play()
        .then(() => console.log("언체크 소리 재생 성공"))
        .catch(error => {
          console.error("언체크 소리 재생 실패:", error);
        });
    }
  };

  const deleteTask = (id) => {
    // 초기화 중에는 삭제 방지
    if (isResetting) {
      return;
    }
    
    // 축하 이벤트가 진행 중이면 즉시 중지
    if (pikachuVisible) {
      stopApplauseSound();
      setPikachuVisible(false);
    }
    
    // 삭제 전 해당 작업 찾기
    const taskToDelete = tasks.find(task => task.id === id);
    
    // 작업 목록에서 제외
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    // 삭제 후 목록이 비어있거나, 삭제한 작업이 체크된 상태였고 마지막으로 남은 체크된 작업이었을 경우
    // allComplete 상태를 초기화해서 축하 이벤트가 발생하지 않도록 함
    if (updatedTasks.length === 0 || 
        (taskToDelete && taskToDelete.checked && 
         updatedTasks.filter(task => task.checked).length === 0)) {
      setAllComplete(false);
    }
    
    setTasks(updatedTasks);
    saveData(updatedTasks);
    
    // 삭제 소리 직접 재생
    console.log("삭제 소리 재생 시도");
    const audio = removeAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.muted = isMuted;
      audio.volume = 1;
      audio.play()
        .then(() => console.log("삭제 소리 재생 성공"))
        .catch(error => {
          console.error("삭제 소리 재생 실패:", error);
        });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // 배경 스타일
  const backgroundStyle = {
    backgroundImage: `url(${grassImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '300px',
    fontFamily: "'Pixelify Sans', sans-serif"
  };

  // 포켓몬 애니메이션 스타일
  const pokemonAnimationStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    pointerEvents: 'none',
    animation: 'bounce 0.6s infinite alternate'
  };

  // 축하 메시지 스타일 - 별도로 정의
  const congratsMessageStyle = {
    position: 'fixed',
    bottom: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '10px 20px',
    borderRadius: '20px',
    fontWeight: 'bold',
    zIndex: 999,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none',
    fontSize: '18px',
    color: '#333'
  };

      return (
    <div 
      className="todo-app p-8 rounded-lg w-full max-w-md shadow-lg relative" 
      style={backgroundStyle}
    >
      <style>
        {`
          @keyframes bounce {
            from { transform: translate(-50%, -55%); }
            to { transform: translate(-50%, -45%); }
          }
        `}
      </style>
    
      <h2 className="text-blue-800 text-xl font-bold flex items-center justify-between mb-6">
        <img 
          src={logoImage}
          alt="To-Do List Logo" 
          style={{ width: '180px', height: 'auto' }} 
        />
        
        <div className="flex items-center">
          {/* 음량 조절 버튼 */}
          <button
            onClick={toggleMute}
            className="mr-4 bg-white bg-opacity-80 p-1 rounded-full"
            style={{ 
              border: '2px solid #c4f5ff',
              width: '46px',
              height: '46px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img 
              src={isMuted ? speakerMuteIcon : speakerIcon} 
              alt={isMuted ? "소리 켜기" : "소리 끄기"} 
              style={{ width: '34px', height: '34px' }}
            />
          </button>
          
          {/* 완료 비율 */}
          <div 
            className="bg-white bg-opacity-80 px-4 py-2 rounded-full" 
            style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#4b5563',
              border: '2px solid #c4f5ff'
            }}
          >
            {tasks.filter(task => task.checked).length} / {tasks.length}
          </div>
        </div>
      </h2>
      
      <div className="flex items-center mb-6 border rounded-full pl-4 pr-2 py-2 bg-white bg-opacity-70" style={{ maxWidth: '100%' }}>
                  <input
          type="text"
          className="flex-1 outline-none text-sm"
          placeholder="Add your task <20 chars"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
          disabled={isResetting} // 초기화 중에는 비활성화
        />
        {inputValue.length > 0 && (
          <span className="text-xs text-gray-500 mx-2" style={{ whiteSpace: 'nowrap' }}>
            {inputValue.length}/{MAX_TASK_LENGTH}
          </span>
        )}
        <button 
          onClick={addTask}
          className="bg-red-500 text-white px-4 py-2 rounded-full text-sm mx-1"
          disabled={isResetting} // 초기화 중에는 비활성화
        >
          Add
        </button>
        <button
          onClick={resetAllTasks}
          className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm mx-1"
          title="초기화"
        >
          Reset
        </button>
      </div>
      
      <ul className="bg-white bg-opacity-70 rounded-lg p-4" style={{ width: '100%', boxSizing: 'border-box' }}>
        {tasks.map((task) => (
          <li 
            key={task.id} 
            style={{
              border: '3px solid #c4f5ff',
              borderRadius: '8px',
              marginBottom: '15px',
              position: 'relative',
              cursor: isResetting ? 'default' : 'pointer',
              padding: '12px 12px 12px 40px',
              textDecoration: task.checked ? 'line-through' : 'none',
              color: task.checked ? '#6b7280' : 'inherit',
              opacity: isResetting ? '0.7' : '1',
              transition: 'all 0.3s ease',
              minHeight: '48px',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => toggleCheck(task.id)} 
          >
            <div 
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: task.checked ? '1px solid rgb(217, 4, 255)' : '1px solid #d1d5db',
                backgroundColor: task.checked ? '#ef4444' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <img
                src={task.checked ? checkIcon : uncheckIcon}
                alt="Check icon"
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <span 
              style={{
                display: 'block',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                maxWidth: 'calc(100% - 50px)' // 닫기 버튼과 체크 아이콘 공간 고려
              }}
            >
              {task.text}
            </span>
            <span 
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: '#6b7280',
                cursor: isResetting ? 'default' : 'pointer',
                fontSize: '20px'
              }}
              onClick={(e) => {
                if (!isResetting) {
                  e.stopPropagation();
                  deleteTask(task.id);
                }
              }}
            >
              ×
            </span>
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={{ textAlign: 'center', padding: '10px' }}>
            e.g. early morning, lectures...
          </li>
        )}
      </ul>

      {/* 포켓몬 애니메이션 및 메시지는 메인 컨테이너 바로 안에 위치 */}
      {pikachuVisible && (
        <div style={pokemonAnimationStyle}>
          <img 
            src={pokesmileImage} 
            alt="Pokémon Animation"
            style={{
              width: '120px',
              height: 'auto'
            }}
            onLoad={() => {
              // GIF가 끝나는 시점(약 3초)에 축하 메시지 표시
              setTimeout(() => {
                console.log("메시지 표시 설정");
                setCongratsMessage("All tasks completed!");
                setShowCongrats(true);
              }, 3000);
              
              // GIF 시간 + 바운스 애니메이션 9초 추가 후 종료 (총 12초)
              setTimeout(() => {
                // 노래 중지 및 애니메이션 종료
                pokedoneAudioRef.current.pause();
                pokedoneAudioRef.current.currentTime = 0;
                finishCelebration();
              }, 12000);
            }}
          />
        </div>
      )}
      
      {/* 초기화 메시지 - 피카츄가 사라진 후에만 표시 */}
      {isResetting && !pikachuVisible && (
        <div style={resetMessageStyle}>
          모든 작업을 완료했어요!
        </div>
      )}
    </div>
  );
};

export default PokeMe;

