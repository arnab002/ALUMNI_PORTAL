import React, { useState, useEffect } from 'react'
import { ref, getDownloadURL } from 'firebase/storage';
import axios from "axios"
import Swal from 'sweetalert2';
import { baseApiURL } from '../../baseUrl';
import { storage } from '../../Config/firebaseconfig'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Achievements() {
  const [AchievementData, setAchievementData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/getAchievementDetails`);
        const AchievementDetails = response.data.map(async (item) => {
          const storageRef = ref(storage, item.image);
          const imageUrl = await getDownloadURL(storageRef);
          return {
            title: item.title,
            description: item.description,
            image: imageUrl
          };
        });

        Promise.all(AchievementDetails).then((Achievements) => {
          setAchievementData(Achievements);
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error Fetching Details!',
          confirmButtonText: 'OK',
        });
      }
    };

    fetchData();
  }, []);

  const settings = {
    dots: true,
    infinite: AchievementData.length > 1, // Set infinite to false if there's only one item
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const imageStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%',
    height: 'auto',
  };

  return (
    <div>
      <section className="testimonial pt_110 xs_pt_75 pb_115 xs_pb_75" id='achievements' style={{ backgroundImage: `url(${require('../../images/testimonial_bg.jpg')})` }}>
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-md-9 col-lg-7">
              <div className="section_heading mb_60">
                <h2>Our Achievements</h2>
              </div>
            </div>
          </div>
          <div className="row" style={{ display: 'flex', flexDirection: "row" }}>
            <Slider {...settings}>
              {AchievementData.map((Achievement, index) => (
                <div key={index} className="col-xl-6 wow fadeInUp" data-wow-duration="1s">
                  <div className="single_testimonial" style={{ marginRight: '15px' }}>
                    <div className="img">
                      <img src={Achievement.image} alt="testimonial" style={imageStyle} />
                    </div>
                    <h4>{Achievement.title}</h4>
                    <p className="description">{Achievement.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Achievements
