import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuthenticated, setUserRole } from "../redux/authRedux";
import AdminLayoutRoute from "./AdminLayoutRoute";
import StudentLayoutRoute from "./StudentLayoutRoute";
import AdminSignin from "../Auth/AdminLogin";
import StudentSignin from "../Auth/StudentLogin";
import PrivateAdminRoute from "./PrivateAdminRoute";
import PrivateStudentRoute from "./PrivateStudentRoute";
import { baseApiURL } from '../baseUrl';
import Authlogin from "../pages/Authlogin";
import ForgotPwd from "../Auth/ForgotPwd";
import Home from "../pages/index";
import HomeCSE from "../pages/CSE";
import HomeECE from "../pages/ECE";
import HomeEEE from "../pages/EEE";
import HomeCE from "../pages/CE";
import HomeME from "../pages/ME";
import HomeMBA from "../pages/MBA";
import Error403 from "../pages/ErrorPage403";
import Error404 from "../pages/ErrorPage404";

const Routers = () => {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.authenticated);
  const userRole = useSelector((state) => state.userRole);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/checkauthentication`, {
          withCredentials: true,
        });

        const data = response.data;

        if (data.authenticated) {
          dispatch(setAuthenticated(true));
          dispatch(setUserRole(data.role));
        }
      } catch (error) {
          console.log();
      }
    };

    checkAuthentication();
  }, [dispatch]);

  const protectRoute = (role, allowedRoles, routeElement) => {
    if (authenticated && allowedRoles.includes(role)) {
      return routeElement;
    } else {
      <Navigate to={`${process.env.PUBLIC_URL}/404`} />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Computer-Science-Engineering(CSE)" element={<HomeCSE />} />
        <Route path="/Electronics-Communication-Engineering(ECE)" element={<HomeECE />} />
        <Route path="/Electronics-Electrical-Engineering(EEE)" element={<HomeEEE />} />
        <Route path="/Civil-Engineering(CE)" element={<HomeCE />} />
        <Route path="/Mechanical-Engineering(ME)" element={<HomeME />} />
        <Route path="/Master-of-Business-Administration(MBA)" element={<HomeMBA />} />

        <Route path="/admin" element={<PrivateAdminRoute />}>
          {protectRoute(userRole, ["Admin"], (
            <>
              <Route
                path="/admin"
                element={<Navigate to={`${process.env.PUBLIC_URL}/admin/dashboard`} />}
              />
            </>
          ))}
          <Route path="/admin/*" element={<AdminLayoutRoute />} />
        </Route>

        <Route path="/student" element={<PrivateStudentRoute />}>
          {protectRoute(userRole, ["Student"], (
            <>
              <Route
                path="/student"
                element={<Navigate to={`${process.env.PUBLIC_URL}/student/dashboard`} />}
              />
            </>
          ))}
          <Route path="/student/*" element={<StudentLayoutRoute />} />
        </Route>

        <Route exact path={`${process.env.PUBLIC_URL}/authlogin`} element={<Authlogin />} />
        <Route exact path={`${process.env.PUBLIC_URL}/adminlogin`} element={<AdminSignin />} />
        <Route exact path={`${process.env.PUBLIC_URL}/studentlogin`} element={<StudentSignin />} />
        <Route exact path={`${process.env.PUBLIC_URL}/forgotpassword`} element={<ForgotPwd />} />
        <Route exact path={`${process.env.PUBLIC_URL}/403`} element={<Error403 />} />
        <Route exact path={`${process.env.PUBLIC_URL}/404`} element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;