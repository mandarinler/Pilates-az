import React, { useState, useEffect } from "react";
import "./Navbar.css";

const sections = [
  { id: "home", label: "Əsas Səhifə" },
  { id: "about", label: "Haqqımızda" },
  { id: "why", label: "Niyə Biz" },
  { id: "packages", label: "Paketlər" },
  { id: "trainers", label: "Məşqçilər" },
  { id: "certificates", label: "Sertifikatlar" },
  { id: "contact", label: "Əlaqə" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const offset = window.innerHeight / 4;
    const onScroll = () => {
      const pos = window.scrollY + offset;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.offsetTop <= pos) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleClick = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <img src="https://i.hizliresim.com/9jtkfwz.png" alt="Logo" />
        </div>
        <div className="links-desktop">
          {sections.map((s) => (
            <button
              key={s.id}
              className={"nav-btn " + (active === s.id ? "active" : "")}
              onClick={() => handleClick(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={open ? "hamburger-line open" : "hamburger-line"} />
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          {sections.map((s) => (
            <button
              key={s.id}
              className={"mobile-link " + (active === s.id ? "active" : "")}
              onClick={() => handleClick(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
