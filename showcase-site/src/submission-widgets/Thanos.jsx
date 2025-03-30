import List from './MyComponents-thanos/List';
import Stones from './MyComponents-thanos/Stones';
import Tasks from './MyComponents-thanos/Tasks';
import './Styles-thanos/Widget.css';
import './Styles-thanos/Guantlet.css';
import './Styles-thanos/Manager.css';
import { useState, useEffect } from 'react';

const Thanos = () => {
  const [showForm, setShowForm] = useState(true);

  const [purpleTask, setPurpleTask] = useState('');
  const [greenTask, setGreenTask] = useState('');
  const [blueTask, setBlueTask] = useState('');
  const [redTask, setRedTask] = useState('');
  const [yellowTask, setYellowTask] = useState('');
  const [orangeTask, setOrangeTask] = useState('');

  const [purpleVisible, setPurpleVisible] = useState(false);
  const [greenVisible, setGreenVisible] = useState(false);
  const [blueVisible, setBlueVisible] = useState(false);
  const [redVisible, setRedVisible] = useState(false);
  const [yellowVisible, setYellowVisible] = useState(false);
  const [orangeVisible, setOrangeVisible] = useState(false);

  const [showDanceGif, setShowDanceGif] = useState(false);

  useEffect(() => { // update this one
    if (
      purpleVisible && greenVisible && blueVisible && redVisible && yellowVisible && orangeVisible
    ) {
      const timer = setTimeout(() => {
        setShowDanceGif(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setShowDanceGif(false); // still need to fix this bro
    }
  }, [purpleVisible, greenVisible,blueVisible, redVisible, yellowVisible, orangeVisible]);

  const data = { purpleTask, greenTask,   blueTask, redTask, yellowTask, orangeTask };
  const visibility = {
    purpleVisible,greenVisible,blueVisible,redVisible,yellowVisible,orangeVisible,
  };
  const setVisibility = {
    setPurpleVisible,setGreenVisible,
    setBlueVisible, // fixed bug
    setRedVisible,setYellowVisible,
    setOrangeVisible,
  };

  return (
    <div className="p-10 bg-white rounded-xl shadow-lg widget">
      <div className="widget-container">
        {showForm && (
          <div className="widget-left">
            <List
              setShowForm={setShowForm}

              setPurpleTask={setPurpleTask}
              setGreenTask= {setGreenTask}
              setBlueTask={setBlueTask}
              setRedTask= {setRedTask}
              setYellowTask={setYellowTask}
              setOrangeTask={setOrangeTask}
            />
          </div>
        )}
        {!showForm && (
          <div className="widget-middle">
            <Tasks data={data} visibility={visibility} setVisibility={setVisibility} /></div>
        )}
        <div className="widget-right">



          <Stones visibility={visibility} showDanceGif={showDanceGif} />
        </div>
      </div>
    </div>
  );
};

export default Thanos;
