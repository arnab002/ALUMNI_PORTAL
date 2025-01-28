import React, { Fragment, useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Trash2 } from 'react-feather';
import { Row, Col, Card, CardHeader, Table, Form, Modal, ModalBody, Input, InputGroup, InputGroupText, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Btn, H3 } from '../../../AbstractElements';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../redux/authRedux";
import AddIssue from './AddIssue';
import { baseApiURL } from '../../../baseUrl';

const Book = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [addModal, setAddModal] = useState(false);
    const [issuedbooks, setIssuedBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedBookStatus, setSelectedBookStatus] = useState('');
    const [itemsPerPage] = useState(7);
    const [loadingTableData, setLoadingTableData] = useState(true);
    const [refreshTable, setRefreshTable] = useState(false);

    useEffect(() => {
        const checkLibraryAdminAuthorization = async () => {
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

        checkLibraryAdminAuthorization();

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
                const response = await axios.get(`${baseApiURL()}/getIssueBookDetails`);
                setTimeout(() => {
                    setIssuedBooks(response.data);
                    setLoadingTableData(false);
                }, 1000);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Issued Book Details!',
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (issuebookId) => {
        try {
            const confirmed = await confirmDelete();
            if (confirmed) {
                const response = await axios.post(`${baseApiURL()}/deleteIssueBookDetails/${issuebookId}`);
                setIssuedBooks((prevIssueBooks) => prevIssueBooks.filter((issuebook) => issuebook._id !== issuebookId));

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Book Issued has been successfully removed',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Removing Book Issued!',
                confirmButtonText: 'OK'
            });
        }
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover it!',
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

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleBookStatusChange = (e) => {
        setSelectedBookStatus(e.target.value);
    };

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const departmentFilter = selectedDepartment === '' || item.department.toLowerCase() === selectedDepartment.toLowerCase();
        const semesterFilter = selectedSemester === '' || (item.semester && item.semester.toLowerCase() === selectedSemester.toLowerCase());
        const bookStatusFilter = selectedBookStatus === '' || (selectedBookStatus === 'Issued' && item.status === 'Issued') || (selectedBookStatus === 'Delayed' && item.status === 'Delayed') || (selectedBookStatus === 'Returned' && item.status === 'Returned');

        return (
            (item.isbnNo && item.isbnNo.toString().toLowerCase().includes(searchTerm)) ||
            (item.book && item.book.toLowerCase().includes(searchTerm)) ||
            ((item.enrollmentNo && item.enrollmentNo.toString().toLowerCase().includes(searchTerm)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchTerm))
            )) && departmentFilter && semesterFilter && bookStatusFilter;
    };


    const openAddModal = () => {
        setAddModal(true);
    };

    const closeAddModal = () => {
        setAddModal(false);
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
                        <H3>Issue List</H3>
                        <span>&nbsp;</span>
                        <Btn attrBtn={{ color: 'primary d-flex align-items-center', className: "btn btn-air-primary", onClick: openAddModal }}>
                            <Plus style={{ width: '18px', height: '18px' }} className='me-2' /> Add New Issue
                        </Btn>
                        <Modal isOpen={addModal} toggle={closeAddModal} size="xl" centered>
                            <ModalBody>
                                <AddIssue onClose={closeAddModal} />
                            </ModalBody>
                        </Modal>
                    </CardHeader>
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <div className='table-responsive'>
                                <Row className='d-flex justify-content-center'>
                                    <Col sm="12" xl="6">
                                        <InputGroup>
                                            <InputGroupText>
                                                <i className="fa fa-search"></i>
                                            </InputGroupText>
                                            <Input
                                                style={{ border: '1px solid #343a40' }}
                                                type="text"
                                                name="subname"
                                                placeholder="Search Anything"
                                                onChange={handleSearchChange}
                                                value={searchValue}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>
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
                                            <Input type="select" name="select" className="form-control digits" defaultValue="1" value={selectedBookStatus} onChange={handleBookStatusChange}>
                                                <option value="">All Book Status</option>
                                                <option>{'Issued'}</option>
                                                <option>{'Delayed'}</option>
                                                <option>{'Returned'}</option>
                                            </Input>
                                        </Form>
                                    </Col>
                                </Row>
                                <br /><br />
                                <Table>
                                    <thead>
                                        <tr className='border-bottom-primary'>
                                            <th className='fw-bold' scope='col'>ISBN No.</th>
                                            <th className='fw-bold' scope='col'>Book Name</th>
                                            <th className='fw-bold' scope='col'>Enrollment No.</th>
                                            <th className='fw-bold' scope='col'>Student Name</th>
                                            <th className='fw-bold' scope='col'>Department</th>
                                            <th className='fw-bold' scope='col'>Semester</th>
                                            <th className='fw-bold' scope='col'>Issued</th>
                                            <th className='fw-bold' scope='col'>Due Date</th>
                                            <th className='fw-bold' scope='col'>Status</th>
                                            <th className='fw-bold' scope='col'>Action</th>
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
                                        {issuedbooks.filter(applySearchFilter).length === 0 && !loadingTableData && (
                                            <tr>
                                                <td colSpan="11" className="text-center"><b>No Data Available</b></td>
                                            </tr>
                                        )}
                                        {issuedbooks.filter(applySearchFilter).slice(indexOfFirstItem, indexOfLastItem).map((item) => (
                                            <tr key={item.id} className={`border-bottom-primary`}>
                                                <td>{item.isbnNo}</td>
                                                <td>{item.book}</td>
                                                <td>{item.enrollmentNo}</td>
                                                <td>{item.fullName}</td>
                                                <td>{item.department}</td>
                                                <td>{item.semester}</td>
                                                <td>{item.issued}</td>
                                                <td>{item.due}</td>
                                                <td>
                                                    {item.status === 'Issued' || item.status === 'Returned' ? (
                                                        <span className="badge badge-light-success" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    ) : (
                                                        <span className="badge badge-light-warning" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    )}
                                                </td>
                                                <td>
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
                            </div>
                            <div className="d-flex justify-content-center">
                                <Pagination>
                                    <PaginationItem disabled={currentPage === 1}>
                                        <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
                                    </PaginationItem>
                                    {[...Array(Math.ceil(issuedbooks.filter(applySearchFilter).length / itemsPerPage))].map((_, i) => (
                                        <PaginationItem key={i} active={i + 1 === currentPage}>
                                            <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem disabled={currentPage === Math.ceil(issuedbooks.filter(applySearchFilter).length / itemsPerPage)}>
                                        <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
                                    </PaginationItem>
                                </Pagination>
                            </div>
                        </Col>
                    </div>
                </Card>
            </Col>
        </Fragment>
    )
}

export default Book;