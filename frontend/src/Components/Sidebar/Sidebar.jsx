import React, { useContext, useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../Features/themeSlice";
import axios from "axios";
import { myContext } from "../MainContainer";
import logo from "../../Images/strife.jpeg";
import Tooltip from "@mui/material/Tooltip";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  //console.log("Context API : refresh : ", refresh);
  const [conversations, setConversations] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [searchChat, setSearchChat] = useState("");
  const nav = useNavigate();
  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  const user = userData.data;
  useEffect(() => {

    axios.get("http://localhost:4040/chat/", {headers: {
      Authorization: `Bearer ${user.token}`,
    },}).then((response) => {
      setConversations(response.data);
    });
  }, [refresh, user.token, conversations ]); // conversations add to array

  return (
    <div className="sidebar-container">
      <div className={"sb-header" + (lightTheme ? "" : " dark")}>
        <div className="other-icons">
          <IconButton
            onClick={() => {
              nav("/app/welcome");
            }}
          >
            <AccountCircleIcon
              className={"icon" + (lightTheme ? "" : " dark")}
            />
          </IconButton>

          <IconButton
            onClick={() => {
              navigate("users");
            }}
          >
            <Tooltip title="Add Person">
              <IconButton
                onClick={() => {
                navigate("groups");
            }}
            >
                <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Group Chat">
              <IconButton
                onClick={() => {
                navigate("groups");
            }}
              >
             <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
              </IconButton>
            </Tooltip>
          
            <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>

          <IconButton
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lightTheme && (
              <NightlightIcon
                className={"icon" + (lightTheme ? "" : " dark")}
              />
            )}
            {!lightTheme && (
              <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </IconButton>
          <IconButton
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            
            <ExitToAppIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
      
        </div>
      </div>
      <div className={"sb-search" + (lightTheme ? "" : " dark")}>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
          <SearchIcon />
        </IconButton>
        <input
          placeholder="Search"
          className={"search-box" + (lightTheme ? "" : " dark")}
          onChange={(e) => {
            setSearchChat(e.target.value);
          }}
        />
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        {conversations.filter(c => {
          if(c.isGroupChat){
            //console.log(c.chatName.includes(searchChat));
            if(c.chatName.includes(searchChat)){return true;}
            return false;
          } else {
            //console.log(c.users[1].username.includes(searchChat));
            //console.log(c.users[0].username.includes(searchChat));
            if(c.users[0].username.includes(searchChat) || c.users[1].username.includes(searchChat)){return true;}
            return false;
          }
        })
        .map((conversation, index) => {
          //console.log("current convo : ", index, conversation);
          if (conversation.users.length === 1) {
            return <div key={index}></div>;
          }
          if (conversation.latestMessage === undefined) {
            if(conversation.isGroupChat){
              return (
                <div
                  key={index}
                  onClick={() => {
                    console.log("Refresh fired from sidebar");
                    setRefresh(!refresh);
                  }}
                >
                  <div
                    key={index}
                    className="conversation-container"
                    onClick={() => {
                      let ulist = "";
                      if(conversation.users.length > 1){
                        conversation.users.forEach(e => {
                          ulist+=("&"+e.username)
                        })
                      }
                      navigate("chat/" + conversation._id + "&" + conversation.chatName + ulist);
                    }}
                  >
                    <img src={logo} alt="logo" className={"con-icon" + (lightTheme ? "" : " dark")}/>
                    <p className={"con-title" + (lightTheme ? "" : " dark")}>
                      {conversation.chatName}
                    </p>
                    <p className="con-lastMessage">
                      No previous Messages, click here to start a new chat
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  onClick={() => {
                    console.log("Refresh fired from sidebar");
                    setRefresh(!refresh);
                  }}
                >
                  <div
                    key={index}
                    className="conversation-container"
                    onClick={() => {
                      navigate("chat/" + conversation._id + "&" + conversation.users[1].username);
                    }}
                  >
                    <img src={logo} alt="logo" className={"con-icon" + (lightTheme ? "" : " dark")}/>
                    <p className={"con-title" + (lightTheme ? "" : " dark")}>
                      {conversation.users[1].username}
                    </p>
                    <p className="con-lastMessage">
                      No previous Messages, click here to start a new chat
                    </p>
                  </div>
                </div>
              );
            }
          } 
          else {
            //console.log('checking eq',conversation.users, user.id)
            if(conversation.isGroupChat){
              return (
                <div
                  key={index}
                  className="conversation-container"
                  onClick={() => {
                    let ulist = "";
                      if(conversation.users.length > 1){
                        conversation.users.forEach(e => {
                          ulist+=("&"+e.username)
                        })
                      }
                    navigate("chat/" + conversation._id + "&" + conversation.chatName + ulist);
                  }}
                >
                  <img src={logo} alt="generaldp" className={"con-icon" + (lightTheme ? "" : " dark")}/>
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {conversation.chatName}
                  </p>
                  <p className="con-lastMessage">
                    {conversation.latestMessage.content}
                  </p>
                </div>
              );
            }
            else if(user.id === conversation.users[0]._id){
              return (
                <div
                  key={index}
                  className="conversation-container"
                  onClick={() => {
                    navigate("chat/" + conversation._id + "&" + conversation.users[1].username);
                  }}
                >
                  <img src={logo} alt="generaldp" className={"con-icon" + (lightTheme ? "" : " dark")}/>
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {conversation.users[1].username}
                  </p>
                  <p className="con-lastMessage">
                    {conversation.latestMessage.content}
                  </p>
                </div>
              );
            } else{
              return (
                <div
                  key={index}
                  className="conversation-container"
                  onClick={() => {
                    navigate(
                      "chat/" +
                        conversation._id +
                        "&" +
                        conversation.users[0].username
                    );
                  }}
                >
                  <img src={logo} alt="generaldp" className={"con-icon" + (lightTheme ? "" : " dark")}/>
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {conversation.users[0].username}
                  </p>
                  <p className="con-lastMessage">
                    {conversation.latestMessage.content}
                  </p>
                </div>
              );
            }
            
          }
        })}
      </div>
    </div>
  );
}

export default Sidebar;