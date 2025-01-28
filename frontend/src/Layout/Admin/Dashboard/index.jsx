import React, { Fragment, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import GreetingCard from "./GreetingCard";
import WidgetsWrapper from "./WidgetsWraper";
import RecentNotices from "./RecentNotices";
import Calender from '../Dashboard/Calender';
import axios from "axios";
import { setAuthenticated } from "../../../redux/authRedux";
import { baseApiURL } from '../../../baseUrl';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuthorization = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/adminRoutes`, {
          withCredentials: true,
        });

        const data = response.data;

        if (data.authenticated) {
          dispatch(setAuthenticated(true));
          window.history.pushState(null, null, window.location.pathname);
        } else {
          navigate(`${process.env.PUBLIC_URL}/adminlogin`, { replace: true });
        }

      } catch (error) {
        navigate(`${process.env.PUBLIC_URL}/adminlogin`, { replace: true });
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

  }, [dispatch , navigate]);

  return (
    <Fragment>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Container fluid={true}>
        <Row className="widget-grid">
          <GreetingCard />
          <WidgetsWrapper />
          <Row className="widget-row">
            <Col xxl='5' xl='6' lg='12' className='box-col'>
              <Calender />
            </Col>
            <Col xxl='7' xl='6' lg='12' className='box-col'>
              <RecentNotices />
            </Col>
          </Row>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
