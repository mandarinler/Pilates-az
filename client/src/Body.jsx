import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "./Body.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useState, useEffect } from "react";

const sections = [
  { id: "home", title: "Əsas Səhifə" },
  { id: "about", title: "Haqqımızda" },
  { id: "why", title: "Niyə Biz" },
  { id: "packages", title: "Paketlər" },
  { id: "trainers", title: "Məşqçilər" },
  { id: "contact", title: "Əlaqə" },
];

export default function Body() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  // Trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "trainers"));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => a.order - b.order); 
        setTrainers(data);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };

    fetchTrainers();
  }, []);
  // Packages
  useEffect(() => {
    const fetchPackages = async () => {
      const querySnapshot = await getDocs(collection(db, "packages"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort((a, b) => a.order - b.order);
      setPackages(data);
    };
    fetchPackages();
  }, []);

  // Blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => a.order - b.order);
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          src="https://www.st-pilates.az/itexpress.az/Pilates_1.mp4"
        />
        <div className="hero-overlay">
          <div className="hero-text-bg">
            <h1>ST Pilates'ə Xoş Gəlmisiniz</h1>
            <p>Bədəninizə və sağlamlığınıza dəyər verin</p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src="https://i.hizliresim.com/r47r9w0.jpg" alt="Pilates" />
          </div>
          <div className="about-content">
            <h2>Pilatesin məqsəd və faydaları</h2>
            <ul className="about-list">
              <li>Düzgün nəfəs almağı öyrədir</li>
              <li>Gündəlik aktivliyi artırır</li>
              <li>Bədən duruşunu düzəldir</li>
              <li>Skolyoz problemi həll edir</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Why Pilates Section */}
      <section id="why" className="why-section">
        <h2 className="why-title">Üstünlüklərimiz</h2>

        <div className="why-container">
          {/* Body Building */}
          <div className="why-item">
            <div className="why-image">
              <img
                src="https://i.hizliresim.com/cizc78c.jpg"
                alt="Body Building"
              />
            </div>
            <div className="why-text">
              <h3>Body Building</h3>
              <p>
                Pilates məşqləri bədəninizin əzələ tonusunu artırır, gücü və
                çevikliyi inkişaf etdirir. Hər yaş üçün uyğun və təhlükəsizdir.
              </p>
            </div>
          </div>

          {/* Gym for Men */}
          <div className="why-item">
            <div className="why-image">
              <img
                src="https://i.hizliresim.com/6oymv7n.jpg"
                alt="Gym for Men"
              />
            </div>
            <div className="why-text">
              <h3>Kişilər üçün GYM</h3>
              <p>
                Kişilər üçün xüsusi proqramlar güc və dözümlülüyü artırmaq
                məqsədilə hazırlanmışdır. Sağlam bədən quruluşunu dəstəkləyir.
              </p>
            </div>
          </div>

          {/* Gym for Women */}
          <div className="why-item">
            <div className="why-image">
              <img
                src="https://i.hizliresim.com/5e1kx00.jpg"
                alt="Gym for Women"
              />
            </div>
            <div className="why-text">
              <h3>Qadınlar üçün GYM</h3>
              <p>
                Qadınlar üçün nəzərdə tutulmuş Pilates proqramları bədənin
                elastikliyini və forma almasını təmin edir, həmçinin stressi
                azaldır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="packages-section">
        <h2 className="section-title">Paketlərimiz</h2>
        <div className="packages-container">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <h3>{pkg.name}</h3>
              <p className="price">
                <span className="price-currency">₼</span>
                <span className="price-amount">{pkg.price}</span>
                <span className="price-unit">/{pkg.time}</span>
              </p>
              <ul className="package-list">
                {pkg.features.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Trainers section */}
      <section id="trainers" className="site-section trainers-section">
        <h2 className="trainers-title">Məşqçilərimiz</h2>
        <div className="trainers-container">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="trainer-card"
            style={{ backgroundImage: `url(https://i.hizliresim.com/h1lifh4.jpg)` }}
          >
            <div className="trainer-overlay">
              <p>Professional Məşqçi</p>
              <h3>{trainer.name}</h3>
              <div className="trainer-socials">
                {Object.entries(trainer.socials).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className={`fab fa-${platform}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="blogs-section">
        <h2 className="blogs-title">Bloqlar</h2>
        <div className="blogs-container">
          {blogs.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={20}
              loop={blogs.length > 3}
              pagination={{ clickable: true }}
              navigation
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {blogs.map((blog) => (
                <SwiperSlide key={blog.id}>
                  <div className="blog-card" onClick={() => navigate(`/blog/${blog.id}`)}>
                    <div className="blog-image">
                      {blog.imageUrl ? (
                        <img 
                          src={blog.imageUrl} 
                          alt={blog.title}
                          onError={(e) => {
                            console.error(`Failed to load image: ${blog.imageUrl}`);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="blog-placeholder" 
                        style={{ display: blog.imageUrl ? 'none' : 'flex' }}
                      >
                        <i className="fas fa-image"></i>
                      </div>
                    </div>
                    <div className="blog-content">
                      <h3 className="blog-title">{blog.title}</h3>
                      <p className="blog-excerpt">
                        {blog.content?.substring(0, 120)}...
                      </p>
                      <div className="blog-meta">
                        <span className="blog-date">
                          {new Date(blog.createdAt).toLocaleDateString('az-AZ')}
                        </span>
                        <span className="blog-read-more">Davamını oxu →</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="no-blogs">
              <p>Hələlik blog yazıları yoxdur. Tezliklə əlavə ediləcək!</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2 className="contact-title">Əlaqə Saxla</h2>
        <div className="contact-grid">
          {/* Left Side */}
          <div className="contact-left">
            <img
              src="https://i.hizliresim.com/91xwdfz.png"
              alt="ST Pilates Logo"
              className="contact-logo"
            />
            <div className="contact-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                <i className="fab fa-tiktok"></i>
              </a>
              <a
                href="https://wa.me/994997332626"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Right Side */}
          <div className="contact-right">
            <div className="contact-hours">
              <h3>İş saatları</h3>
              <p>Həftə içi : 09:00 - 20:00</p>
              <p>Şənbə : 09:00 - 20:00</p>
              <p>Bazar : Fərdi dərslər</p>
            </div>

            <div className="contact-info">
              <h3>Əlaqə</h3>
              <p>+994 99 733 26 26</p>
              <p>+994 99 733 26 26</p>
              <p>office@st-pilates.az</p>
              <p>
                8 Noyabr prospekti , Nargilə dairəsi, Blue Office C blok 18ci
                mərtəbə
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="site-footer">
        <p>© 2025 ST Pilates. All rights reserved.</p>
      </footer>
    </main>
  );
}
