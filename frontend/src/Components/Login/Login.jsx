import React, { useState } from "react";
import logo from "../../Images/strife.jpeg";
import { Backdrop, Button, CircularProgress, BottomNavigation, BottomNavigationAction, InputAdornment, IconButton, TextField } from "@mui/material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Login() {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [value, setValue] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const errorPane = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    theme: 'dark'
  };

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleForgotPassword = () => {
    // Implement your forgot password logic here, such as sending a reset password link to the user's email
    toast.success("A password reset link has been sent to your email.", errorPane);
  };

  const loginHandler = async (e) => {
    setLoading(true);
    const { username, password } = data;
    try {
      const response = await axios.post("http://localhost:4040/login/",{
          username,
          password,
        },
        {headers: {
          "Content-type": "application/json",
        }},
      );
      
      if(response.data.status === true){
        setLoading(false);
        localStorage.setItem("userData", JSON.stringify(response));
        navigate("/app/welcome");
      }
      else{
        setLoading(false);
        toast.error("Incorrect username or password. Please try again", errorPane);
        navigate("/");
      }
      
    } catch (error) {
      toast.error("API Error. Please retry in few mins", errorPane);
    }
    setLoading(false);
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
      <div className="login-container">
        <div className="image-container">
          <img src={logo} alt="Logo" className="welcome-logo" />
        </div>
        <div className="login-box">
          <p className="login-text">Login to your Account</p>
          <div className="fields-group-login">
            <TextField
              className="input-email-sigup"
              type="text"
              placeholder="Username"
              name="username"
              onChange={(e) => changeHandler(e)}
            />
            <TextField
              className="input-email-sigup"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={data.password}
              onChange={(e) => changeHandler(e)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Button
            variant="outlined"
            color="secondary"
            onClick={loginHandler}
            isLoading
          >
            Login
          </Button>
          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <p>
            Don't have an Account ?{" "}
            <span
              className="hyper"
              onClick={() => {
                navigate('/signup')
              }}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
      <ToastContainer/>
      <BottomNavigation
        sx={{width: "90%", position: "absolute", bottom: 0}}
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="About" />
        <BottomNavigationAction label="Contact Us" />
      </BottomNavigation>
    </>
  );
}

export default Login;
