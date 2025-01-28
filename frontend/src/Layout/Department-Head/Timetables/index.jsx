import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Col, Card, CardHeader, Button } from "reactstrap";
import { H3 } from '../../../AbstractElements';
import axios from 'axios';
import { setAuthenticated } from "../../../redux/authRedux";
import { baseApiURL } from '../../../baseUrl';
import Swal from 'sweetalert2';
import Paper from '@mui/material/Paper';
import {
    Scheduler,
    WeekView,
    DayView,
    Appointments,
    AppointmentForm,
    Resources,
    AppointmentTooltip,
    Toolbar,
    DateNavigator
} from '@devexpress/dx-react-scheduler-material-ui';
import {
    ViewState,
    EditingState,
    IntegratedEditing,
} from '@devexpress/dx-react-scheduler';
import { useReactToPrint } from 'react-to-print';

const Timetable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [department, setDepartment] = useState();
    const [faculties, setFaculties] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const timetableRef = useRef();
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const checkDepartmentAdminAuthorization = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/departmentRoutes`, {
                    withCredentials: true,
                });

                const data = response.data;

                if (data.authenticated) {
                    dispatch(setAuthenticated(true));
                    window.history.pushState(null, null, window.location.pathname);
                } else {
                    navigate(`${process.env.PUBLIC_URL}/departmentlogin`, { replace: true });
                }

            } catch (error) {
                navigate(`${process.env.PUBLIC_URL}/departmentlogin`, { replace: true });
            }
        };

        checkDepartmentAdminAuthorization();

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
                setDepartment(data.department);

            } catch (error) {
                console.log();
            }
        };

        fetchUserDetails();
    }, [department]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${baseApiURL()}/getFilteredFacultyDetails`, {
                    department: department
                });
                setFaculties(response.data.faculty);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Faculty Details!',
                    confirmButtonText: 'OK'
                });
            }
        };

        if (department) {
            fetchData();
        }
    }, [department]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${baseApiURL()}/getFilteredTimetable`, {
                    Department: department
                });
                const timetables = response.data.timetable.map(item => ({
                    id: item._id,
                    title: item.Subject,
                    startDate: new Date(item.StartTime),
                    endDate: new Date(item.EndTime),
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

        if (department) {
            fetchData();
        }
    }, [refreshTable, department]);

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Timetable!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        return result.isConfirmed;
    };

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);

    const resources = [
        {
            fieldName: 'Department',
            title: 'Department',
            instances: [{ id: department, text: department }],
        },
        {
            fieldName: 'Semester',
            title: 'Semester',
            instances: ['First Semester', 'Second Semester', 'Third Semester', 'Fourth Semester', 'Fifth Semester', 'Sixth Semester', 'Seventh Semester', 'Eighth Semester'].map((semester, index) => ({ id: semester, text: semester })),
        },
        {
            fieldName: 'Faculty',
            title: 'Faculty',
            instances: faculties.map(faculty => ({ id: faculty.fullName, text: faculty.fullName })),
        },
    ];

    const onCommitChanges = async ({ added, changed, deleted }) => {
        if (added) {
            const data = {
                Subject: added.title,
                Department: added.Department,
                Semester: added.Semester,
                Faculty: added.Faculty,
                StartTime: added.startDate ? added.startDate.toISOString() : null,
                EndTime: added.endDate ? added.endDate.toISOString() : null,
            };
            try {
                const response = await axios.post(`${baseApiURL()}/addTimetable`, data);
                const newTimetable = {
                    id: response.data._id,
                    title: added.title,
                    startDate: new Date(added.startDate),
                    endDate: new Date(added.endDate),
                    Department: added.Department,
                    Semester: added.Semester,
                    Faculty: added.Faculty,
                };
                setTimetable(prevTimetable => [...prevTimetable, newTimetable]);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Timetable has been successfully added.',
                    confirmButtonText: 'OK',
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Adding Timetable!',
                    confirmButtonText: 'OK',
                });
            }
        }
        if (changed) {
            const id = Object.keys(changed)[0];
            const changedAppointment = changed[id];

            const existingAppointment = timetable.find(item => item.id === id);
            if (!existingAppointment) {
                console.error('Appointment not found');
                return;
            }

            console.log('Changed Appointment:', changedAppointment);
            console.log('Existing Appointment:', existingAppointment);

            const updatedAppointment = {
                ...existingAppointment,
                ...changedAppointment,
                startDate: changedAppointment.startDate || existingAppointment.startDate,
                endDate: changedAppointment.endDate || existingAppointment.endDate,
                title: changedAppointment.title || existingAppointment.title,
                Department: changedAppointment.Department || existingAppointment.Department,
                Semester: changedAppointment.Semester || existingAppointment.Semester,
                Faculty: changedAppointment.Faculty || existingAppointment.Faculty,
            };

            const data = {
                Id: id,
                Subject: updatedAppointment.title,
                Department: updatedAppointment.Department,
                Semester: updatedAppointment.Semester,
                Faculty: updatedAppointment.Faculty,
                StartTime: updatedAppointment.startDate instanceof Date
                    ? updatedAppointment.startDate.toISOString()
                    : new Date(updatedAppointment.startDate).toISOString(),
                EndTime: updatedAppointment.endDate instanceof Date
                    ? updatedAppointment.endDate.toISOString()
                    : new Date(updatedAppointment.endDate).toISOString(),
            };

            try {
                await axios.post(`${baseApiURL()}/editTimetableDetails/${id}`, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setTimetable(prevTimetable =>
                    prevTimetable.map(appointment =>
                        appointment.id === id ? updatedAppointment : appointment
                    )
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Timetable has been successfully updated.',
                    confirmButtonText: 'OK',
                });
            } catch (error) {
                console.error('Error updating timetable:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Updating Timetable!',
                    confirmButtonText: 'OK',
                });
            }
        }
        if (deleted) {
            try {
                const confirmed = await confirmDelete();
                if (confirmed) {
                    await axios.post(`${baseApiURL()}/deleteTimetableDetails/${deleted}`);
                    setTimetable(prevTimetable =>
                        prevTimetable.filter(appointment => appointment.id !== deleted)
                    );
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Timetable has been successfully deleted.',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Deleting Timetable!',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handlePrint = useReactToPrint({
        content: () => timetableRef.current,
        documentTitle: 'Timetable',
    });

    // Custom Appointment component to add more details to the tooltip
    const Appointment = ({ children, style, ...restProps }) => (
        <Appointments.Appointment
            {...restProps}
            style={{
                ...style,
                borderRadius: '8px',
            }}
        >
            {children}
        </Appointments.Appointment>
    );

    // Custom Tooltip Content component
    const Content = ({ children, appointmentData, ...restProps }) => (
        <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
            <div style={{ padding: '10px' }}>
                <div><strong>Subject:</strong> {appointmentData.title}</div>
                <div><strong>Department:</strong> {appointmentData.Department}</div>
                <div><strong>Semester:</strong> {appointmentData.Semester}</div>
                <div><strong>Faculty:</strong> {appointmentData.Faculty}</div>
            </div>
        </AppointmentTooltip.Content>
    );

    const TextEditor = (props) => {
        if (props.type === 'multilineTextEditor') {
            return null;
        }
        return <AppointmentForm.TextEditor {...props} />;
    };

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Timetable Section</H3>
                        <Button color="primary" onClick={handlePrint} style={{ float: 'right' }}>
                            Export to PDF
                        </Button>
                    </CardHeader>
                    <div className="card-block row" ref={timetableRef}>
                        <Col sm="12" lg="12" xl="12">
                            <Paper>
                                <Scheduler data={timetable} height={650}>
                                    <ViewState defaultCurrentViewName="Week" currentDate={currentDate} onCurrentDateChange={setCurrentDate} />
                                    <WeekView startDayHour={10} endDayHour={17} />
                                    <DayView />
                                    <Toolbar />
                                    <DateNavigator />
                                    <EditingState onCommitChanges={onCommitChanges} />
                                    <IntegratedEditing />
                                    <Appointments appointmentComponent={Appointment} />
                                    <AppointmentTooltip
                                        contentComponent={Content}
                                        showCloseButton
                                        showOpenButton
                                    />
                                    <Resources data={resources} />
                                    <AppointmentForm
                                        textEditorComponent={TextEditor}
                                    />
                                </Scheduler>
                            </Paper>
                        </Col>
                    </div>
                </Card>
            </Col>
        </Fragment>
    )
}

export default Timetable;
