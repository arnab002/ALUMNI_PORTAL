import React, { Fragment, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Loader = (props) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [show]);

  useEffect(() => {
    if (show) {
      Swal.fire({
        title: '<strong>Please Wait....</strong>',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          Swal.hideLoading();
        },
        showConfirmButton: false,
      });
    } else {
      Swal.close();
    }
  }, [show]);

  return (
    <Fragment>
      {show && (
        <div className="loader-wrapper">
          <div className="loader">
            <div id="swal-loading" />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Loader;