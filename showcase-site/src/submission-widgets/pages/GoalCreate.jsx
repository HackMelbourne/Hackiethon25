import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import { motion } from "framer-motion";

const GoalCreate = ({ useJournal }) => {
    const { setGoal } = useJournal();

    const [text, setText] = useState("");
    const navigate = useNavigate();

    const handleClick = (value) => {
        setGoal(value);
        navigate('/journal/highlights');
    };
    const MotionButton = motion(Button);

    return (
        <div style={{ textAlign: "center", }}>
            <h1>What's your goal for tomorrow?</h1>
            <TextField
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                label="Your Goal!"
                variant="standard"
                style={{
                    width: "250px",
                    marginTop: "10px",
                }}
                InputProps={{
                    style: {
                        color: "white",
                    },
                }}
                InputLabelProps={{
                    style: {
                        color: "white",
                    },
                }}
                sx={{
                    '& .MuiInput-underline:before': {
                        borderBottomColor: 'white',
                    },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                        borderBottomColor: 'white',
                    },
                }}
            />
            <div style={{ marginTop: "20px" }}>
                <MotionButton
                    variant="outlined"
                    onClick={() => handleClick(text)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{
                        scale: [1, 1.05],
                        textShadow: "0px 0px 8px rgb(255, 255, 255)",
                        boxShadow: "0px 0px 8px rgb(255, 255, 255)",
                    }}
                    animate={{ scale: 1 }}
                    size="large"
                    sx={{
                        px: 4,
                        py: 0.75,
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    Confirm
                </MotionButton>
            </div>
        </div>
    );
};

export default GoalCreate;
