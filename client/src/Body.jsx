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
import { useState, useEffect, useRef } from "react";

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
  const [whys, setWhys] = useState([]);
  const [about, setAbout] = useState(null);
  const [contact, setContact] = useState(null);
  const [hero, setHero] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimerRef = useRef(null);
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

  // Why (list)
  useEffect(() => {
    const fetchWhy = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "why"));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setWhys(data);
      } catch (error) {
        console.error("Error fetching why items:", error);
      }
    };
    fetchWhy();
  }, []);

  // About (single doc)
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "about"));
        const doc = querySnapshot.docs[0]
          ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
          : null;
        setAbout(doc);
      } catch (error) {
        console.error("Error fetching about:", error);
      }
    };
    fetchAbout();
  }, []);

  // Contact (single doc)
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "contact"));
        const doc = querySnapshot.docs[0]
          ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
          : null;
        setContact(doc);
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };
    fetchContact();
  }, []);

  // Hero (single doc)
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "hero"));
        const doc = querySnapshot.docs[0]
          ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
          : null;
        setHero(doc);
      } catch (error) {
        console.error("Error fetching hero:", error);
      }
    };
    fetchHero();
  }, []);

  // Handle slideshow rotation
  useEffect(() => {
    // clear any previous timer
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    }

    const isSlideshow = hero?.mediaType === "slideshow" && Array.isArray(hero?.images) && hero.images.length > 1;
    if (!isSlideshow) {
      setCurrentSlide(0);
      return;
    }

    const interval = Number(hero?.slideInterval) || 3500; // default 3.5s
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const total = hero.images.length;
        return (prev + 1) % total;
      });
    }, Math.max(1500, interval));

    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [hero]);

  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="hero-section">
        {/* Slideshow Mode */}
        {hero?.mediaType === "slideshow" && Array.isArray(hero?.images) && hero.images.length > 0 ? (
          <img
            key={hero.images[currentSlide] || "slideshow"}
            className="hero-video hero-fade"
            src={hero.images[currentSlide]}
            alt="Hero Slideshow"
          />
        ) : null}
        {/* Single Image Mode */}
        {hero?.mediaType === "image" && hero?.mediaUrl ? (
          <img className="hero-video" src={hero.mediaUrl} alt="Hero" />
        ) : null}
        {/* Video Mode (default) */}
        {hero && hero.mediaType !== "image" && hero.mediaType !== "slideshow" && hero.mediaUrl ? (
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            src={hero.mediaUrl}
          />
        ) : null}
        <div className="hero-overlay">
          <div className="hero-text-bg">
            <h1>{hero?.title || "ST Pilates'ə Xoş Gəlmisiniz"}</h1>
            <p>{hero?.subtitle || "Bədəninizə və sağlamlığınıza dəyər verin"}</p>
          </div>
        </div>
      </section>

      {/* About Us Section (dynamic) */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src={about?.imageUrl || "https://i.hizliresim.com/r47r9w0.jpg"} alt="About" />
          </div>
          <div className="about-content">
            <h2>{about?.title || "Haqqımızda"}</h2>
            <p>{about?.text || "Məlumat tezliklə əlavə ediləcək."}</p>
          </div>
        </div>
      </section>
      {/* Why Pilates Section (dynamic) */}
      <section id="why" className="why-section">
        <h2 className="why-title">Üstünlüklərimiz</h2>
        <div className={`why-container two-col ${whys.length === 1 ? "single" : ""}`}>
          {whys.map((item) => (
            <div key={item.id} className="why-item">
              <div className="why-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : null}
              </div>
              <div className="why-text">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
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
        <div className="trainers-grid">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="trainer-card">
              <div className="trainer-image">
                <img
                  src={trainer.imageUrl || "https://i.hizliresim.com/h1lifh4.jpg"}
                  alt={trainer.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://i.hizliresim.com/h1lifh4.jpg";
                  }}
                />
              </div>
              <div className="trainer-overlay">
                <p>Professional Məşqçi</p>
                <h3>{trainer.name}</h3>
                <div className="trainer-socials">
                  {Object.entries(trainer.socials).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noreferrer">
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

      {/* Contact Section (dynamic) */}
      <section id="contact" className="contact-section">
        <h2 className="contact-title">Əlaqə Saxla</h2>
        <div className="contact-grid">
          {/* Left Side */}
          <div className="contact-left">
            <img
              src={contact?.logoUrl || "https://i.hizliresim.com/91xwdfz.png"}
              alt="ST Pilates Logo"
              className="contact-logo"
            />
            <div className="contact-socials">
              {Array.isArray(contact?.socials)
                ? contact.socials
                    .filter((s) => s && s.platform && s.url)
                    .map((s) => (
                      <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                        <i className={`fab fa-${s.platform}`}></i>
                      </a>
                    ))
                : contact?.socials && typeof contact.socials === "object"
                ? Object.entries(contact.socials)
                    .filter(([_, url]) => typeof url === "string" && url)
                    .map(([platform, url]) => (
                      <a key={platform} href={url} target="_blank" rel="noreferrer">
                        <i className={`fab fa-${platform}`}></i>
                      </a>
                    ))
                : null}
            </div>
          </div>

          {/* Right Side */}
          <div className="contact-right">
            <div className="contact-hours">
              <h3>İş saatları</h3>
              {(contact?.hours || [
                "Həftə içi : 09:00 - 20:00",
                "Şənbə : 09:00 - 20:00",
                "Bazar : Fərdi dərslər",
              ]).map((h, i) => (
                <p key={i}>{h}</p>
              ))}
            </div>

            <div className="contact-info">
              <h3>Əlaqə</h3>
              {(contact?.phones || ["+994 99 733 26 26", "+994 99 733 26 26"]).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p>{contact?.email || "office@st-pilates.az"}</p>
              <p>
                {contact?.address || "8 Noyabr prospekti , Nargilə dairəsi, Blue Office C blok 18ci mərtəbə"}
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
