import React from 'react';
import Lottie from 'lottie-react';
import successCheck from '../assets/success.json';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
      const timeout = setTimeout(() => {
        navigate('/');
      }, 2500);

      return () => clearTimeout(timeout); // cleanup
    }, [navigate]);

    return (
        <Lottie
            animationData={successCheck}
            loop={false}
            autoplay={true}
            style={{ width: 100, height: 100 }}
        />
    );
};

export default Success;