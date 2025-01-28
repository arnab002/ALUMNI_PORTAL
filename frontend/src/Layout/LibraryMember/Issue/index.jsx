import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, CardHeader, Table, Input, Form, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { H3 } from '../../../AbstractElements';
import Swal from 'sweetalert2';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../redux/authRedux";
import { baseApiURL } from '../../../baseUrl';

const Book = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [issuedbooks, setIssuedBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedBookStatus, setSelectedBookStatus] = useState('');
    const [loadingTableData, setLoadingTableData] = useState(true);

    useEffect(() => {
        const checkLibraryMemberAuthorization = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/libraryMemberRoutes`, {
                    withCredentials: true,
                });

                const data = response.data;

                if (data.authenticated) {
                    dispatch(setAuthenticated(true));
                    window.history.pushState(null, null, window.location.pathname);
                } else {
                    navigate(`${process.env.PUBLIC_URL}/libraryMemberlogin`, { replace: true });
                }

            } catch (error) {
                navigate(`${process.env.PUBLIC_URL}/libraryMemberlogin`, { replace: true });
            }
        };

        checkLibraryMemberAuthorization();

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

            } catch (error) {
                console.log();
            }
        };

        fetchUserDetails();
    }, [name, email]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${baseApiURL()}/getFilteredIssueBookDetails`, {
                    fullName: name,
                    email: email
                });
                setTimeout(() => {
                    setIssuedBooks(response.data.issuebook);
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

        if (name && email) {
            fetchData();
        }
    }, [name, email]);


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

    const handleBookStatusChange = (e) => {
        setSelectedBookStatus(e.target.value);
    };

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const semesterFilter = selectedSemester === '' || (item.semester && item.semester.toLowerCase() === selectedSemester.toLowerCase());
        const bookStatusFilter = selectedBookStatus === '' || (selectedBookStatus === 'Issued' && item.status === 'Issued') || (selectedBookStatus === 'Delayed' && item.status === 'Delayed') || (selectedBookStatus === 'Returned' && item.status === 'Returned');

        return (
            (item.isbnNo && item.isbnNo.toString().toLowerCase().includes(searchTerm)) ||
            (item.book && item.book.toLowerCase().includes(searchTerm)) ||
            ((item.enrollmentNo && item.enrollmentNo.toString().toLowerCase().includes(searchTerm)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchTerm))
            )) && semesterFilter && bookStatusFilter;
    };

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Book Issue-Return List</H3>
                    </CardHeader>
                    <br />
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <div className='table-responsive'>
                                <br />
                                <Row className='d-flex justify-content-center'>
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
                                    <Col sm="12" xl="3">
                                        <Form className='theme-form'>
                                            <Input type="search" name="select" className="form-control digits" placeholder='Search Books....' value={searchValue} onChange={handleSearchChange} />
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
                                            <th className='fw-bold' scope='col'>Department</th>
                                            <th className='fw-bold' scope='col'>Semester</th>
                                            <th className='fw-bold' scope='col'>Issued</th>
                                            <th className='fw-bold' scope='col'>Due Date</th>
                                            <th className='fw-bold' scope='col'>Returned</th>
                                            <th className='fw-bold' scope='col'>Status</th>
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
                                                <td>{item.department}</td>
                                                <td>{item.semester}</td>
                                                <td>{item.issued}</td>
                                                <td>{item.due}</td>
                                                <td>{item.returnDate}</td>
                                                <td>
                                                    {item.status === 'Issued' || item.status === 'Returned' ? (
                                                        <span className="badge badge-light-success" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    ) : (
                                                        <span className="badge badge-light-warning" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    )}
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