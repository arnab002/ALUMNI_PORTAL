import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Col, Card, CardHeader } from "reactstrap";
import { H3 } from '../../../AbstractElements';
import axios from 'axios';
import { setAuthenticated } from "../../../redux/authRedux";
import { baseApiURL } from '../../../baseUrl';
import Swal from 'sweetalert2';
import { ScheduleComponent, Day, WorkWeek, Agenda, Inject } from '@syncfusion/ej2-react-schedule';

const Timetable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [semester, setSemester] = useState();
    const [department, setDepartment] = useState();
    const [timetable, setTimetable] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);

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

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/checkauthentication`, {
                    withCredentials: true,
                });

                const data = response.data.user;
                setName(data.name);
                setEmail(data.email);
                setDepartment(data.department);

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching User Details!',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchUserDetails();
    }, [name, email, department]);

    useEffect(() => {
        const FetchData = async () => {
          try {
            const response = await axios.post(`${baseApiURL()}/getFilteredStudentDetails`, { fullName: name, email: email });
            const firstItem = response.data.student[0];

            setSemester(firstItem.semester);
    
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error Fetching Student Details!',
              confirmButtonText: 'OK'
            });
          }
        };
    
        if (name && email) {
          FetchData();
        }
    
      }, [name, email])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${baseApiURL()}/getFilteredTimetable`, {
                    Department: department,
                    Semester: semester
                });
                const timetables = response.data.timetable.map(item => ({
                    Id: item._id,
                    Subject: item.Subject,
                    StartTime: new Date(item.StartTime),
                    EndTime: new Date(item.EndTime),
                    Department: item.Department,
                    Semester: item.Semester,
                    Faculty: item.Faculty,
                }));
                setTimetable(timetables);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Timetable Details!',
                    confirmButtonText: 'OK'
                });
            }
        };

        if (department && semester) {
            fetchData();
        }
    }, [refreshTable, department, semester]);

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);

    const eventSettings = {
        dataSource: timetable,
        fields: {
            id: 'Id',
            subject: { name: 'Subject', title: 'Subject', validation: { required: true } },
            startTime: { name: 'StartTime', title: 'Start Time' },
            endTime: { name: 'EndTime', title: 'End Time' },
            department: { name: 'Department', title: 'Department' },
            semester: { name: 'Semester', title: 'Semester' },
            faculty: { name: 'Faculty', title: 'Faculty' },
        },
        readonly: true 
    };

    const onPopupOpen = (args) => {
        if (args.type === 'Editor' || args.type === 'QuickInfo') {
            args.cancel = true; 
        }
    };

    const onEditorWindowOpen = (args) => {
        args.cancel = true;
    };

    const onCellClick = (args) => {
        args.cancel = true;
    };

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Timetable Section</H3>
                    </CardHeader>
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <ScheduleComponent
                                height='650px'
                                eventSettings={eventSettings}
                                startHour='10:30'
                                endHour='17:00'
                                views={['Day', 'WorkWeek', 'Agenda']}
                                workDays={[1, 2, 3, 4, 5, 6]}
                                popupOpen={onPopupOpen}
                                editorWindowOpen={onEditorWindowOpen}
                                cellClick={onCellClick}
                            >
                                <Inject services={[Day, WorkWeek, Agenda]} />
                            </ScheduleComponent>
                        </Col>
                    </div>
                </Card>
            </Col>
        </Fragment>
    )
}

export default Timetable;
