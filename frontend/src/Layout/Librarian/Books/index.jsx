import React, { Fragment, useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Edit } from 'react-feather';
import { Trash2 } from 'react-feather';
import { Row, Col, Card, CardHeader, Table, Form, Modal, ModalBody, Input, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Btn, H3 } from '../../../AbstractElements';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../../../redux/authRedux";
import AddBook from './AddBook';
import EditBook from './EditBook';
import { baseApiURL } from '../../../baseUrl';

const Book = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [books, setBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedStock, setSelectedStock] = useState('');
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

    const handleDelete = async (bookId) => {
        try {
            const confirmed = await confirmDelete();
            if (confirmed) {
                const response = await axios.post(`${baseApiURL()}/deleteBookDetails/${bookId}`);
                setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Book Details has been successfully deleted.',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Deleting Book Details!',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleStatusChange = async (bookId, newStatus) => {
        try {
            const response = await axios.post(`${baseApiURL()}/updateBookStockStatus/${bookId}`, { status: newStatus });
            setBooks((prevBooks) =>
                prevBooks.map((book) => (book._id === bookId ? { ...book, status: newStatus } : book))
            );

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Book Stock status has been updated successfully.',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error updating book status!',
                confirmButtonText: 'OK'
            });
        }
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Book Details!',
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

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleStockChange = (e) => {
        setSelectedStock(e.target.value);
    };

    const applySearchFilter = (item) => {
        const searchTerm = searchValue.toLowerCase();
        const departmentFilter = selectedDepartment === '' || item.department.toLowerCase() === selectedDepartment.toLowerCase();
        const stockFilter = selectedStock === '' || (selectedStock === 'Available' && item.status === 'Available') || (selectedStock === 'Out of Stock' && item.status === 'Out of Stock');
    
        return (
            item.isbnNo.toLowerCase().includes(searchTerm) ||
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm)
        ) && departmentFilter && stockFilter;
    };

    const openAddModal = () => {
        setAddModal(true);
    };

    const closeAddModal = () => {
        setAddModal(false);
        setRefreshTable(true);
    };

    const openEditModal = (book) => {
        setSelectedBook(book);
        setEditModal(true);
    };

    const closeEditModal = () => {
        setSelectedBook(null);
        setEditModal(false);
        setRefreshTable(true);
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
                        <H3>Book List</H3>
                        <span>&nbsp;</span>
                        <Btn attrBtn={{ color: 'primary d-flex align-items-center', className: "btn btn-air-primary", onClick: openAddModal }}>
                            <Plus style={{ width: '18px', height: '18px' }} className='me-2' /> Add New Book
                        </Btn>
                        <Modal isOpen={addModal} toggle={closeAddModal} size="xl" centered>
                            <ModalBody>
                                <AddBook onClose={closeAddModal} />
                            </ModalBody>
                        </Modal>
                    </CardHeader>
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <div className='table-responsive'>
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
                                            <Input type="select" name="select" className="form-control digits" defaultValue="1" value={selectedStock} onChange={handleStockChange}>
                                                <option value="">All Stocks</option>
                                                <option>{'Available'}</option>
                                                <option>{'Out of Stock'}</option>
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
                                            <th className='fw-bold' scope='col'>Book Description</th>
                                            <th className='fw-bold' scope='col'>Department</th>
                                            <th className='fw-bold' scope='col'>Author</th>
                                            <th className='fw-bold' scope='col'>Thumbnail</th>
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
                                                <td>{item.department}</td>
                                                <td>{item.author}</td>
                                                <td>{item.imageLoaded ? <img src={item.bookimg} width={65} height={65} alt="Thumbnail" style={{ borderRadius: '10px' }} /> : 'Loading...'}</td>
                                                <td>
                                                    {item.status === 'Available' ? (
                                                        <span className="badge badge-light-success" style={{ fontSize: "12px", cursor: 'pointer' }} onClick={() => handleStatusChange(item._id, 'Out of Stock')}>
                                                            {item.status}
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-light-danger" style={{ fontSize: "12px", cursor: 'pointer' }} onClick={() => handleStatusChange(item._id, 'Available')}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span>
                                                        <Btn attrBtn={{ className: "btn btn-pill btn-air-success btn-success", color: "primary", onClick: () => openEditModal(item) }} >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Edit size={16} />
                                                            </div>
                                                        </Btn>
                                                    </span>&nbsp;&nbsp;&nbsp;
                                                    <Modal isOpen={editModal} toggle={closeEditModal} size="xl" centered>
                                                        <ModalBody>
                                                            <EditBook book={selectedBook} onClose={closeEditModal} />
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