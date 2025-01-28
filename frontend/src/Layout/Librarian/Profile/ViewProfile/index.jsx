import React, { Fragment, useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Form, FormGroup, Label, Row, Col, Modal, ModalBody, Spinner } from 'reactstrap';
import { H5, H6, P, Btn } from '../../../../AbstractElements';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../../redux/authRedux";
import { Key } from 'react-feather';
import { baseApiURL } from '../../../../baseUrl';
import ChangePwd from '../../../../Auth/ChangePwd';
import Swal from 'sweetalert2';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [userRole, setUserRole] = useState();
  const [userId, setUserId] = useState();
  const [adminData, setAdminData] = useState([]);
  const [pwdmodal, setPwdModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuthorization = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/librarianRoutes`, {
          withCredentials: true,
        });

        const data = response.data;

        if (data.authenticated) {
          dispatch(setAuthenticated(true));
          window.history.pushState(null, null, window.location.pathname);
        } else {
          navigate(`${process.env.PUBLIC_URL}/librarianlogin`, { replace: true });
        }

      } catch (error) {
        navigate(`${process.env.PUBLIC_URL}/librarianlogin`, { replace: true });
      }
    };

    checkAdminAuthorization();

    const handleBackButton = () => {
      window.history.forward();
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };

  }, [dispatch, navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/checkauthentication`, {
          withCredentials: true,
        });

        const data = response.data.user;
        setName(data.name);
        setEmail(data.email);
        setUserRole(data.role);
        setUserId(data.userid);
        setLoading(false);

      } catch (error) {
        console.log();
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${baseApiURL()}/getFilteredStaffDetails`, { fullName: name, email: email });
        const firstItem = response.data.staff[0];

        setAdminData({
          StaffID: firstItem.staffId,
          phoneNo: firstItem.phoneNo,
          address: firstItem.address,
          gender: firstItem.gender,
          profile: firstItem.profile,
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error Fetching Details!',
          confirmButtonText: 'OK'
        });
      }
    };

    if (name && email) {
      fetchData();
    }

  }, [name, email])

  const openPwdModal = () => {
    setPwdModal(true);
  };

  const closePwdModal = () => {
    setPwdModal(false);
  };

  return (
    <Fragment>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <Row className="justify-content-center">
        <Col sm='12' md='10' lg='8'>
          <Card>
            <CardHeader className='d-flex justify-content-between align-items-center'>
              <H5 attrH5={{ className: 'card-title mb-0' }}>My Profile</H5>
              <Btn attrBtn={{ color: 'primary', className: "btn btn-air-primary", onClick: openPwdModal }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={16} />&nbsp; Change Password
                </div>
              </Btn>
              <Modal isOpen={pwdmodal} toggle={closePwdModal} size="md" centered>
                <ModalBody>
                  {userId && <ChangePwd user={userId} onClose={closePwdModal} />}
                </ModalBody>
              </Modal>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner color="primary" />
                </div>
              ) : (
                <Form>
                  <Row className='mb-4'>
                    <Col sm='12' className='d-flex justify-content-center align-items-center flex-column'>
                      <div style={{ border: '4px solid #333', borderRadius: '50%', padding: '4px' }}>
                        <LazyLoadImage
                          alt='Profile'
                          src={adminData.profile}
                          effect="blur"
                          className='rounded-circle'
                          style={{ width: '180px', height: '180px' }}
                        />
                      </div>
                      <div className='mt-3'>
                        <Link to={`${process.env.PUBLIC_URL}/student/viewprofile`} className='text-dark'>
                          <H5 attrH5={{ className: 'mb-0 text-center' }}>{name}</H5>
                        </Link>
                        <center><P className="text-muted">{userRole}</P></center>
                      </div>
                    </Col>
                  </Row>
                  <Row className='m-3 d-flex justify-content-center align-items-center'>
                    <Col xl='4' className="mb-4 mb-xl-0">
                      <FormGroup>
                        <H6 attrH6={{ className: 'form-label fw-bold' }}>User ID</H6>
                        <P className="text-muted">{userId}</P>
                      </FormGroup>

                      <FormGroup>
                        <H6 attrH6={{ className: 'form-label fw-bold' }}>Staff ID</H6>
                        <P className="text-muted">{adminData.StaffID}</P>
                      </FormGroup>
                    </Col>
                    <Col xl='4' className="mb-4 mb-xl-0">
                      <FormGroup>
                        <H6 attrH6={{ className: 'form-label fw-bold' }}>Email Address</H6>
                        <P className="text-muted">{email}</P>
                      </FormGroup>

                      <FormGroup>
                        <H6 attrH6={{ className: 'form-label fw-bold' }}>Phone Number</H6>
                        <P className="text-muted">{adminData.phoneNo}</P>
                      </FormGroup>
                    </Col>
                    <Col xl='4'>
                      <FormGroup>
                        <H6 attrH6={{ className: 'form-label fw-bold' }}>Gender</H6>
                        <P className="text-muted">{adminData.gender}</P>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default ViewProfile;