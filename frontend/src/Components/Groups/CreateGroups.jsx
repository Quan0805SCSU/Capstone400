import React, { useState } from "react";
import DoneOutlineRoundedIcon from "@mui/icons-material/DoneOutlineRounded";
import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateGroups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();
  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }
  const user = userData.data;
  const [groupName, setGroupName] = useState("");
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = useState([]);
  const [inputUser, setInputUser] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  console.log("User Data from CreateGroups : ", userData);

  const createGroup = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    console.log('in c groups',users)
    axios.post(
      "http://localhost:4040/group",
      {
        name: groupName,
        users: users,
      },
      config
    );
    setInputUser([]);
    nav("/app/groups");
  };

  const addUsers = async () => {
    setUsers([...users, inputUser]);
    setInputUser("");
  }

  return (
    <>
      <div>
        <div>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Do you want to create a Group Named " + groupName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This will create a create group in which you will be the admin and
                other will be able to join this group.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Disagree</Button>
              <Button
                onClick={() => {
                  createGroup();
                  handleClose();
                }}
                autoFocus
              >
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        <div className={"createGroups-container" + (lightTheme ? "" : "-dark")}>
          <input
            placeholder="Enter Group Name"
            className={"search-box" + (lightTheme ? "" : "-dark")}
            onChange={(e) => {
              setGroupName(e.target.value);
            }}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : "-dark")}
            onClick={() => {
              handleClickOpen();
              // createGroup();
            }}
          >
            <DoneOutlineRoundedIcon />
          </IconButton>
        </div>
        <div className={"createGroups-container" + (lightTheme ? "" : "-dark")}>
          <br/>
          <input
            placeholder="Enter Users"
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={inputUser}
            onChange={(e) => {
              setInputUser(e.target.value);
            }}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => {
              //handleClickOpen();
              addUsers();
            }}
          >
            <AddIcon />
          </IconButton>
          
        </div>

          
          {users.reverse().map((user) => {
              return(<input
                placeholder={user}
                value={inputUser}
                disabled
              />);
          })}
          
        
      </div>
    </>
  );
}

export default CreateGroups;
