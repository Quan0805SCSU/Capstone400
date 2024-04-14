import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Icon, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageSelf from "../Messages/MessageSelf";
import MessageOthers from "../Messages/MessageOthers";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import axios from "axios";
import { myContext } from "../MainContainer";
import EmojiPicker from 'emoji-picker-react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  var [chat_id, chat_user] = dyParams._id.split("&");
  //console.log(chat_id, chat_user);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  // console.log("Chat area id : ", chat_id._id);
  // const refresh = useSelector((state) => state.refreshKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [loaded, setloaded] = useState(false);
  const [emojiPickerWindow, setEmojiPickerWindow] = useState(false);

  const sendMessage = () => {
    axios.post("http://localhost:4040/sendmessage/",
        {
          content: messageContent,
          chatId: chat_id,
          recieverId: chat_user
        },
        {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        }
      )
      .then(({ data }) => {
        //console.log("Message Fired");
        setMessageContent("");
      });
  };

  const deleteChat = () => {
    axios.post("http://localhost:4040/deletechat/",
        {
          chatId: chat_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        }
      )
      .then(({ data }) => {
        console.log("Chat Deleted");
      });
  }

  useEffect(() => {
    axios.get("http://localhost:4040/getmessages/"+chat_id,  {headers: {
        Authorization: `Bearer ${userData.data.token}`,
      }} )
      .then(({ data }) => {
        setAllMessages(data);
        setloaded(true);
        //console.log("Data from Acess Chat API ", data);
      });
  }, [refresh, chat_id, userData.data.token, allMessages]); // add allMessages to array

  if (!loaded) {
    return (
      <div
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            borderRadius: "10px",
            flexGrow: "1",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  } else {
    return (
      <div className={"chatArea-container" + (lightTheme ? "" : " dark")}>
        <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
          <p className={"con-icon" + (lightTheme ? "" : " dark")}>
            {chat_user}
          </p>
          <div className={"header-text" + (lightTheme ? "" : " dark")}>
            <p className={"con-title" + (lightTheme ? "" : " dark")}>
              {chat_user}
            </p>
          </div>
          <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
            <DeleteIcon onClick={()=>deleteChat()}/>
          </IconButton>
        </div>
        <div className={"messages-container" + (lightTheme ? "" : " dark")}>
          {allMessages
            .slice(0)
            .reverse()
            .map((message, index) => {
              const sender = message.sender;
              const self_id = userData.data.id;
              const propMessage = {message: message, sender: userData.data.username, recipient: chat_user}
              if (sender._id === self_id) {
                return <MessageSelf props={propMessage} key={index} />;
              } else {
                return <MessageOthers props={propMessage} key={index} />;
              }
            })}
        </div>
        <div ref={messagesEndRef} className="BOTTOM" />
        <div className={"text-input-area" + (lightTheme ? "" : " dark")}>
          <input
            placeholder="Type a Message"
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
            }}
            onKeyDown={(event) => {
              if (event.code === "Enter") {
                // console.log(event);
                sendMessage();
                setMessageContent("");
                setRefresh(!refresh);
              }
            }}
          />
          <IconButton onClick={() => setEmojiPickerWindow(!emojiPickerWindow)}>
            <InsertEmoticonIcon/>
          </IconButton>
          {emojiPickerWindow && <EmojiPicker onEmojiClick={(emojiObj) => setMessageContent((msg)=> msg + emojiObj.emoji)} height={450} width={1200}/>}
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => {
              sendMessage();
              setRefresh(!refresh);
            }}
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default ChatArea;
