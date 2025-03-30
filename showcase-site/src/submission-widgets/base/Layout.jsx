import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/momentum.png"
import React from "react";

const Layout = () => {

  return (
      <div className="w-[300px] h-[370px] p-6 mx-auto bg-gray-800 rounded-xl shadow-lg flex flex-col justify-start">
          <div className="text-center mx-auto mb-4">
              <motion.div initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.5}}>
                  <img src={logo} alt="Momentum Logo" style={{height: '70px'}}/>
              </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
              <Outlet/>
          </div>
      </div>
  );
};

export default Layout;