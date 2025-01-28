import React, { Fragment, useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Edit, Eye } from 'react-feather';
import { Trash2 } from 'react-feather';
import { Row, Col, Card, CardHeader, Table, Modal, ModalBody, Input, Form, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Btn, H3 } from '../../../AbstractElements';
import { setAuthenticated } from "../../../redux/authRedux";
import AddStudents from "./AddStudent";
import EditStudent from "./EditStudent";
import StudentDetails from "./StudentDetails";
import { baseApiURL } from '../../../baseUrl';
import Swal from 'sweetalert2';
import { useMediaQuery } from 'react-responsive';

const Student = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [studentDetailsModal, setStudentDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [refreshTable, setRefreshTable] = useState(false);
    const [loadingTableData, setLoadingTableData] = useState(true);

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

    }, [dispatch, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getStudentDetails`);
                setTimeout(() => {
                    setStudents(response.data);
                    setLoadingTableData(false);
                }, 1000);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Student Details!',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchData();
    }, [refreshTable]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getDepartment`);
                const departmentsArray = Array.isArray(response.data) ? response.data : [response.data];
                setDepartments(departmentsArray);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Departments!',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchDepartments();
    }, []);

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (studentId) => {
        try {
            const confirmed = await confirmDelete();
            if (confirmed) {
                const response = await axios.post(`${baseApiURL()}/deleteStudentDetails/${studentId}`);

                setStudents((prevStudents) => prevStudents.filter((student) => student._id !== studentId));
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Student data has been successfully deleted.',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Deleting Student!',
                confirmButtonText: 'OK'
            });
        }
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this student data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        return result.isConfirmed;
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        setCurrentPage(1);
    };

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const departmentFilter = selectedDepartment === '' || item.department.toLowerCase() === selectedDepartment.toLowerCase();
        const semesterFilter = selectedSemester === '' || (item.semester && item.semester.toLowerCase() === selectedSemester.toLowerCase());
        return (
            ((item.enrollmentNo && item.enrollmentNo.toString().toLowerCase().includes(searchTerm)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchTerm))
            )) && departmentFilter && semesterFilter;
    };

    const openAddModal = () => {
        setAddModal(true);
    };

    const closeAddModal = () => {
        setAddModal(false);
        setRefreshTable(true);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setEditModal(true);
    };

    const closeEditModal = () => {
        setSelectedStudent(null);
        setEditModal(false);
        setRefreshTable(true);
    };

    const openStudentDetailsModal = (student) => {
        setSelectedStudent(student);
        setStudentDetailsModal(true);
    };

    const closeStudentDetailsModal = () => {
        setSelectedStudent(null);
        setStudentDetailsModal(false);
    };

    useEffect(() => {
        const loadImage = (item) => {
            const img = new Image();
            img.src = item.profile;
            img.onload = () => {
                setStudents((prevStudents) => {
                    return prevStudents.map((student) => {
                        if (student._id === item._id) {
                            return { ...student, imageLoaded: true };
                        }
                        return student;
                    });
                });
            };
        };

        students.forEach((item) => {
            if (!item.imageLoaded) {
                loadImage(item);
            }
        });
    }, [students]);

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Alumni List</H3>
                        <span>&nbsp;</span>
                        <Btn attrBtn={{ color: 'primary d-flex align-items-center', className: "btn btn-air-primary", onClick: openAddModal }}>
                            <Plus style={{ width: '18px', height: '18px' }} className='me-2' /> Add New Alumni
                        </Btn>
                        <Modal isOpen={addModal} toggle={closeAddModal} size="xl" centered>
                            <ModalBody>
                                <AddStudents onClose={closeAddModal} />
                            </ModalBody>
                        </Modal>
                    </CardHeader>
                    <div className={`card-block row ${isMobile ? 'flex-column' : 'flex-row'}`}>
                        <Col sm="12" lg="12" xl="12">
                            <br /><br />
                            <Row className='d-flex justify-content-center'>
                                <Col sm="12" xl="3">
                                    <Form className='theme-form'>
                                        <Input type="select" className="form-control digits" name="department" value={selectedDepartment} onChange={handleDepartmentChange}>
                                            <option value="">All Departments</option>
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.deptname}>
                                                    {department.deptname}
                                                </option>
                                            ))}
                                        </Input>
                                    </Form>
                                </Col>
                                <Col sm="12" xl="3">
                                    <Form className='theme-form'>
                                        <Input type="select" name="select" className="form-control digits" defaultValue="1" value={selectedSemester} onChange={handleSemesterChange}>
                                            <option value="">All Semesters</option>
                                            <option>{'First Semester'}</option>
                                            <option>{'Second Semester'}</option>
                                            <option>{'Third Semester'}</option>
                                            <option>{'Fourth Semester'}</option>
                                            <option>{'Fifth Semester'}</option>
                                            <option>{'Sixth Semester'}</option>
                                            <option>{'Seventh Semester'}</option>
                                            <option>{'Eighth Semester'}</option>
                                        </Input>
                                    </Form>
                                </Col>
                                <Col sm="12" xl="3">
                                    <Form className='theme-form'>
                                        <Input type="search" name="select" className="form-control digits" placeholder='Search Students....' value={searchValue} onChange={handleSearchChange} />
                                    </Form>
                                </Col>
                            </Row>
                            <br /><br />
                            <div className={`table-responsive ${isMobile ? 'mb-3' : ''}`}>
                                <Table>
                                    <thead>
                                        <tr className='border-bottom-primary'>
                                            <th className='text-center fw-bold' scope='col'>Enrollment No.</th>
                                            <th className='text-center fw-bold' scope='col'>Full Name</th>
                                            <th className='text-center fw-bold' scope='col'>Department</th>
                                            <th className='text-center fw-bold' scope='col'>Semester</th>
                                            <th className='text-center fw-bold' scope='col'>Profile</th>
                                            <th className='text-center fw-bold' scope='col'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingTableData && (
                                            <tr>
                                                <th colSpan="11" className="text-center">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        )}
                                        {students.filter(applySearchFilter).length === 0 && !loadingTableData && (
                                            <tr>
                                                <td colSpan="11" className="text-center"><b>No Data Available</b></td>
                                            </tr>
                                        )}
                                        {students.filter(applySearchFilter).slice(indexOfFirstItem, indexOfLastItem).map((item) => (
                                            <tr key={item.id} className={`border-bottom-primary`}>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.enrollmentNo}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.fullName}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.department}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.semester}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.imageLoaded ? <img src={item.profile} width={65} height={65} alt="Thumbnail" style={{ borderRadius: '10px' }} /> : 'Loading...'}</td>
                                                <td className={`${isMobile ? '' : 'text-center align-middle'}`}>
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-success btn-sm", color: "success", onClick: () => openStudentDetailsModal(item) }} >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Eye size={16} />
                                                            </div>
                                                        </Btn>
                                                    </span>&nbsp;&nbsp;&nbsp;
                                                    <Modal isOpen={studentDetailsModal} toggle={closeStudentDetailsModal} size="xl" centered>
                                                        <ModalBody>
                                                            <StudentDetails student={selectedStudent} onClose={closeStudentDetailsModal} />
                                                        </ModalBody>
                                                    </Modal>
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-success btn-sm", color: "primary", onClick: () => openEditModal(item) }} >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Edit size={16} />
                                                            </div>
                                                        </Btn>
                                                    </span>&nbsp;&nbsp;&nbsp;
                                                    <Modal isOpen={editModal} toggle={closeEditModal} size="xl" centered>
                                                        <ModalBody>
                                                            <EditStudent student={selectedStudent} onClose={closeEditModal} />
                                                        </ModalBody>
                                                    </Modal>
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-danger btn-sm", onClick: () => handleDelete(item._id) }} >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Trash2 size={16} />
                                                            </div>
                                                        </Btn>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <PaginationItem disabled={currentPage === 1}>
                                            <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
                                        </PaginationItem>
                                        {[...Array(Math.ceil(students.filter(applySearchFilter).length / itemsPerPage))].map((_, i) => (
                                            <PaginationItem key={i} active={i + 1 === currentPage}>
                                                <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem disabled={currentPage === Math.ceil(students.filter(applySearchFilter).length / itemsPerPage)}>
                                            <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
                                        </PaginationItem>
                                    </Pagination>
                                </div>
                            </div>
                        </Col>
                    </div>
                </Card>
            </Col>
        </Fragment>
    )
}

export default Student;

