import React, { Fragment , useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import axios from 'axios';
import { Col, Card, CardHeader, Table, Modal, ModalBody } from "reactstrap";
import { Btn, H3 } from '../../../../../AbstractElements';
import { baseApiURL } from '../../../../../baseUrl';
import { Edit } from 'react-feather';
import { Trash2 } from 'react-feather';
import AddAchievement from "./AddAchievement";
import EditAchievement from "./EditAchievement";
import Swal from 'sweetalert2';


const Achievement = () => {
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [AchievementData , setAchievementData] = useState([]);
    const [loadingTableData, setLoadingTableData] = useState(true);
    const [refreshTable, setRefreshTable] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${baseApiURL()}/getAchievementDetails`);
            setTimeout(() => {
                setAchievementData(response.data);
                setLoadingTableData(false);
            }, 1000);
          } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Achievement Details!',
                    confirmButtonText: 'OK'
                });
          }
        };
    
        fetchData();
    }, [refreshTable]);

    const handleDelete = async (AchievementId) => {
        try {
            const confirmed = await confirmDelete();
            if(confirmed){
                const response = await axios.post(`${baseApiURL()}/deleteAchievementdetails/${AchievementId}`);
                setAchievementData((prevAchievements) => prevAchievements.filter((Achievement) => Achievement._id !== AchievementId));

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Achievement has been successfully deleted.',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error Deleting Achievement Item!',
                confirmButtonText: 'OK'
            });
        }
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Item Data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        return result.isConfirmed;
    };

    const openAddModal = () => {
        setAddModal(true);
    };

    const closeAddModal = () => {
        setAddModal(false);
        setRefreshTable(true);
    };

    const openEditModal = (Achievement) => {
        setSelectedAchievement(Achievement);
        setEditModal(true);
    };

    const closeEditModal = () => {
        setSelectedAchievement(null);
        setRefreshTable(true);
        setEditModal(false);
    };

    useEffect(() => {
        setRefreshTable(false);
    }, [refreshTable]);

    useEffect(() => {
        const loadImage = (item) => {
            const img = new Image();
            img.src = item.image;
            img.onload = () => {
                setAchievementData((prevAchievements) => {
                    return prevAchievements.map((Achievement) => {
                        if (Achievement._id === item._id) {
                            return { ...Achievement, imageLoaded: true };
                        }
                        return Achievement;
                    });
                });
            };
        };

        AchievementData.forEach((item) => {
            if (!item.imageLoaded) {
                loadImage(item);
            }
        });
    }, [AchievementData]);

    return (
        <Fragment>
            <span>&nbsp;</span>
            <Col sm="12">
                <Card>
                    <CardHeader>
                        <H3>Achievements List</H3>
                        <span>&nbsp;</span>
                        <Btn attrBtn={{ color: 'primary d-flex align-items-center', onClick: openAddModal}}>
                            <Plus style={{ width: '18px', height: '18px' }} className='me-2' /> Add New Achievement
                        </Btn>
                        <Modal isOpen={addModal} toggle={closeAddModal} size="xl" centered>
                            <ModalBody>
                                <AddAchievement onClose={closeAddModal} />
                            </ModalBody>
                        </Modal>
                    </CardHeader>
                    <div className="card-block row">
                        <Col sm="12" lg="12" xl="12">
                            <div className="table-responsive">
                                <Table className='table-light'>
                                    <thead>
                                        <tr>
                                            <th scope="col">Title</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Thumbnail</th>
                                            <th scope="col">Action</th>
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
                                        {AchievementData.length === 0 && !loadingTableData && (
                                            <tr>
                                                <td colSpan="11" className="text-center"><b>No Data Available</b></td>
                                            </tr>
                                        )}
                                        {AchievementData && AchievementData.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.title}</td>
                                                <td>{item.description}</td>
                                                <td>{item.imageLoaded ? <img src={item.image} width={90} height={70} alt="Thumbnail" style={{borderRadius: '10px'}}/> : 'Loading...'}</td>
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
                                                            <EditAchievement achievement={selectedAchievement} onClose={closeEditModal} />
                                                        </ModalBody>
                                                    </Modal>
                                                    <br /><br />
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
                        </Col>
                    </div>
                </Card>
            </Col>
        </Fragment>
    )
}

export default Achievement;