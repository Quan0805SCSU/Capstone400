import React from "react";
import logo from "../../Images/strife.jpeg";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
  const user = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();
  if (!user) {
    console.log("User not Authenticated");
    nav("/");
  }

  return (
    <div className={"welcome-container" + (lightTheme ? "" : " dark")}>
      <motion.img
        drag
        whileTap={{ scale: 1.05, rotate: 360 }}
        src={logo}
        alt="Logo"
        className="welcome-logo"
      />
      <b>Hello and Welcome, {user.data.username} to Strife - Chat App</b>
    </div>
  );
}

export default Welcome;
