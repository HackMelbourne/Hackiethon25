import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../Styles-thanos/Tasks.css';

const Tasks = ({ data, visibility, setVisibility }) => {
  const { purpleTask, greenTask, blueTask, redTask, yellowTask, orangeTask } = data;
  const {
    purpleVisible,greenVisible,blueVisible,redVisible,yellowVisible,orangeVisible,
  } = visibility;
  const {
    setPurpleVisible,
    setGreenVisible,
    setBlueVisible,setRedVisible,setYellowVisible,
    setOrangeVisible,
  } = setVisibility;

  const [taskVisibility, setTaskVisibility] = useState({
    purple: true,green: true,blue: true,
    red: true,
    yellow: true,
    orange: true,
  });

  const handleTaskDone = (color) => {
    switch (color) {
      case "purple":
        setPurpleVisible(true);
        break;
      case "green":
        setGreenVisible(true);
        break;
      case "blue":
        setBlueVisible(true);
        break;
      case "red":
        setRedVisible(true);
        break;
      case "yellow":
        setYellowVisible(true);
        break;
      case "orange":
        setOrangeVisible(true);
        break;
      default:
        break;
    }

    setTaskVisibility((prev) => ({ ...prev, [color]: false }));

    if ( color === "orange" && Object.values(taskVisibility).every((visible) => !visible)
    ) {
      setPurpleVisible(true);
    }
  };

  return (
    <div className="task-body">
      {taskVisibility.purple && (
        <div className="task-container">
          <div className="purple-task task">{purpleTask}</div>
          <button className="task-button" onClick={() => handleTaskDone("purple")}>
            Done
          </button>
        </div>
      )}
      {taskVisibility.green && (
        <div className="task-container">
          <div className="green-task task">{greenTask}</div>
          <button className="task-button" onClick={() => handleTaskDone("green")}>
            Done
          </button>
        </div>
      )}
      {taskVisibility.blue && (
        <div className="task-container">
          <div className="blue-task task">{blueTask}</div>
          <button className="task-button" onClick={() => handleTaskDone("blue")}>
            Done
          </button>
        </div>
      )}
      {taskVisibility.red && (
        <div className="task-container">
          <div className="red-task task">{redTask}</div>
          <button className="task-button" onClick={() => handleTaskDone("red")}>
            Done
          </button>
        </div>
      )}
      {taskVisibility.yellow && (
        <div className="task-container">
          <div className="yellow-task task">{yellowTask}</div><button className="task-button" onClick={() => handleTaskDone("yellow")}>Done</button>
        </div>
      )}
      {taskVisibility.orange && (
        <div className="task-container">
          <div className="orange-task task">{orangeTask}</div>
          <button className="task-button" onClick={() => handleTaskDone("orange")}>Done</button>
        </div>
      )}
    </div>
  );
};

Tasks.propTypes = {
  data: PropTypes.shape({
    purpleTask: PropTypes.string,greenTask: PropTypes.string,blueTask: PropTypes.string,
    redTask: PropTypes.string,
    yellowTask: PropTypes.string,
    orangeTask: PropTypes.string,
  }).isRequired,
  visibility: PropTypes.shape({
    purpleVisible: PropTypes.bool,greenVisible: PropTypes.bool,blueVisible: PropTypes.bool,redVisible: PropTypes.bool,yellowVisible: PropTypes.bool,
    orangeVisible: PropTypes.bool,
  }).isRequired,
  setVisibility: PropTypes.shape({
    setPurpleVisible: PropTypes.func, setGreenVisible: PropTypes.func, setBlueVisible: PropTypes.func, setRedVisible: PropTypes.func, setYellowVisible: PropTypes.func,
    setOrangeVisible: PropTypes.func,
  }).isRequired,
};

export default Tasks;