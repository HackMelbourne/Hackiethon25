import { Outlet, useOutlet } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';
import React from "react";

const JournalLayout = ({ journalState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();

  const handleBackClick = () => {
    if (location.pathname === '/journal/star-rating') {
      navigate("/");
    } else if (location.pathname === '/journal/goal-review') {
      navigate('star-rating');
    } else if (location.pathname === '/journal/goal-create') {
      navigate('goal-review');
    } else if (location.pathname === '/journal/highlights') {
      navigate('goal-create');
    } else {
      navigate(-1);
    }
    // navigate(-1);
  };

  const handleMenuClick = () => {
    navigate('/');
  }

  
  return (
      <div style={{color: "white"}}>
          {/* {isInitialLoad ? ( */}
          {/* // ) : (
        //   <Typography variant="h4" sx={{ mb: 2 }}>Journal</Typography>
        // )} */}
          <AnimatePresence mode="wait">
              <motion.div
                  key={location.pathname}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -20}}
                  transition={{duration: 0.3}}
              >
                  {outlet}
              </motion.div>
          </AnimatePresence>

          <Stack direction="row" alignItems="center" justifyContent="center" spacing={10} sx={{mt: 5}}>
            <Button variant="outlined" style={{ fontSize: '12px', position: 'absolute', top: '88%', left: '20%', transform: 'translate(-50%, -50%)', zIndex: 1 }} onClick={handleBackClick}>Back</Button>
            <Button variant="outlined" style={{ fontSize: '12px', position: 'absolute', top: '88%', right: '0%', transform: 'translate(-50%, -50%)', zIndex: 1 }} onClick={handleMenuClick}>Menu</Button>
          </Stack>
          
      </div>
  )
};

export default JournalLayout;