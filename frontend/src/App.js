import React from "react";
import "./App.css";
import MainContainer from "./Components/MainContainer";
import Login from "./Components/Login/Login";
import { Route, Routes } from "react-router-dom";
import Welcome from "./Components/Welcome/Welcome";
import ChatArea from "./Components/ChatArea/ChatArea";
import Users from "./Components/Users/Users";
import CreateGroups from "./Components/Groups/CreateGroups";
import Groups from "./Components/Groups/Groups";
import SignUp from "./Components/Signup/Signup";
import { useDispatch, useSelector } from "react-redux";


function App() {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  return (
    <div className={"App" + (lightTheme ? "" : "-dark")}>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="app" element={<MainContainer />}>
          <Route path="welcome" element={<Welcome />}></Route>
          <Route path="chat/:_id" element={<ChatArea />}></Route>
          <Route path="users" element={<Users />}></Route>
          <Route path="groups" element={<Groups />}></Route>
          <Route path="create-groups" element={<CreateGroups />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
