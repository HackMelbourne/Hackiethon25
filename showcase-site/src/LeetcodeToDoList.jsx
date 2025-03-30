// By: Collin Teo and Matthew Leong
import React, { useState } from 'react';
//import problems from "./leetcode_data.json"

const LeetCodeToDoList = () => {
    {/* REWARD SYSTEMS*/}
    const[points,setPoints]=useState();
    {/* RGB sliders*/}
    const[red,setRed]=useState(255);
    const[green,setGreen]=useState(255);
    const[blue,setBlue]=useState(255);
  
    const[unlockedRed,setUnlockRed]=useState(false);
    const[unlockedBlue,setUnlockBlue]=useState(false);
    const[unlockedGreen,setUnlockGreen]=useState(false);
   
      const CompleteTask=(id)=>{
        {/* Add points after completing task*/}
          setPoints(prev=>prev+10);
      };
  
   {/* Purchasing RGB sliders*/}
    {/* If you've accumulated enough points then you buy it, else you can't buy*/}
    const BuyRedColor=()=>{
      if(points>=100){
        setPoints(points-100);
        alert("Purchased red color slider");
        setUnlockRed(true);
      }else{
        alert("Keep on grinding, you don't have enough points");
      }
    }
  
    const BuyBlueColor=()=>{
      if(points>=100){
        setPoints(points-100);
        alert("Purchased blue color slider");
        setUnlockBlue(true);
      }else{
        alert("Keep on grinding, you don't have enough points");
      }
    }
  
    const BuyGreenColor=()=>{
      if(points>=100){
        setPoints(points-100);
        alert("Purchased red blue slider");
        setUnlockGreen(true);
      }else{
        alert("Keep on grinding, you don't have enough points");
      }
    }
  
  const [numProblems, setNumProblems] = useState("");

  const handleNumChange = (event) => {
    setNumProblems(event.target.value);
  };

  const [problemList, setProblemList] = useState(localStorage.getItem('problemList') == null ? <p>None for today! Click "Find Problems!" to get started</p> : generateListJsx(JSON.parse(localStorage.getItem('problemList'))));

  function generateListJsx(problems) {
    const toDoList = problems.map((problem) => {
      return <li>{problem['id']}.<a href={problem['url']} target='_blank' onClick={CompleteTask}>{problem['title'] }</a>({problem['difficulty']})</li>
    });

    return <ul>{toDoList}</ul>
  }

  function generateProblemList() {
    var storageList = problems.sort(() => 0.5 - Math.random()).slice(0, numProblems);    

    localStorage.setItem('problemList', JSON.stringify(storageList));

    setProblemList(generateListJsx(storageList));
  }

  
  

  return (
    <div className="p-6 max-w-full max-w-[1800px]  rounded-xl shadow-lg" style={{backgroundColor: `rgb(${red}, ${green}, ${blue})`}}>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">LeetCode Grind</h2>

        <div className="text-l text-blue-600">
          Number of Problems: 
        </div>
        <input
          id="number-problems"
          type="number"
          value={numProblems}
          onChange={handleNumChange}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f5f5f5",
          }}
        />

        <div className="flex justify-center">
          <button
            onClick={generateProblemList}
            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            Find Problems!
          </button>
        </div>

        <div className="flex justify-center">
          {problemList}
        </div>

        <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-blue-800" style={{position:"absolute",left:"600px",top:"20px"}}>
          Reward system:
          </h1>
          <h3 className="text-xl font-bold text-blue-500" style={{position:"absolute",left:"1000px",top:"20px"}}>
          Each button costs 100 points
          </h3>
      <div className="text-2xl font-bold text-blue-600" style={{position:"absolute",left:"620px",top:"100px"}}>
         <p>Points:  {points}</p>
        </div>

      
      </div>

   
  <div>
      {/* Store menu*/}{/* Conditions to check whether you've bought the colour scheme or not*/}
      <h3 style={{position:"absolute",left:"630px",top:"170px",color:"red"}}>Red sliders</h3>

      {unlockedRed?(
      <input type="range" min="0" max="255" value={red} onChange={(e)=>setRed(parseInt(e.target.value))} style={{position:"absolute",left:"590px",top:"220px",}} className="w-full"/>
        ):(
          <button className="px-20 py-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"style={{position:"absolute",left:"590px",top:"220px"}} onClick={BuyRedColor}>Buy Red</button>
        )}
        
        <h3 style={{position:"absolute",left:"630px",top:"300px",color:"blue"}}>Blue sliders</h3>
        {unlockedBlue?(
          <input type="range" min="0" max="255" value={blue} onChange={(e)=>setBlue(parseInt(e.target.value)) }className="w-full" style={{position:"absolute",left:"590px",top:"360px"}}/>
        ):(
          <button className="px-20 py-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors" onClick={BuyBlueColor} style={{position:"absolute",left:"590px",top:"360px"}}>Buy Blue</button>
        )
      }
      
        <h3 style={{position:"absolute",left:"630px",top:"450px",color:"lime"}}>Green sliders:</h3>
        {unlockedGreen?(
          <input type="range" min="0" max="255" value={green} onChange={(e)=>setGreen(parseInt(e.target.value)) }className="w-full"  style={{position:"absolute",left:"590px",top:"500px"}}/>
        ):(
          <button className="px-20 py-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors" onClick={BuyGreenColor} style={{position:"absolute",left:"590px",top:"500px"}}>Buy Green</button>
        )
    }
    
     {/*Money bag expands as you accumulate more points*/}
     <p style={{fontSize:points,position:"absolute",left:"-200px",top:"200px",WebkitTextSizeAdjust:"none"}}>💰</p>
      </div>
    </div>

      </div>
   
  );
};

export default LeetCodeToDoList;


