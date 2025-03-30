import React from "react";
import Lottie from "lottie-react";
import PetAnimation from "./Ducky.json";
import "../styles-pixel/virtual-pet.css";

function VirtualPet() {
  return (
    <div className="pet-wrapper">
      <Lottie 
        animationData={PetAnimation} 
        className="pet-animation" 
        loop={true}
        autoplay={true}
      />
    </div>
  );
}

export default VirtualPet;
