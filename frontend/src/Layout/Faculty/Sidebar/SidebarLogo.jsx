import React, { useContext, useState, useEffect } from 'react';
import { Menu } from 'react-feather';
import { Link } from 'react-router-dom';
import { Image } from '../../../AbstractElements';
import LogoIcon from '../../../assets/images/logo/svist-logo.png';
import CustomizerContext from '../../../_helper/Customizer';
import axios from 'axios';
import Swal from 'sweetalert2';
import { baseApiURL } from '../../../baseUrl';
import { storage } from '../../../Config/firebaseconfig';
import { ref, getDownloadURL } from 'firebase/storage';

const SidebarLogo = () => {
  const { mixLayout, toggleSidebar, toggleIcon, layout, layoutURL } = useContext(CustomizerContext);
  const [footerData, setFooterData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/getfooterdetails`);
        const firstItem = response.data[0];

        const storageRef = ref(storage, firstItem.logo);
        const imageUrl = await getDownloadURL(storageRef);

        setFooterData({
          logo: imageUrl
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error Fetching Footer Details!',
          confirmButtonText: 'OK',
        });
      }
    };

    fetchData();
  }, []);

  const openCloseSidebar = () => {
    toggleSidebar(!toggleIcon);
  };

  const layout1 = localStorage.getItem("sidebar_layout") || layout;

  return (
    <div className='logo-wrapper'>
      {layout1 !== 'compact-wrapper dark-sidebar' && layout1 !== 'compact-wrapper color-sidebar' && mixLayout ? (
        <Link to={`${process.env.PUBLIC_URL}/admin/dashboard`}>
          <Image attrImage={{ className: 'img-fluid d-inline w-50', src: `${footerData.logo}`, alt: '' }} />
        </Link>
      ) : (
        <Link to={`${process.env.PUBLIC_URL}/admin/dashboard`}>
          <Image attrImage={{ className: 'img-fluid d-inline w-50', src: `${footerData.logo}`, alt: '' }} />
        </Link>
      )}
      <div className='back-btn' onClick={() => openCloseSidebar()}>
        <i className='fa fa-angle-left'></i>
      </div>
      <div className='toggle-sidebar' onClick={openCloseSidebar}>
        <Menu className='status_toggle middle sidebar-toggle' />
      </div>
    </div>
  );
};

export default SidebarLogo;
