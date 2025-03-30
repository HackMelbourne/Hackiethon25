import React from 'react';
import '../Styles-thanos/Manager.css';
import '../Styles-thanos/Stones.css';
import Guantlet from '../MyAssets-thanos/Gauntlet.jpg';
import red from '../MyAssets-thanos/red.png';
import green from '../MyAssets-thanos/green.png';

import blue from '../MyAssets-thanos/blue.png';

import orange from '../MyAssets-thanos/orange.png';
import purple from '../MyAssets-thanos/purple.png';

import yellow from '../MyAssets-thanos/yellow.png';
import danceGif from '../MyAssets-thanos/dance.gif';

const Stones = ({ visibility, showDanceGif }) => {
  const {
    purpleVisible,greenVisible,blueVisible,
    redVisible,
    yellowVisible,
    orangeVisible,
  } = visibility;

  return (
    <div className="stones-container">
      <img src={Guantlet} className="guantlet" alt="Guantlet" />{greenVisible && <img src={green} className="green stone" alt="Green Stone" />}
      {blueVisible && <img src={blue} className="blue stone" alt="Blue Stone" />}{redVisible && <img src={red} className="red stone" alt="Red Stone" />}{yellowVisible && <img src={yellow} className="yellow stone" alt="Yellow Stone" />}{orangeVisible && <img src={orange} className="orange stone" alt="Orange Stone" />}

      {purpleVisible && <img src={purple} className="purple stone" alt="Final Purple Stone" />}
      {showDanceGif && <img src={danceGif} className="dance-gif" alt="Dance Celebration" />}</div>
  );
};

export default Stones;