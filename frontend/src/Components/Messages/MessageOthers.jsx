import React from "react";
import "../myStyles.css";
import { useSelector } from "react-redux";

function MessageOthers({ props }) {
  // console.log("props.sender ",props.sender)
  const lightTheme = useSelector((state) => state.themeKey);
  return (
    <div className={"other-message-container" + (lightTheme ? "" : " dark")}>
      <div className={"conversation-container" + (lightTheme ? "" : " dark")}>
        <p className={"con-icon" + (lightTheme ? "" : " dark")}>
          {props.message.sender.username}
        </p>
        <div className={"other-text-content" + (lightTheme ? "" : " dark")}>
          <p className={"con-title" + (lightTheme ? "" : " dark")}>
            {props.message.sender.username}
          </p>
          <p className={"con-lastMessage" + (lightTheme ? "" : " dark")}>
            {props.message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;
