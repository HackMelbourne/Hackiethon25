import React from 'react'

import { useState } from 'react'
import "../Styles-thanos/Tasks.css"

import "../Styles-thanos/List.css"
import "../Styles-thanos/Manager.css"

const List = ({
  setShowForm,setPurpleTask,
  setGreenTask,
  setBlueTask,setRedTask,
  setYellowTask,setOrangeTask,
}) => {

  const changePurple = (event) =>{
    setPurpleTask(event.target.value)
  }


  const changeGreen = (event) =>{
    setGreenTask(event.target.value)
  }
  const changeBlue = (event) =>{
    setBlueTask(event.target.value)
  }

  const changeRed = (event) =>{
    setRedTask(event.target.value)
  }
  const changeYellow = (event) =>{
    setYellowTask(event.target.value)
  }


  const changeOrange = (event) =>{
    setOrangeTask(event.target.value)
  }

  const setTask = (event)=>{
    event.preventDefault()
    setShowForm(false)
  }



  return (
    <div className='task-manager'>
    <form onSubmit={setTask}>
    <div className="mb-4 input-div">
      <label  className="block text-gray-600 mb-1"> </label>

      <input type="text" onChange={changePurple}/>
    </div>
    <div className="mb-4 input-div">
      <label  className="block text-gray-600 mb-1"> </label><input type="text" onChange={changeGreen}/>
    </div>
    <div className="mb-4 input-div">
      <label  className="block text-gray-600 mb-1"> </label>
      <input type="text" onChange={changeBlue}/>
    </div>
    <div className="mb-4 input-div">
      <label  className="block text-gray-600 mb-1"> </label><input type="text" onChange={changeRed}/>
    </div>
    <div className="mb-4 input-div">
      <label className="block text-gray-600 mb-1"></label><input type='text' onChange={changeYellow}/>
    </div>
    <div className="mb-4 input-div">
      <label className="block text-gray-600 mb-1"></label>
      <input type="text" onChange={changeOrange}/>

    </div>
    <button
      type="submit"

      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
    >
      Set</button>
  </form>
    </div>
  )
}

export default List