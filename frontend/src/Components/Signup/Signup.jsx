import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Backdrop, CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import logo from '../../Images/strife.jpeg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [radioBtn, setRadioBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const errorPane = {
    position: 'top-center',
    autoClose: 2000,
    pauseOnHover: true,
    theme: 'dark',
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password.trim() !== confirmPassword.trim()) {
      setLoading(false);
      toast.error('Password and confirm password should be same.', errorPane);
      return false;
    } else if (username.length < 3) {
      setLoading(false);
      toast.error('Username should be greater than 3 characters.', errorPane);
      return false;
    } else if (password.length < 8) {
      setLoading(false);
      toast.error('Password should be equal or greater than 8 characters.', errorPane);
      return false;
    } else if (email === '') {
      setLoading(false);
      toast.error('Email is required.', errorPane);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { email, username, password } = values;
    if (radioBtn === false) {
      setLoading(false);
      toast.error('Please agree with our terms and conditions.', errorPane);
      return;
    }
    if (handleValidation()) {
      try {
        const response = await axios.post(
          'http://localhost:4040/register/',
          {
            username,
            email,
            password,
          },
          {
            headers: {
              'Content-type': 'application/json',
            },
          }
        );
        console.log(response);
        navigate('/app/welcome');
        localStorage.setItem('userData', JSON.stringify(response));
        setLoading(false);
      } catch (error) {
        console.log(error);
        if (error.response.status === 405) {
          setLoading(false);
          toast.error('User with email already exists. Please create a new email!', errorPane);
        }
        if (error.response.status === 406) {
          setLoading(false);
          toast.error('User already exists. Please create a new username!', errorPane);
        }
      }
    }
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <div className="login-container">
        <div className="image-container">
          <img src={logo} alt="Logo" className="welcome-logo" />
        </div>
        <div className="login-box">
          <form action="" onSubmit={(event) => handleSubmit(event)}>
            <div className="container-alt-login">
              <div className="container-about-signup">
                <div className="about">
                  <h1>Let's get you ready</h1>
                </div>
              </div>
              <div className="form-container-login">
                <div className="fields-group-login">
                  <TextField
                    className="input-email-sigup"
                    type="text"
                    label="Username"
                    name="username"
                    onChange={(e) => handleChange(e)}
                    required
                  />
                  <br />
                  <TextField
                    className="input-email-sigup"
                    type="email"
                    label="Email"
                    name="email"
                    onChange={(e) => handleChange(e)}
                    required
                  />
                  <br />
                  <TextField
                    className="input-email-sigup"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    name="password"
                    onChange={(e) => handleChange(e)}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <br />
                  <TextField
                    className="input-email-sigup"
                    type={showPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    name="confirmPassword"
                    onChange={(e) => handleChange(e)}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <br />
                <div>
                  <button className="button-login" type="submit" id="btn" onClick={(e) => handleSubmit(e)}>
                    Create User
                  </button>
                </div>
                <label className="checkbox">
                  <input
                    required="required"
                    aria-required="true"
                    type="checkbox"
                    value="1"
                    name="user[agreement]"
                    id="user_agreement"
                    onClick={() => setRadioBtn(true)}
                    onChange={() => setRadioBtn(!radioBtn)}
                  />
                  <p className="checkbox-req">I have read and agree to the strife terms</p>
                </label>
                <div className="form-footer-login">
                  <ul className="no-list-login">
                    <li>
                      Already have an account ? <Link to="/">Login.</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default SignUp;
