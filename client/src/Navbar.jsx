import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const sections = [
  { id: "home", label: "Əsas Səhifə" },
  { id: "about", label: "Haqqımızda" },
  { id: "why", label: "Niyə Biz" },
  { id: "packages", label: "Paketlər" },
  { id: "trainers", label: "Məşqçilər" },
  { id: "blogs", label: "Bloqlar" },
  { id: "contact", label: "Əlaqə" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [logoUrl, setLogoUrl] = useState("");

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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "contact"), (snap) => {
      const docs = snap.docs.map((d) => d.data());
      const docWithLogo = docs.find((d) => typeof d?.logoUrl === "string" && d.logoUrl);
      if (docWithLogo) setLogoUrl(docWithLogo.logoUrl);
    });
    return () => unsub();
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
          <img src={logoUrl || "https://i.hizliresim.com/91xwdfz.png"} alt="Logo" />
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
