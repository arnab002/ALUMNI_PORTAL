import React, { useState, useEffect } from 'react'
import SwiperCore from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import axios from "axios"
import Swal from 'sweetalert2';
import PDFImg from "../images/pdf.png";
import New from "../images/new.gif";
import { baseApiURL } from '../baseUrl';
import Header from "./components/Header"
import Footer from "./components/Footer"
import About from "./components/About"
import Events from './components/Events';
import Testimonials from "./components/Testimonials"
import Achievements from './components/Achievements';
import Courses from "./components/Courses"
import Contact from "./components/Contact"

SwiperCore.use([Navigation, Pagination, Autoplay]);

function Index() {
    const [bannerData, setBannerData] = useState([]);
    const [noticeData, setNoticeData] = useState([]);
    const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getnewnoticedetails`, {
                    params: {
                        lastFetchedTimestamp: lastFetchedTimestamp,
                        type: 'Front-End Notice Panel',
                    },
                });

                setNoticeData((prevNotices) => {
                    const updatedNotices = [...prevNotices, ...response.data];

                    updatedNotices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    const latestNotices = updatedNotices.slice(0, 20);

                    if (latestNotices.length > 0) {
                        const latestTimestamp = Math.max(...latestNotices.map((notice) => new Date(notice.timestamp)));
                        setLastFetchedTimestamp(latestTimestamp);
                    }

                    return latestNotices;
                });
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [lastFetchedTimestamp]);

    const isRecentlyUpdated = (timestamp) => {
        const now = new Date();
        const noticeDate = new Date(timestamp);
        const timeDifference = now - noticeDate;
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        const isNew = hoursDifference <= 24;
        const removeBadgeAfterDays = 7;
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        const shouldRemoveBadge = daysDifference > removeBadgeAfterDays;

        return isNew && !shouldRemoveBadge;
    };

    const isPdfFile = (fileUrl) => {
        const fileExtension = fileUrl.split('?')[0].split('/').pop().split('.').pop().toLowerCase();
        return fileExtension === 'pdf';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseApiURL()}/getbannerdetails`);
                setBannerData(response.data);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error Fetching Banners!',
                    confirmButtonText: 'OK',
                });
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <Header />
            <div className="row">
                <div className="col-xl-8 col-lg-8">
                    <section className="banner" id='home' style={{ position: 'relative' }}>
                        <Swiper autoplay={{ delay: 5000 }}>
                            {bannerData.map((item) => (
                                <SwiperSlide key={item.id} style={{ backgroundImage: `url(${item.backgroundImage})`, backgroundSize: 'cover' }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    }}></div>
                                    <div className="container">
                                        <div className="row justify-content-between">
                                            <div className="col-xxl-5 col-md-10 col-lg-6 wow fadeInLeft" data-wow-duration="1s">
                                                <div className="banner_text">
                                                    <h1>{item.title}</h1>
                                                    <h5 style={{ color: "white" }}>{item.description}</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </section>
                </div>
                <div className="col-xl-4 col-lg-4">
                    <div className="sidebar bg-light text-dark" id="sticky_sidebar" style={{ position: 'relative' }}>
                        <div style={{ position: 'sticky', zIndex: 1 }}>
                            <h3>Latest Announcements</h3>
                        </div>
                        <div className="sidebar_post" style={{ maxHeight: '450px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                            <ul>
                                {noticeData.map((notice, index) => (
                                    <li key={index}>
                                        <div className="img">
                                            {isPdfFile(notice.file) ? (
                                                < img src={PDFImg} width="100" height="100" alt="PDF Thumbnail" />
                                            ) : (
                                                <img src={notice.file} width="100" height="100" alt="File Thumbnail" />
                                            )}
                                        </div>
                                        <div className="text">
                                            <a href={notice.file} target="_blank" rel="noopener noreferrer">{notice.title}&nbsp;{isRecentlyUpdated(notice.timestamp) && <img className='newbadge-noticepanel' src={New} />}</a>
                                            <p><i className="fal fa-calendar-alt"></i> {notice.date}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            {/* <About /> */}

            {/* Courses Section */}
            {/* <Courses /> */}

            {/* Testimonials Section */}
            <Testimonials />

            {/* <Events /> */}

            {/* <Achievements /> */}

            {/* Contact Section */}
            <Contact />

            {/* Footer Section */}
            <Footer />

            <div className="scroll_btn"><i className="far fa-long-arrow-up"></i></div>
        </div>
    )
}

export default Index
