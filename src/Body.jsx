import React from "react";
import "./Body.css";

const sections = [
  { id: "home", title: "Əsas Səhifə" },
  { id: "about", title: "Haqqımızda" },
  { id: "why", title: "Niyə Biz" },
  { id: "packages", title: "Paketlər" },
  { id: "trainers", title: "Məşqçilər" },
  { id: "certificates", title: "Sertifikatlar" },
  { id: "contact", title: "Əlaqə" },
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
            <h1>Pilates'ə Xoş Gəlmisiniz</h1>
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

      {/* Map the remaining normal sections */}
      {sections
        .filter(
          (s) =>
            s.id !== "home" &&
            s.id !== "about" &&
            s.id !== "why" &&
            s.id !== "packages"
        )
        .map((s) => (
          <section id={s.id} key={s.id} className="site-section">
            <div className="section-inner">
              <h2>{s.title}</h2>
              <p>
                Sample content for {s.title}. Replace this with your app
                content.
              </p>
            </div>
          </section>
        ))}
    </main>
  );
}
