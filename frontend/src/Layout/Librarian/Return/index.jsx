import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, CardHeader, Table, Form, Input, InputGroup, InputGroupText, Pagination, PaginationItem, PaginationLink, Media, Label } from "reactstrap";
import Swal from 'sweetalert2';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../redux/authRedux";
import { H3 } from '../../../AbstractElements';
import { baseApiURL } from '../../../baseUrl';

const Book = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [issuedbooks, setIssuedBooks] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedBookStatus, setSelectedBookStatus] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [loadingTableData, setLoadingTableData] = useState(true);

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
    }, []);

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

    const handleReturnToggle = async (bookId) => {
        try {
            const returnDateValue = new Date().toLocaleDateString('en-GB');
            const response = await axios.post(`${baseApiURL()}/updateBookStatus/${bookId}`, { status: 'Returned', returnDate: returnDateValue });
            const updatedBooks = issuedbooks.map(book => {
                if (book._id === bookId) {
                    return { ...book, status: 'Returned', returnDate: returnDateValue };
                }
                return book;
            });
            setIssuedBooks(updatedBooks);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Book Returned Successfully!',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Returning Book!',
                confirmButtonText: 'OK'
            });
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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

    useEffect(() => {
        const timer = setInterval(() => {
            const currentDate = new Date();
            const formattedCurrentDate = formatDate(currentDate);
            const updatedBooks = issuedbooks.map(book => {
                if (book.status === 'Issued' && isDueDateExceeded(book.due, formattedCurrentDate)) {
                    handleDelayToggle(book._id);
                    return { ...book, status: 'Delayed' };
                }
                return book;
            });
            setIssuedBooks(updatedBooks);
        }, 120000);

        return () => clearInterval(timer);
    }, [issuedbooks]);

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const isDueDateExceeded = (dueDate, currentDate) => {
        const [dueDay, dueMonth, dueYear] = dueDate.split('/').map(Number);
        const [currentDay, currentMonth, currentYear] = currentDate.split('/').map(Number);

        if (currentYear > dueYear) {
            return true;
        } else if (currentYear === dueYear) {
            if (currentMonth > dueMonth) {
                return true;
            } else if (currentMonth === dueMonth) {
                if (currentDay > dueDay) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleDelayToggle = async (bookId) => {
        try {
            const response = await axios.post(`${baseApiURL()}/updateBookStatus/${bookId}`, { status: 'Delayed' });
        } catch (error) {
            console.log();
        }
    };

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Return List</H3>
                    </CardHeader>
                    <br /><br />
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
                                            <th className='fw-bold' scope='col'>Due Date</th>
                                            <th className='fw-bold' scope='col'>Return</th>
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
                                                <td>{item.due}</td>
                                                <td>{item.returnDate}</td>
                                                <td>
                                                    {item.status === 'Issued' || item.status === 'Returned' ? (
                                                        <span className="badge badge-light-success" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    ) : (
                                                        <span className="badge badge-light-warning" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Media className="text-end icon-state">
                                                        <Label className="switch-success">
                                                            <Input
                                                                type="checkbox"
                                                                name='return'
                                                                checked={item.status === 'Returned'}
                                                                onChange={() => {
                                                                    handleReturnToggle(item._id);
                                                                }}
                                                            />
                                                            <span className="switch-success-state"></span>
                                                        </Label>
                                                    </Media>
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
    );
}

export default Book;