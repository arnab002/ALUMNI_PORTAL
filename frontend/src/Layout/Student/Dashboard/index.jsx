import React, { Fragment, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import GreetingGrid from './GreetingGrid';
import GreetingCard from "./GreetingCard";
import RecentNotices from './RecentNotices';
import Calender from '../Dashboard/Calender';
import AttendanceAnalytics from "./AttendanceAnalytics";
import { baseApiURL } from '../../../baseUrl';
import axios from "axios";
import { setAuthenticated } from "../../../redux/authRedux";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStudentAuthorization = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/studentRoutes`, {
          withCredentials: true,
        });

        const data = response.data;

        if (data.authenticated) {
          dispatch(setAuthenticated(true));
          window.history.pushState(null, null, window.location.pathname);
        } else {
          navigate(`${process.env.PUBLIC_URL}/studentlogin`, { replace: true });
        }

      } catch (error) {
        navigate(`${process.env.PUBLIC_URL}/studentlogin`, { replace: true });
      }
    };

    checkStudentAuthorization();

    const handleBackButton = () => {
      window.history.forward();
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };

  }, [dispatch, navigate]);

  return (
    <Fragment>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Container fluid={true}>
        <Row className="widget-grid">
          <Col sm='12' xl='5'>
            <GreetingCard />
          </Col>
          <GreetingGrid />
          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xxl={12}>
              <AttendanceAnalytics />
            </Col>
          </Row>
          <Row className="widget-row">
            <Col xxl='6' xl='6' lg='12' className='box-col'>
              <Calender />
            </Col>
            <Col xxl='6' xl='6' lg='12' className='box-col'>
              <RecentNotices />
            </Col>
          </Row>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
