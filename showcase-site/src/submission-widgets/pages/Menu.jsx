import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Typography, Button } from '@mui/material';
import ThreeLivesImg from '../assets/plant-3-lives.png';
import TwoLivesImg from '../assets/plant-2-lives.png';
import OneLifeImg from '../assets/plant-1-lives.png';
import NoLivesImg from '../assets/plant-0-lives.png';
import { motion } from 'framer-motion';

const Menu = () => {

  const MotionButton = motion(Button)
  const MotionTypography = motion(Typography)

  const navigate = useNavigate();
  const [streak, setStreak] = useState(null);
  const [lives, setLives] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    async function currentStreak() {
      try {
        const response = await axios.get('http://localhost:8000/journal/streak');
        if (response) {
          console.log("Current streak fetched successfully:", response);
          setStreak(response.data.streak);
          setLives(response.data.lives);
        } else {
          console.log("No current streak found.");
        }
      } catch (error) {
        console.error("Error fetching current streak:", error);
      }
    }
    currentStreak();
  }, []);

  useEffect(() => {
    async function checkCompleted() {
      try {
          const completedStatus = await axios.get('http://localhost:8000/journal/completed')
          console.log(completedStatus)
          setIsCompleted(completedStatus.data.completed)
      } catch (error) {
        console.log('failed to grab completed status', error)
      }
    }
    checkCompleted();
  }, [])
  
  const pageVariant = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  }

  return (
    <>
        <MotionTypography sx={{ cursor: 'pointer' }} onClick={() => navigate('journal/history')} variants={pageVariant} initial="initial" animate="animate" transition={{ type: 'spring', delay: 0.3 }} className="text-white"
          whileHover={{scale: 1.05, color: "#eb3434"}}>
          {streak !== null ? `Current Streak: ${streak}` : "Loading..."}
        </MotionTypography>
      
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <motion.img variants={pageVariant} initial="initial" animate="animate" transition={{ type: 'spring', delay: 0.4 }} src={lives === 3 ? ThreeLivesImg : lives === 2 ? TwoLivesImg : lives === 1 ? OneLifeImg : NoLivesImg} alt="streak" style={{ width: '88%', height: '87%', display: 'block' }}/>
        
        <MotionButton disabled={isCompleted} onClick={() => navigate('/journal/star-rating')} variant="contained" style={{ fontSize: '12px', position: 'absolute', top: '88%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, width: "100%"}}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            opacity: 1,
            '&.Mui-disabled': {
              backgroundColor: '#a0a3a1',
              color: 'white',
              opacity: 1,
            },
          }}
          initial={{y: -10, x: '-50%', opacity: 0 }} animate={{y: -20, x: '-50%', opacity: 1 }} transition={{ type: 'spring', delay: 0.5 }}
          >
          {isCompleted ? 'Log Completed For The Day!' : 'Log Journal'}
        </MotionButton>
      </div>
    </>
  );
};

export default Menu;
