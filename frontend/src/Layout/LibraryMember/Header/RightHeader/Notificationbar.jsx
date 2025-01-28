import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import SvgIcon from '../../../../CommonElements/SvgIcon';
import { baseApiURL } from '../../../../baseUrl';

const Notificationbar = () => {
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const socket = io(`${baseApiURL()}`);

    // Load recent notifications
    socket.on('load-notifications', (data) => {
      setNotifications(data);
      setBadgeCount(data.length);
    });

    // Listen for new notifications
    socket.on('new-notice', (data) => {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
      setBadgeCount((prevCount) => prevCount + 1);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <li className='onhover-dropdown'>
      <div className='notification-box' onClick={() => setNotificationDropDown(!notificationDropDown)}>
        <SvgIcon iconId='notification' />
        <span className='badge rounded-pill badge-secondary'>{badgeCount}</span>
      </div>
      <div className={`notification-dropdown onhover-show-div ${notificationDropDown ? 'active' : ''}`}>
        <h6 className='f-18 mb-0 dropdown-title'>Notifications</h6>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} className={`b-l-${notification.type} border-4`}>
              <p>
                {notification.title} - {notification.message} <span className={`font-${notification.type}`}>{notification.status}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default Notificationbar;
