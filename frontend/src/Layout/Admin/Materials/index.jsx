import React, { Fragment, useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, Card, CardHeader, Table, Modal, ModalBody, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Btn, H3 } from '../../../AbstractElements';
import axios from 'axios';
import { setAuthenticated } from "../../../redux/authRedux";
import { Eye } from 'react-feather';
import { Edit } from 'react-feather';
import { Trash2 } from 'react-feather';
import { Link } from 'react-router-dom';
import AddMaterial from './AddMaterial';
import EditMaterial from "./EditMaterial";
import Swal from 'sweetalert2';
import { baseApiURL } from '../../../baseUrl';
import { useMediaQuery } from 'react-responsive';

const Material = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getmaterials`);
                const sortedMaterials = response.data.sort((a, b) => {
                    const dateA = a.date.split('/').reverse().join('/');
                    const dateB = b.date.split('/').reverse().join('/');
                    return new Date(dateB) - new Date(dateA);
                });
                setTimeout(() => {
                    setMaterials(sortedMaterials);
                    setLoadingTableData(false);
                }, 1000);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Material Details!',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchData();
    }, [refreshTable]);

    const handleDelete = async (materialId) => {
        try {
            const confirmed = await confirmDelete();
            if (confirmed) {
                const response = await axios.post(`${baseApiURL()}/deletematerialdetails/${materialId}`);
                setMaterials((prevMaterials) => prevMaterials.filter((material) => material._id !== materialId));

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Material has been successfully deleted.',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Deleting Material!',
                confirmButtonText: 'OK'
            });
        }
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Material!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        return result.isConfirmed;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (selectedDepartment && selectedSemester) {
                    const response = await axios.post(`${baseApiURL()}/getFilteredSubjectDetails`, { deptname: selectedDepartment, semester: selectedSemester });
                    setSubjects(response.data.subject);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Subject Details!',
                    confirmButtonText: 'OK'
                });
            }
        };
    
        fetchData();
    }, [selectedDepartment, selectedSemester]);

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const departmentFilter = selectedDepartment === '' || item.department.toLowerCase() === selectedDepartment.toLowerCase();
        const semesterFilter = selectedSemester === '' || (item.semester && item.semester.toLowerCase() === selectedSemester.toLowerCase());
        const subjectFilter = selectedSubject === '' || (item.subject && item.subject.toLowerCase() === selectedSubject.toLowerCase());
        return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.faculty.toLowerCase().includes(searchTerm)
        ) && departmentFilter && semesterFilter && subjectFilter;
    };

    const openAddModal = () => {
        setAddModal(true);
    };

    const closeAddModal = () => {
        setAddModal(false);
        setRefreshTable(true);
    };

    const openEditModal = (material) => {
        setSelectedMaterial(material);
        setEditModal(true);
    };

    const closeEditModal = () => {
        setSelectedMaterial(null);
        setEditModal(false);
        setRefreshTable(true);
    };

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Material List</H3>
                        <span>&nbsp;</span>
                        <Btn attrBtn={{ color: 'primary d-flex align-items-center', className: "btn btn-air-primary", onClick: openAddModal }}>
                            <Plus style={{ width: '18px', height: '18px' }} className='me-2' /> Add New Material
                        </Btn>
                        <Modal isOpen={addModal} toggle={closeAddModal} size="xl" centered>
                            <ModalBody>
                                <AddMaterial onClose={closeAddModal} />
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
                                        <Input type="select" className="form-control digits" name="subject" value={selectedSubject} onChange={handleSubjectChange} disabled={!selectedDepartment || !selectedSemester}>
                                            <option value="">All Subjects</option>
                                            {subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.subname}>
                                                        {subject.subname}
                                                    </option>
                                                ))}
                                        </Input>
                                    </Form>
                                </Col>
                            </Row>
                            <br /><br />
                            <div className={`table-responsive ${isMobile ? 'mb-3' : ''}`}>
                                <Table>
                                    <thead>
                                        <tr className='border-bottom-primary'>
                                            <th className='text-center fw-bold' scope='col'>Material Title</th>
                                            <th className='text-center fw-bold' scope='col'>Description</th>
                                            <th className='text-center fw-bold' scope='col'>Department</th>
                                            <th className='text-center fw-bold' scope='col'>Semester</th>
                                            <th className='text-center fw-bold' scope='col'>Subject</th>
                                            <th className='text-center fw-bold' scope='col'>Uploaded By</th>
                                            <th className='text-center fw-bold' scope='col'>Published</th>
                                            <th className='text-center fw-bold' scope='col'>View File</th>
                                            <th className='text-center fw-bold' scope='col'>Action</th>
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
                                        {materials.filter(applySearchFilter).length === 0 && !loadingTableData && (
                                            <tr>
                                                <td colSpan="11" className="text-center"><b>No Data Available</b></td>
                                            </tr>
                                        )}
                                        {materials.filter(applySearchFilter).slice(indexOfFirstItem, indexOfLastItem).map((item) => (
                                            <tr key={item.id} className={`border-bottom-primary`}>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.title}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.description}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.department}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.semester}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.subject}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.faculty}</td>
                                                <td className={`${isMobile ? 'text-center' : 'text-center align-middle'}`}>{item.date}</td>
                                                <td className={`${isMobile ? '' : 'text-center align-middle'}`}>
                                                    <Link to={item.file} target='_blank'>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-success btn-sm", color: "success" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Eye size={16} />
                                                            </div>
                                                        </Btn>
                                                    </Link>
                                                </td>
                                                <td className={`${isMobile ? '' : 'text-center align-middle'}`}>
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-success btn-success", color: "primary", onClick: () => openEditModal(item) }} >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Edit size={16} />
                                                            </div>
                                                        </Btn>
                                                    </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <Modal isOpen={editModal} toggle={closeEditModal} size="xl" centered>
                                                        <ModalBody>
                                                            <EditMaterial material={selectedMaterial} onClose={closeEditModal} />
                                                        </ModalBody>
                                                    </Modal>
                                                    <br />
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-secondary btn-secondary", onClick: () => handleDelete(item._id) }} >
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
                                        {[...Array(Math.ceil(materials.filter(applySearchFilter).length / itemsPerPage))].map((_, i) => (
                                            <PaginationItem key={i} active={i + 1 === currentPage}>
                                                <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem disabled={currentPage === Math.ceil(materials.filter(applySearchFilter).length / itemsPerPage)}>
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

export default Material;