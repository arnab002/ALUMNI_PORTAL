import React, { Fragment, useState, useEffect } from 'react';
import { CheckCircle, Key, Send } from 'react-feather';
import axios from 'axios';
import Swal from "sweetalert2";
import { Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import { Btn, H4 } from '../AbstractElements';
import { baseApiURL } from '../baseUrl';
import { storage } from '../Config/firebaseconfig';
import { ref, getDownloadURL } from 'firebase/storage';
import Logo from '../assets/images/logo/svist-logo.png';

const ForgotPwd = () => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [togglePassword1, setTogglePassword1] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [userId, setUserId] = useState('');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(120);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [footerData, setFooterData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/getfooterdetails`);
        const firstItem = response.data[0];

        const storageRef = ref(storage, firstItem.logo);
        const imageUrl = await getDownloadURL(storageRef);

        setFooterData({
          logo: imageUrl
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error Fetching Footer Details!',
          confirmButtonText: 'OK',
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsOtpExpired(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const resetTimer = () => {
    setTimer(120);
    setIsOtpExpired(false);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter an email address.',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsSendingOTP(true);
    try {
      await axios.post(
        `${baseApiURL()}/sendotp`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: 'An OTP has been sent to your email address.',
        confirmButtonText: 'OK'
      });

      setStep(2);
      resetTimer();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (error.response && error.response.status === 404)
          ? error.response.data.message || 'The email address provided is not registered.'
          : error.message || 'Failed to send OTP',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter the OTP First!',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (isOtpExpired) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'The OTP has expired. Please request a new one.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const response = await axios.post(
        `${baseApiURL()}/verifyotp`,
        { email, otp },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.isVerified) {
        Swal.fire({
          icon: 'success',
          title: 'OTP Verified!',
          text: 'OTP has been verified successfully.',
          confirmButtonText: 'OK'
        });

        setStep(3);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: 'The OTP you entered is invalid.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to verify OTP',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (newPassword !== retypePassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Passwords do not match',
          confirmButtonText: 'OK'
        });
        return;
      }

      await axios.post(
        `${baseApiURL()}/forgotpassword`,
        { email, userId, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password Changed successfully.',
        confirmButtonText: 'OK'
      });

      setEmail('');
      setOtp('');
      setNewPassword('');
      setRetypePassword('');
      setStep(1);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to change password',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Fragment>
      <section>
        <Container fluid={true} className='p-0 login-page'>
          <Row className='m-0'>
            <Col xl='12 p-0'>
              <div className='login-card'>
                <div>
                  <div className="text-center mb-4">
                    <img src={footerData.logo} alt="Logo" style={{ maxWidth: "100px" }} />
                  </div>
                  <div className='login-main'>
                    <Form className='theme-form login-form' onSubmit={handleSubmit}>
                      <H4>Forgot Password ?</H4>
                      {step === 1 && (
                        <FormGroup>
                          <Label className="col-form-label">Email Address</Label>
                          <Input className="form-control" type="email" placeholder='abc@mail.com' onChange={(e) => setEmail(e.target.value)} value={email} required autoFocus />
                          <div className="d-flex justify-content-center">
                            <Btn
                              attrBtn={{ className: 'd-block w-40 mt-2 btn-pill btn-air-primary', color: 'primary', type: 'button', onClick: sendOTP }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isSendingOTP ? (
                                  <div className="spinner-border text-light" role="status">
                                    <span className="sr-only">Loading...</span>
                                  </div>
                                ) : (
                                  <Fragment>
                                    <Send size={16} />&nbsp; Send OTP
                                  </Fragment>
                                )}
                              </div>
                            </Btn>
                          </div>
                        </FormGroup>
                      )}
                      {step === 2 && (
                        <FormGroup>
                          <Label className="col-form-label">OTP</Label>
                          <Input className="form-control" type="text" placeholder='Enter OTP' onChange={(e) => setOtp(e.target.value)} value={otp} required />
                          <div className="d-flex justify-content-between align-items-center">
                            <Btn
                              attrBtn={{ className: 'd-block w-40 mt-2 btn-pill btn-air-primary', color: 'primary', type: 'button', onClick: verifyOTP }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle size={16} />&nbsp; Verify OTP
                              </div>
                            </Btn>
                            <div>
                              {timer > 0 ? (
                                <span><b>Time left:</b> {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</span>
                              ) : (
                                <Btn
                                  attrBtn={{ className: 'd-block w-40 mt-2 btn-pill btn-air-secondary', color: 'secondary', type: 'button', onClick: sendOTP }}
                                >
                                  Resend OTP
                                </Btn>
                              )}
                            </div>
                          </div>
                        </FormGroup>
                      )}
                      {step === 3 && (
                        <>
                          <FormGroup>
                            <Label className="col-form-label">User ID</Label>
                            <Input className="form-control" type="text" placeholder='Enter User ID' onChange={(e) => setUserId(e.target.value)} value={userId} required autoFocus/>
                          </FormGroup>
                          <FormGroup className='position-relative'>
                            <Label className='m-0 col-form-label'>New Password</Label>
                            <div className='position-relative'>
                              <Input
                                className='form-control'
                                type={togglePassword ? 'text' : 'password'}
                                required
                                placeholder='*********'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <div className='show-hide' onClick={() => setTogglePassword(!togglePassword)}>
                                <span className={togglePassword ? '' : 'show'}></span>
                              </div>
                            </div>
                          </FormGroup>
                          <FormGroup className='position-relative'>
                            <Label className='m-0 col-form-label'>Retype Password</Label>
                            <div className='position-relative'>
                              <Input
                                className='form-control'
                                type={togglePassword1 ? 'text' : 'password'}
                                name='checklogin[password]'
                                required
                                placeholder='*********'
                                value={retypePassword}
                                onChange={(e) => setRetypePassword(e.target.value)}
                              />
                              <div className='show-hide' onClick={() => setTogglePassword1(!togglePassword1)}>
                                <span className={togglePassword1 ? '' : 'show'}></span>
                              </div>
                            </div>
                          </FormGroup>
                          <FormGroup className='d-flex justify-content-center'>
                            <Btn
                              attrBtn={{ className: 'd-block w-40 mt-2 btn-pill btn-air-primary', color: 'primary', type: 'button', onClick: handleChangePassword }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Key size={16} />&nbsp; Change Password
                              </div>
                            </Btn>
                          </FormGroup>
                        </>
                      )}
                    </Form>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Fragment>
  );
};

export default ForgotPwd;
