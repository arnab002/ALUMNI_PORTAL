import React, { Fragment, useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import { H5, P } from '../../../AbstractElements';
import axios from 'axios';
import { 
  X, Mail, Phone, User, Users, Hash, 
  Calendar, MapPin, Award, Briefcase 
} from 'react-feather';
import { baseApiURL } from '../../../baseUrl';
import Swal from 'sweetalert2';
import styled from 'styled-components';

const COLORS = {
  primary: '#2c3e50',
  accent: '#3498db',
  accentLight: '#e8f4fc',
  success: '#2ecc71',
  border: '#e9ecef',
  text: {
    primary: '#2c3e50',
    secondary: '#606f7b'
  }
};

const ProfileCard = styled(Card)`
  box-shadow: 0 2px 10px rgba(44, 62, 80, 0.08);
  border: none;
  border-radius: 12px;
  background: white;
  overflow: hidden;
`;

const StyledCardHeader = styled(CardHeader)`
  background: ${COLORS.primary};
  padding: 1rem 1.5rem;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled(H5)`
  color: white;
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 4px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const ProfileLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  padding: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  text-align: center;
`;

const ProfileImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 3px 10px rgba(44, 62, 80, 0.1);
  margin-bottom: 16px;
`;

const StudentName = styled(H5)`
  font-size: 1.25rem;
  margin: 8px 0;
  color: ${COLORS.text.primary};
`;

const DepartmentBadge = styled.div`
  background: ${COLORS.accentLight};
  color: ${COLORS.accent};
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.813rem;
  display: inline-block;
  margin-top: 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
`;

const InfoCard = styled.div`
  background: #fff;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${COLORS.accent};
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.05);
  }
`;

const IconWrapper = styled.div`
  background: ${COLORS.accentLight};
  color: ${COLORS.accent};
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  color: ${COLORS.text.secondary};
  font-size: 0.75rem;
  margin-bottom: 2px;
`;

const InfoValue = styled.div`
  color: ${COLORS.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const ViewProfile = ({ student, onClose }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/getSingleStudentDetails/${student._id}`);
        setStudentData(response.data);
        setLoading(false);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to fetch student details'
        });
        setLoading(false);
      }
    };

    if (student?._id) {
      fetchStudentDetails();
    }
  }, [student?._id]);

  const InfoBlock = ({ icon: Icon, label, value }) => (
    <InfoCard>
      <IconWrapper>
        <Icon size={16} />
      </IconWrapper>
      <InfoContent>
        <InfoLabel>{label}</InfoLabel>
        <InfoValue>{value || 'Not provided'}</InfoValue>
      </InfoContent>
    </InfoCard>
  );

  if (loading) {
    return (
      <ProfileCard>
        <CardBody className="d-flex justify-content-center align-items-center min-h-[300px]">
          <div className="text-center">
            <Spinner color="primary" className="h-8 w-8" />
            <P className="mt-3 text-muted">Loading...</P>
          </div>
        </CardBody>
      </ProfileCard>
    );
  }

  if (!studentData) {
    return (
      <ProfileCard>
        <CardBody className="text-center py-5">
          <User size={32} className="text-muted mb-3" />
          <H5>No student data available</H5>
        </CardBody>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard>
      <StyledCardHeader>
        <HeaderTitle>
          <Award size={20} />
          Student Profile
        </HeaderTitle>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>
      </StyledCardHeader>

      <CardBody>
        <ProfileLayout>
          <ProfileSidebar>
            <ProfileImage
              src={studentData.profile}
              alt={studentData.fullName}
              onError={(e) => {
                e.target.src = '/assets/images/default-profile.png';
              }}
            />
            <StudentName>{studentData.fullName}</StudentName>
            <DepartmentBadge>{studentData.department}</DepartmentBadge>
          </ProfileSidebar>

          <InfoGrid>
            <InfoBlock
              icon={Hash}
              label="Enrollment Number"
              value={studentData.enrollmentNo}
            />
            <InfoBlock
              icon={Mail}
              label="Email Address"
              value={studentData.email}
            />
            <InfoBlock
              icon={Phone}
              label="Phone Number"
              value={studentData.phoneNo}
            />
            <InfoBlock
              icon={Users}
              label="Guardian Name"
              value={studentData.guardianName}
            />
            <InfoBlock
              icon={MapPin}
              label="Address"
              value={studentData.address}
            />
            <InfoBlock
              icon={Calendar}
              label="Current Semester"
              value={`${studentData.semester}`}
            />
            <InfoBlock
              icon={Briefcase}
              label="Department"
              value={studentData.department}
            />
            <InfoBlock
              icon={User}
              label="Gender"
              value={studentData.gender}
            />
          </InfoGrid>
        </ProfileLayout>
      </CardBody>
    </ProfileCard>
  );
};

export default ViewProfile;