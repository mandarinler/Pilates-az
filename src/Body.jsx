import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "./Body.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const sections = [
  { id: "home", title: "Əsas Səhifə" },
  { id: "about", title: "Haqqımızda" },
  { id: "why", title: "Niyə Biz" },
  { id: "packages", title: "Paketlər" },
  { id: "trainers", title: "Məşqçilər" },
  { id: "certificates", title: "Sertifikatlar" },
  { id: "contact", title: "Əlaqə" },
];

const certificates = [
  {
    id: 1,
    img: "https://www.st-pilates.az/uploads/FatimaCert.jpg",
    date: "12.05.2023",
    desc: "Awarded for outstanding performance in robotics",
  },
  {
    id: 2,
    img: "https://www.st-pilates.az/uploads/372500GE1112841-ingilizce.jpg",
    date: "24.11.2022",
    desc: "Certified participation in AI workshop",
  },
  {
    id: 3,
    img: "https://www.st-pilates.az/uploads/Converted%20File.jpg",
    date: "31.08.2021",
    desc: "Completed advanced Flutter development course",
  },
  {
    id: 4,
    img: "https://www.st-pilates.az/uploads/FatimaCert.jpg",
    date: "19.03.2024",
    desc: "Completed advanced Flutter development course",
  },
  {
    id: 5,
    img: "https://www.st-pilates.az/uploads/372500GE1112841-ingilizce.jpg",
    date: "05.06.2023",
    desc: "Completed advanced Flutter development course",
  },
];

export default function Body() {
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
        <h2 className="section-title">Üstünlüklərimiz</h2>

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
              <h3>Gym for Men</h3>
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
              <h3>Gym for Women</h3>
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
          {/* Standart Paket */}
          <div className="package-card">
            <h3>Standart Paket</h3>
            <p className="price">
              <span className="price-currency">₼</span>
              <span className="price-amount">180</span>
              <span className="price-unit">/Ay</span>
            </p>

            <ul className="package-list">
              <li>12 məşq</li>
              <li>Həftədə 3 dəfə olmaqla</li>
              <li>Professional məşqçi</li>
            </ul>
          </div>

          {/* Ekonom Paket */}
          <div className="package-card">
            <h3>Ekonom Paket</h3>
            <p className="price">
              <span className="price-currency">₼</span>
              <span className="price-amount">120</span>
              <span className="price-unit">/Ay</span>
            </p>
            <ul className="package-list">
              <li>8 dərs</li>
              <li>Həftədə 2 dəfə olmaqla</li>
              <li>Professional məşqçi</li>
            </ul>
          </div>

          {/* Massaj */}
          <div className="package-card">
            <h3>Massaj</h3>

            <p className="price">
              <span className="price-currency">₼</span>
              <span className="price-amount">25</span>
              <span className="price-unit">/Seans</span>
            </p>
            <ul className="package-list">
              <li>G8 vibro aparat</li>
              <li>Müalicəvi massaj</li>
              <li>Anti cellulite massaj</li>
              <li>BM massaj</li>
              <li>Relaks massaj</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trainers section */}
      <section id="trainers" className="site-section trainers-section">
        <h2>Məşqçilərimiz</h2>
        <div className="trainers-container">
          <div
            className="trainer-card"
            style={{
              backgroundImage:
                "url('https://www.st-pilates.az/uploads/1111.jpg')",
            }}
          >
            <div className="trainer-overlay">
              <p>Professional Məşqçi</p>
              <h3>Murad Əliyev</h3>
              <div className="trainer-socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
          </div>
          <div
            className="trainer-card"
            style={{
              backgroundImage:
                "url('https://www.st-pilates.az/uploads/1111.jpg')",
            }}
          >
            <div className="trainer-overlay">
              <p>Professional Məşqçi</p>
              <h3>Aysel Məmmədova</h3>
              <div className="trainer-socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Certificates Section */}
      <section id="certificates" className="certificates">
        <h2 className="certificates-title">Sertifikatlar</h2>
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {certificates.map((cert) => (
            <SwiperSlide key={cert.id}>
              <div className="certificate-card">
                <div className="certificate-img">
                  <img src={cert.img} alt="Certificate" />
                </div>
                <div className="certificate-info">
                  <p className="date">{cert.date}</p>
                  <p className="title">Sertifikat</p>
                  <p className="desc">{cert.desc}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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
