import React, { Fragment , useState , useEffect } from 'react';
import { H5, Btn , Image} from '../../../../../AbstractElements';
import Files from 'react-files';
import { Container, Row, Col, Card, CardBody, Form , FormGroup, Label, Input} from 'reactstrap';
import axios from 'axios';
import { baseApiURL } from '../../../../../baseUrl';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../Config/firebaseconfig';
import Swal from 'sweetalert2';

const AddAchievement = ({onClose}) => {
    const [uploadedFile, setUploadedFile] = useState([]);
    const [AchievementData, setAchievementData] = useState({
        title: '',
        description: '',
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(true);

    const onFilesChange = (files) => {
        setUploadedFile(files);
    };

    const onFilesError = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error Uploading File!',
        confirmButtonText: 'OK'
      });
    };

    const deleteFile = () => {
        setUploadedFile([]);
    };

    useEffect(() => {
        if (AchievementData.image) {

          const formData = new FormData();
          Object.entries(AchievementData).forEach(([key, value]) => {
            formData.append(key, value);
          });

          axios.post(`${baseApiURL()}/addAchievementdetails`, formData, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then(response => {

              setAchievementData({
                title: '',
                description: '',
                image: ''
              });
    
              setUploadedFile([]);

              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Achievement added successfully.',
                confirmButtonText: 'OK'
              }).then((result) => {
                if (result.isConfirmed) {
                  setIsFormOpen(false);
                  onClose();
                }
              }); 
            })
            .catch(error => {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Adding Achievement!',
                confirmButtonText: 'OK'
              });
            });
        }
    }, [AchievementData.image]);


    const handleAddAchievement = async (e) => {
        e.preventDefault();
    
        try {
          if (uploadedFile.length === 0) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Uploading File!',
                confirmButtonText: 'OK'
              });
            return;
          }

          setLoading(true);
          Swal.showLoading();
    
          const file = uploadedFile[0];
          const fileName = `${Date.now()}_${file.name}`;
          const storageRef = ref(storage, `achievement/${fileName}`);
          await uploadBytes(storageRef, file);
    
          const fileDownloadURL = await getDownloadURL(storageRef);
    
          setAchievementData((prevData) => ({
            ...prevData,
            image: fileDownloadURL,
          }));
    
          setUploadedFile([]);
        } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error Adding Achievement',
              confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

  return (
    <Fragment>
      <span>&nbsp;</span>
      {isFormOpen && (
        <Container fluid={true}>
            <Row>
                <Col sm='12'>
                    <Card>
                    <H5>Add Achievement</H5>
                    <CardBody>
                        <Form className='theme-form' onSubmit={handleAddAchievement}>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Input className="form-control" type="text" placeholder="Achievement Title" name="Achievement Name" value={AchievementData.title} onChange={(e) => setAchievementData({...AchievementData, title: e.target.value})} required autoFocus/>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <textarea className='form-control' name='description' rows='3' placeholder='Achievement Description' style={{resize:'none'}} value={AchievementData.description} onChange={(e) => setAchievementData({...AchievementData, description: e.target.value})} required autoFocus/>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <br />
                            <Row>
                              <Col className='d-flex justify-content-center align-items-center'>
                                <FormGroup className='d-flex justify-content-center align-items-center border border-black' style={{ width: '100%', height: '100%', borderRadius: '10px' }}>
                                  <CardBody className="fileUploader">
                                    <Files
                                      className='files-dropzone fileContainer'
                                      onChange={onFilesChange}
                                      onError={onFilesError}
                                      accepts={['image/*']}
                                      multiple={false}
                                      maxFileSize={10000000}
                                      minFileSize={0}
                                      clickable
                                    >
                                      {uploadedFile.length > 0 ? (
                                        <div className='files-gallery'>
                                          {uploadedFile.map((file, index) => (
                                            <div key={index}>
                                              <Image attrImage={{ className: 'files-gallery-item', alt: 'img', src: `${file.preview.url}` }} />
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="d-flex flex-column align-items-center">
                                          <Btn attrBtn={{ className: 'mt-2', type: 'button', color: 'primary' }}>Upload New Image</Btn>
                                          <small className="text-muted mt-2">Accepted file types: Images</small>
                                        </div>
                                      )}
                                    </Files>
                                    {uploadedFile.length > 0 && (
                                      <div className="d-flex justify-content-center mt-3">
                                        <Btn attrBtn={{ className: 'mr-2', color: 'danger', type: 'button', onClick: deleteFile }}>Delete</Btn>
                                      </div>
                                    )}
                                  </CardBody>
                                </FormGroup>
                              </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col>
                                    <div className='text-end'>
                                        <Btn attrBtn={{ color: 'primary', className: 'me-3' }} type="submit" disabled={loading}>
                                            {loading ? 'Please Wait...' : 'Submit'}
                                        </Btn>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
      )}
    </Fragment>
  )
}

export default AddAchievement