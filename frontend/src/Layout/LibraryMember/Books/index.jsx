import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Row, Col, Card, CardHeader, Table, Input, Form, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { H3 } from '../../../AbstractElements';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../redux/authRedux";
import { baseApiURL } from '../../../baseUrl';

const Book = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [selectedStock, setSelectedStock] = useState('');
    const [loadingTableData, setLoadingTableData] = useState(true);
    const [refreshTable, setRefreshTable] = useState(false);

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
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getBookDetails`);
                setTimeout(() => {
                    setBooks(response.data);
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        setCurrentPage(1);
    };

    const handleStockChange = (e) => {
        setSelectedStock(e.target.value);
    };

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const stockFilter = selectedStock === '' || (selectedStock === 'Available' && item.status === 'Available') || (selectedStock === 'Out of Stock' && item.status === 'Out of Stock');

        return (
            item.isbnNo.toLowerCase().includes(searchTerm) ||
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm)
        ) && stockFilter;
    };

    useEffect(() => {
        const loadImage = (item) => {
            const img = new Image();
            img.src = item.bookimg;
            img.onload = () => {
                setBooks((prevBooks) => {
                    return prevBooks.map((book) => {
                        if (book._id === item._id) {
                            return { ...book, imageLoaded: true };
                        }
                        return book;
                    });
                });
            };
        };

        books.forEach((item) => {
            if (!item.imageLoaded) {
                loadImage(item);
            }
        });
    }, [books]);

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);


    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Books Available</H3>
                    </CardHeader>
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <div className='table-responsive'>
                                <br /><br />
                                <Row className='d-flex justify-content-center'>
                                    <Col sm="12" xl="4">
                                        <Form className='theme-form'>
                                            <Input type="select" name="select" className="form-control digits" defaultValue="1" value={selectedStock} onChange={handleStockChange}>
                                                <option value="">All Stocks</option>
                                                <option>{'Available'}</option>
                                                <option>{'Out of Stock'}</option>
                                            </Input>
                                        </Form>
                                    </Col>
                                    <Col sm="12" xl="4">
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
                                            <th className='fw-bold' scope='col'>Book Description</th>
                                            <th className='fw-bold' scope='col'>Author</th>
                                            <th className='fw-bold' scope='col'>Thumbnail</th>
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
                                        {books.filter(applySearchFilter).length === 0 && !loadingTableData && (
                                            <tr>
                                                <td colSpan="11" className="text-center"><b>No Data Available</b></td>
                                            </tr>
                                        )}
                                        {books.filter(applySearchFilter).slice(indexOfFirstItem, indexOfLastItem).map((item) => (
                                            <tr key={item.id} className={`border-bottom-primary`}>
                                                <td>{item.isbnNo}</td>
                                                <td>{item.title}</td>
                                                <td>{item.description}</td>
                                                <td>{item.author}</td>
                                                <td>{item.imageLoaded ? <img src={item.bookimg} width={65} height={65} alt="Thumbnail" style={{ borderRadius: '10px' }} /> : 'Loading...'}</td>
                                                <td>
                                                    {item.status === 'Available' ? (
                                                        <span className="badge badge-light-success" style={{ fontSize: "12px" }}>{item.status}</span>
                                                    ) : (
                                                        <span className="badge badge-light-danger" style={{ fontSize: "12px" }}>{item.status}</span>
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
                                    {[...Array(Math.ceil(books.filter(applySearchFilter).length / itemsPerPage))].map((_, i) => (
                                        <PaginationItem key={i} active={i + 1 === currentPage}>
                                            <PaginationLink onClick={() => handlePageChange(i + 1)}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem disabled={currentPage === Math.ceil(books.filter(applySearchFilter).length / itemsPerPage)}>
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