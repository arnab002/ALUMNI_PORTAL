import React, {useState, useEffect} from 'react';
import { Card, CardBody } from 'reactstrap';
import axios from 'axios';
import { H4, Image, P } from '../../../AbstractElements';
import { baseApiURL } from '../../../baseUrl';
import welcome from '../../../assets/images/dashboard-3/widget.svg';

const GreetingCard = () => {
  const [name, setName] = useState();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/checkauthentication`, {
          withCredentials: true,
        });

        const data = response.data.user;
        setName(data.name);

      } catch (error) {
          console.log();
      }
    };

    fetchUserDetails();
  }, [name]);

  return (
    <Card className='o-hidden welcome-card'>
      <CardBody className='d-flex flex-column align-items-center align-items-md-start'>
        <H4 attrH4={{ className: 'mb-3 mt-1 f-w-500 f-22 text-center text-md-left' }}>
          Hello, {name}
        </H4>
        <P>Welcome to SVIST LIbrary Management System</P>
      </CardBody>
      <div className="text-center mt-auto mb-4">
        <Image attrImage={{ className: 'welcome-img img-fluid', src: welcome, alt: 'welcome image' }} />
      </div>
    </Card>
  );
};

export default GreetingCard;
