import React, {useState, useEffect} from 'react';
import { Col, Row, Card, CardBody } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { H4 } from '../../../AbstractElements';
import SquareGroupUi from './SquareGroupUi';
import { BookOpen , Bookmark, Mail } from 'react-feather';
import { TableCellsIcon } from '@heroicons/react/24/solid';
import { baseApiURL } from '../../../baseUrl';

const GreetingGrid = () => {
  const [noticeCount, setNoticeCount] = useState(0);
  const [bookCount, setBookCount] = useState(0);
  const [issuedbookCount, setIssuedBookCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/BookCount`);
        setBookCount(response.data.books);
      } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error Counting Books!',
            confirmButtonText: 'OK'
          });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/IssuedBookCount`);
        setIssuedBookCount(response.data.issuedbooks);
      } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error Counting Issued Books!',
            confirmButtonText: 'OK'
          });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/DepartmentCount`);
        setDepartmentCount(response.data.departments);
      } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error Counting Departments!',
            confirmButtonText: 'OK'
          });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/NoticeCount`, {
          params: { 
            type: ['Library Notice Panel', 'Library-Member Notice Panel'] 
          }
        });
        setNoticeCount(response.data.notices);
      } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error Counting Notices!',
            confirmButtonText: 'OK'
          });
      }
    };

    fetchData();
  }, []);


  return (
    <Col xxl="7" xl="10" lg="12" md="12" sm="12" className="mx-auto">
      <Row>
        <Col lg="6" md="6" sm="12">
          <Card className='course-box mb-4'>
            <CardBody>
              <div className='course-widget'>
                <div className='course-icon'>
                  <BookOpen size={16}/>
                </div>
                <div>
                  <H4 attrH4={{ className: 'mb-0' }}>{bookCount}</H4>
                  <span className='f-light'>Books Registered</span>
                </div>
              </div>
            </CardBody>
            <SquareGroupUi />
          </Card>
        </Col>
        <Col lg="6" md="6" sm="12">
          <Card className='course-box mb-4'>
            <CardBody>
              <div className='course-widget'>
                <div className='course-icon warning'>
                  <Bookmark size={16}/>
                </div>
                <div>
                  <H4 attrH4={{ className: 'mb-0' }}>{issuedbookCount}</H4>
                  <span className='f-light'>Issued Books</span>
                </div>
              </div>
            </CardBody>
            <SquareGroupUi />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg="6" md="6" sm="12">
          <Card className='course-box mb-4'>
            <CardBody>
              <div className='course-widget'>
                <div className='course-icon primary'>
                  <TableCellsIcon size={16}/>
                </div>
                <div>
                  <H4 attrH4={{ className: 'mb-0' }}>{departmentCount}</H4>
                  <span className='f-light'>No. of Departments</span>
                </div>
              </div>
            </CardBody>
            <SquareGroupUi />
          </Card>
        </Col>
        <Col lg="6" md="6" sm="12">
          <Card className='course-box mb-4'>
            <CardBody>
              <div className='course-widget'>
                <div className='course-icon warning'>
                  <Mail size={16}/>
                </div>
                <div>
                  <H4 attrH4={{ className: 'mb-0' }}>{noticeCount}</H4>
                  <span className='f-light'>Notices Uploaded</span>
                </div>
              </div>
            </CardBody>
            <SquareGroupUi />
          </Card>
        </Col>
      </Row>
    </Col>
  );
};

export default GreetingGrid;
