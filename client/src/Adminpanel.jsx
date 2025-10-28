import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { uploadToCloudinary } from "./utils/cloudinaryUpload";
import "./Adminpanel.css";

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [whys, setWhys] = useState([]);
  const [about, setAbout] = useState(null);
  const [contact, setContact] = useState(null);
  const [hero, setHero] = useState(null);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("packages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const normalizeArray = (v) => (Array.isArray(v) ? v : []);
  const migrateContact = (docData) => {
    if (!docData) return null;
    const migrated = { ...docData };
    // Hours: from strings to array
    if (!Array.isArray(migrated.hours)) {
      const hours = [];
      if (typeof migrated.hourWeekdays === "string")
        hours.push(migrated.hourWeekdays);
      if (typeof migrated.hourSaturday === "string")
        hours.push(migrated.hourSaturday);
      if (typeof migrated.hourSunday === "string")
        hours.push(migrated.hourSunday);
      migrated.hours = hours.length ? hours : [];
    }
    // Phones: consolidate phone1/phone2
    if (!Array.isArray(migrated.phones)) {
      const phones = [];
      if (typeof migrated.phone1 === "string") phones.push(migrated.phone1);
      if (typeof migrated.phone2 === "string") phones.push(migrated.phone2);
      migrated.phones = phones.length ? phones : [];
    }
    // Socials: object map -> array
    if (!Array.isArray(migrated.socials)) {
      const socialsArr = [];
      const src =
        migrated.socials && typeof migrated.socials === "object"
          ? migrated.socials
          : {};
      Object.keys(src).forEach((platform) => {
        const url = src[platform];
        if (typeof url === "string" && url) {
          socialsArr.push({
            id: `soc_${platform}_${Date.now()}`,
            platform,
            url,
          });
        }
      });
      migrated.socials = socialsArr;
    }
    return migrated;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainerSnap = await getDocs(collection(db, "trainers"));
        const packageSnap = await getDocs(collection(db, "packages"));
        const blogSnap = await getDocs(collection(db, "blogs"));
        const whySnap = await getDocs(collection(db, "why"));
        const aboutSnap = await getDocs(collection(db, "about"));
        const contactSnap = await getDocs(collection(db, "contact"));
        const heroSnap = await getDocs(collection(db, "hero"));
        const mediaSnap = await getDocs(collection(db, "mediaLibrary"));
        setTrainers(trainerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPackages(packageSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setBlogs(blogSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setWhys(whySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        const aboutDoc = aboutSnap.docs[0]
          ? { id: aboutSnap.docs[0].id, ...aboutSnap.docs[0].data() }
          : null;
        setAbout(aboutDoc);
        const contactDoc = contactSnap.docs[0]
          ? { id: contactSnap.docs[0].id, ...contactSnap.docs[0].data() }
          : null;
        setContact(migrateContact(contactDoc));
        const heroDoc = heroSnap.docs[0]
          ? { id: heroSnap.docs[0].id, ...heroSnap.docs[0].data() }
          : null;
        setHero(heroDoc);
        setMediaLibrary(mediaSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleLogout = async () => await signOut(auth);

  const addFeature = () => {
    const currentFeatures = Array.isArray(editData.features)
      ? editData.features
      : [];
    setEditData({ ...editData, features: [...currentFeatures, ""] });
  };

  const removeFeature = (index) => {
    const currentFeatures = Array.isArray(editData.features)
      ? editData.features
      : [];
    const newFeatures = currentFeatures.filter((_, idx) => idx !== index);
    setEditData({ ...editData, features: newFeatures });
  };

  const addSocial = () => {
    const currentSocials = editData.socials || {};
    const socialId = `social_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setEditData({
      ...editData,
      socials: { ...currentSocials, [socialId]: { platform: "", url: "" } },
    });
  };

  const removeSocial = (socialId) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    delete newSocials[socialId];
    setEditData({ ...editData, socials: newSocials });
  };

  const updateSocialPlatform = (socialId, newPlatform) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    if (newSocials[socialId]) {
      newSocials[socialId] = { ...newSocials[socialId], platform: newPlatform };
      setEditData({ ...editData, socials: newSocials });
    }
  };

  const updateSocialUrl = (socialId, newUrl) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    if (newSocials[socialId]) {
      newSocials[socialId] = { ...newSocials[socialId], url: newUrl };
      setEditData({ ...editData, socials: newSocials });
    }
  };

  const migrateSocials = (socials) => {
    if (!socials) return {};
    const migrated = {};
    Object.keys(socials).forEach((key) => {
      const value = socials[key];
      if (typeof value === "string") {
        const socialId = `social_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        migrated[socialId] = { platform: key, url: value };
      } else if (typeof value === "object" && value.platform !== undefined) {
        migrated[key] = value;
      }
    });
    return migrated;
  };

  // Handle input changes in edit mode
  const handleChange = (field, value, subfield = null, index = null) => {
    if (index !== null) {
      const currentArray = Array.isArray(editData[field])
        ? editData[field]
        : [];
      const arrCopy = [...currentArray];
      arrCopy[index] = value;
      setEditData({ ...editData, [field]: arrCopy });
    } else if (subfield !== null) {
      setEditData({
        ...editData,
        [field]: { ...editData[field], [subfield]: value },
      });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  // Save to Firebase
  const handleSave = async (type, id) => {
    try {
      let dataToSave = { ...editData };
      if (type === "trainers" && editData.socials) {
        const simpleSocials = {};
        Object.keys(editData.socials).forEach((socialId) => {
          const social = editData.socials[socialId];
          if (social.platform && social.url) {
            simpleSocials[social.platform] = social.url;
          }
        });
        dataToSave.socials = simpleSocials;
      }

      await updateDoc(doc(db, type, id), dataToSave);
      setEditId(null);

      if (type === "trainers") {
        setTrainers(trainers.map((t) => (t.id === id ? dataToSave : t)));
      } else if (type === "packages") {
        setPackages(packages.map((p) => (p.id === id ? dataToSave : p)));
      } else if (type === "blogs") {
        setBlogs(blogs.map((b) => (b.id === id ? dataToSave : b)));
      } else if (type === "why") {
        setWhys(whys.map((w) => (w.id === id ? dataToSave : w)));
      } else if (type === "hero") {
        setHero({ ...(hero || {}), ...dataToSave, id });
      }
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  // Delete item from Firebase
  const handleDelete = async (type, id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${type.slice(0, -1)}?`
      )
    ) {
      try {
        await deleteDoc(doc(db, type, id));

        if (type === "trainers") {
          setTrainers(trainers.filter((t) => t.id !== id));
        } else if (type === "packages") {
          setPackages(packages.filter((p) => p.id !== id));
        } else if (type === "blogs") {
          setBlogs(blogs.filter((b) => b.id !== id));
        } else if (type === "why") {
          setWhys(whys.filter((w) => w.id !== id));
        }
      } catch (err) {
        console.error("Error deleting data:", err);
      }
    }
  };

  // Create new item
  const handleCreate = async (type) => {
    try {
      let newItem;
      if (type === "packages") {
        newItem = {
          name: "Yeni Paket",
          price: "99",
          time: "Ay/Seans",
          order: packages.length + 1,
          features: ["Feature 1", "Feature 2"],
        };
      } else if (type === "trainers") {
        newItem = {
          name: "Yeni Trainer",
          order: trainers.length + 1,
          socials: {},
          imageUrl: "",
        };
      } else if (type === "blogs") {
        newItem = {
          title: "Yeni Blog Post",
          content: "Blog yazısını buraya yazın...",
          imageUrl: "",
          createdAt: new Date().toISOString(),
          order: blogs.length + 1,
        };
      } else if (type === "why") {
        newItem = {
          title: "Yeni Xidmet",
          text: "Xidmet haqqında qısa məlumat...",
          imageUrl: "",
          order: whys.length + 1,
        };
      } else if (type === "about") {
        newItem = {
          title: "About Our Company",
          text: "Write about the company's history and mission here...",
          imageUrl: "",
        };
      } else if (type === "hero") {
        newItem = {
          mediaType: "video",
          mediaUrl: "https://www.st-pilates.az/itexpress.az/Pilates_1.mp4",
          title: "ST Pilates'ə Xoş Gəlmisiniz",
          subtitle: "Bədəninizə və sağlamlığınıza dəyər verin",
        };
      } else if (type === "contact") {
        newItem = {
          logoUrl: "",
          hours: [
            "Həftə içi : 09:00 - 20:00",
            "Şənbə : 09:00 - 20:00",
            "Bazar : Fərdi dərslər",
          ],
          phones: ["+994 99 733 26 26", "+994 99 733 26 26"],
          email: "office@st-pilates.az",
          address:
            "8 Noyabr prospekti , Nargilə dairəsi, Blue Office C blok 18ci mərtəbə",
          socials: [
            {
              id: `soc_${Date.now()}_ig`,
              platform: "instagram",
              url: "https://instagram.com",
            },
            {
              id: `soc_${Date.now()}_fb`,
              platform: "facebook",
              url: "https://facebook.com",
            },
            {
              id: `soc_${Date.now()}_tt`,
              platform: "tiktok",
              url: "https://tiktok.com",
            },
            {
              id: `soc_${Date.now()}_wa`,
              platform: "whatsapp",
              url: "https://wa.me/994997332626",
            },
          ],
        };
      }

      const docRef = await addDoc(collection(db, type), newItem);

      if (type === "trainers") {
        setTrainers([...trainers, { id: docRef.id, ...newItem }]);
      } else if (type === "packages") {
        setPackages([...packages, { id: docRef.id, ...newItem }]);
      } else if (type === "blogs") {
        setBlogs([...blogs, { id: docRef.id, ...newItem }]);
      } else if (type === "why") {
        setWhys([...whys, { id: docRef.id, ...newItem }]);
      } else if (type === "about") {
        const created = { id: docRef.id, ...newItem };
        setAbout(created);
      } else if (type === "contact") {
        const created = { id: docRef.id, ...newItem };
        setContact(created);
      } else if (type === "hero") {
        const created = { id: docRef.id, ...newItem };
        setHero(created);
      }
      setEditId(docRef.id);
      setEditData({ id: docRef.id, ...newItem });
    } catch (err) {
      console.error("Error creating data:", err);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("İlk öncə şəkil seçin!");
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedImage.size > maxSize) {
      alert("Fayl həcmi böyükdür. Maksimum limit 10mb.");
      return;
    }

    try {
      alert("Şəkil yüklənir...");
      const imageUrl = await uploadToCloudinary(selectedImage);

      setUploadedImageUrl(imageUrl);
      // Automatically update the imageUrl field in editData
      setEditData({ ...editData, imageUrl });
      alert("Şəkil uğurla yükləndi!");
    } catch (error) {
      console.error("Yüklənmə uğursuz oldu:", error);
      alert("Yüklənmə uğursuz oldu! Lütfən Cloudinary ayarlarını yoxlayın.");
    }
  };

  const resetImageStates = () => {
    setSelectedImage(null);
    setPreview("");
    setUploadedImageUrl("");
  };
  if (!user) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Admin Login</h2>
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifrə"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a href="/" className="home-btn">
            Ana Səhifə
          </a>
          <button onClick={handleLogout} className="logout-btn">
            Çıxış et
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-layout">
          <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
            <button
              className={`nav-item ${
                selectedSection === "packages" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("packages")}
            >
              Paketlər
            </button>
            <button
              className={`nav-item ${
                selectedSection === "hero" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("hero")}
            >
              Hero Bölməsi
            </button>
            <button
              className={`nav-item ${
                selectedSection === "trainers" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("trainers")}
            >
              Trainerlər
            </button>
            <button
              className={`nav-item ${
                selectedSection === "blogs" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("blogs")}
            >
              Blog
            </button>
            <button
              className={`nav-item ${
                selectedSection === "why" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("why")}
            >
              Xidmətlər
            </button>
            <button
              className={`nav-item ${
                selectedSection === "contact" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("contact")}
            >
              Kontakt
            </button>
            <button
              className={`nav-item ${
                selectedSection === "about" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("about");
                resetImageStates();
                if (about) {
                  setEditId(about.id);
                  setEditData(about);
                } else {
                  setEditId(null);
                  setEditData({});
                }
              }}
            >
              Haqqımızda
            </button>
          </aside>
          <main className="content">
            {selectedSection === "hero" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Hero Bölməsi</h2>
                  <button
                    onClick={() => !hero && handleCreate("hero")}
                    className="create-btn"
                  >
                    {hero ? "" : "Create Hero"}
                  </button>
                </div>
                {hero ? (
                  <div className="data-item">
                    <label>Title</label>
                    <input
                      value={
                        editId === hero.id
                          ? editData.title || ""
                          : hero.title || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== hero.id) {
                          setEditId(hero.id);
                          setEditData({ ...hero, title: value });
                        } else {
                          handleChange("title", value);
                        }
                      }}
                    />
                    <label>Subtitle</label>
                    <input
                      value={
                        editId === hero.id
                          ? editData.subtitle || ""
                          : hero.subtitle || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== hero.id) {
                          setEditId(hero.id);
                          setEditData({ ...hero, subtitle: value });
                        } else {
                          handleChange("subtitle", value);
                        }
                      }}
                    />
                    <label>Media Tipi</label>
                    <select
                      value={
                        editId === hero.id
                          ? editData.mediaType || "video"
                          : hero.mediaType || "video"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== hero.id) {
                          setEditId(hero.id);
                          setEditData({ ...hero, mediaType: value });
                        } else {
                          handleChange("mediaType", value);
                        }
                      }}
                    >
                      <option value="video">Video</option>
                      <option value="image">Şəkil</option>
                    </select>

                    <div className="image-upload-section">
                      <label>
                        {(editId === hero.id
                          ? editData.mediaType
                          : hero.mediaType) === "image"
                          ? "Şəkil"
                          : "Video"}{" "}
                        Yüklə
                      </label>
                      <input
                        type="file"
                        accept={
                          (editId === hero.id
                            ? editData.mediaType
                            : hero.mediaType) === "image"
                            ? "image/*"
                            : "video/*"
                        }
                        onChange={handleFileChange}
                        style={{ marginBottom: "10px" }}
                      />
                      {preview &&
                        (editId === hero.id
                          ? editData.mediaType || "video"
                          : hero.mediaType || "video") === "image" && (
                          <img
                            src={preview}
                            alt="Preview"
                            width="350"
                            style={{
                              borderRadius: "10px",
                              marginBottom: "10px",
                              display: "block",
                            }}
                          />
                        )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!selectedImage) {
                            alert("Please select a file first!");
                            return;
                          }
                          alert("Uploading...");
                          const url = await uploadToCloudinary(selectedImage);
                          setUploadedImageUrl(url);
                          const field =
                            (editId === hero.id
                              ? editData.mediaType
                              : hero.mediaType) === "image"
                              ? "mediaUrl"
                              : "mediaUrl";
                          if (editId !== hero.id) {
                            setEditId(hero.id);
                            setEditData({ ...hero, [field]: url });
                          } else {
                            setEditData({ ...editData, [field]: url });
                          }

                          // Automatically save to library
                          const type =
                            (editId === hero.id
                              ? editData.mediaType
                              : hero.mediaType) || "video";
                          try {
                            const docRef = await addDoc(
                              collection(db, "mediaLibrary"),
                              { url, type, createdAt: Date.now() }
                            );
                            setMediaLibrary([
                              { id: docRef.id, url, type },
                              ...mediaLibrary,
                            ]);
                          } catch (e) {
                            console.error("Failed to save to library:", e);
                          }

                          alert(
                            "Uğurla yükləndi və library-ə yadda saxlanıldı!"
                          );
                        }}
                        style={{ marginBottom: "10px" }}
                      >
                        Yüklə
                      </button>

                      <label>Media URL</label>
                      <input
                        value={
                          uploadedImageUrl ||
                          (editId === hero.id
                            ? editData.mediaUrl || ""
                            : hero.mediaUrl || "")
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (editId !== hero.id) {
                            setEditId(hero.id);
                            setEditData({ ...hero, mediaUrl: value });
                          } else {
                            handleChange("mediaUrl", value);
                          }
                        }}
                        placeholder={
                          (editId === hero.id
                            ? editData.mediaType
                            : hero.mediaType) === "image"
                            ? "Image URL"
                            : "Video URL"
                        }
                        style={{ width: "100%", padding: "5px" }}
                      />

                      {/* Saved media reuse - thumbnail picker */}
                      {mediaLibrary && mediaLibrary.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <label>Library-də saxlanan Media</label>
                          <div className="media-library-grid">
                            {mediaLibrary.map((m) => (
                              <div key={m.id} className="media-item">
                                <div className="media-thumb">
                                  {m.type === "image" ? (
                                    <img src={m.url} alt="saved" />
                                  ) : (
                                    <video src={m.url} muted playsInline />
                                  )}
                                </div>
                                <div className="media-meta">
                                  <span className={`tag ${m.type}`}>
                                    {m.type}
                                  </span>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "8px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const updatedData = {
                                          mediaUrl: m.url,
                                          mediaType: m.type,
                                        };
                                        if (editId !== hero.id) {
                                          setEditId(hero.id);
                                          setEditData({
                                            ...hero,
                                            ...updatedData,
                                          });
                                        } else {
                                          setEditData({
                                            ...editData,
                                            ...updatedData,
                                          });
                                        }
                                        // Auto-save
                                        try {
                                          await updateDoc(
                                            doc(db, "hero", hero.id),
                                            updatedData
                                          );
                                          setHero({ ...hero, ...updatedData });
                                          alert(
                                            "Media uğurla tətbiq edildi və yadda saxlanıldı!"
                                          );
                                        } catch (err) {
                                          console.error("Error saving:", err);
                                          alert("Error saving media");
                                        }
                                      }}
                                      style={{
                                        background: "#16a34a",
                                        color: "#fff",
                                        padding: "6px 12px",
                                        fontSize: "13px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Tətbiq et
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (
                                          window.confirm(
                                            "Bu media-i library-dən silmək istədiyinizdən əminsiniz?"
                                          )
                                        ) {
                                          try {
                                            await deleteDoc(
                                              doc(db, "mediaLibrary", m.id)
                                            );
                                            setMediaLibrary(
                                              mediaLibrary.filter(
                                                (media) => media.id !== m.id
                                              )
                                            );
                                          } catch (err) {
                                            console.error(
                                              "Error deleting:",
                                              err
                                            );
                                            alert("Failed to delete media");
                                          }
                                        }
                                      }}
                                      style={{
                                        background: "#e63946",
                                        color: "#fff",
                                        padding: "6px 12px",
                                        fontSize: "13px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Sil
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={async () => {
                          if (!hero) return;
                          await handleSave("hero", hero.id);
                          setHero({ ...hero, ...editData });
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>No Hero content yet. Click "Create Hero" to add it.</p>
                )}
              </div>
            )}
            {selectedSection === "packages" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Paketlər</h2>
                  <button
                    onClick={() => handleCreate("packages")}
                    className="create-btn"
                  >
                    Yeni Paket Əlavə et
                  </button>
                </div>
                <div className="items-grid">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="data-item">
                      {editId === pkg.id ? (
                        <>
                          <label>Adı</label>
                          <input
                            value={editData.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                          />
                          <label>Qiymət</label>
                          <input
                            value={editData.price}
                            onChange={(e) =>
                              handleChange("price", e.target.value)
                            }
                          />
                          <label>Gediş Növü</label>
                          <input
                            value={editData.time}
                            onChange={(e) =>
                              handleChange("time", e.target.value)
                            }
                          />
                          <label>Sırası</label>
                          <input
                            value={editData.order}
                            onChange={(e) =>
                              handleChange("order", e.target.value)
                            }
                          />
                          <div className="features-container">
                            <label>Features</label>
                            {(Array.isArray(editData.features)
                              ? editData.features
                              : []
                            ).map((f, idx) => (
                              <div key={idx} className="feature-item">
                                <input
                                  value={f || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "features",
                                      e.target.value,
                                      null,
                                      idx
                                    )
                                  }
                                  placeholder={`Feature ${idx + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFeature(idx)}
                                  className="remove-btn"
                                >
                                  Sil
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addFeature}
                              className="add-btn"
                            >
                              Feature Əlavə et
                            </button>
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleSave("packages", pkg.id)}
                            >
                              Yadda saxla
                            </button>
                            <button
                              onClick={() => handleDelete("packages", pkg.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            {pkg.name} - {pkg.price} {pkg.time}
                          </p>
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setEditId(pkg.id);
                                setEditData(pkg);
                              }}
                            >
                              Redaktə et
                            </button>
                            <button
                              onClick={() => handleDelete("packages", pkg.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "trainers" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Trainerlər</h2>
                  <button
                    onClick={() => handleCreate("trainers")}
                    className="create-btn"
                  >
                    Yeni Trainer Əlavə et
                  </button>
                </div>
                <div className="items-grid">
                  {trainers.map((tr) => (
                    <div key={tr.id} className="data-item">
                      {editId === tr.id ? (
                        <>
                          <label>Ad</label>
                          <input
                            value={editData.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                          />
                          <label>Sıra</label>
                          <input
                            value={editData.order}
                            onChange={(e) =>
                              handleChange("order", e.target.value)
                            }
                          />
                          <div className="image-upload-section">
                            <label>Trainer Şəkli</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ marginBottom: "10px" }}
                            />
                            {preview && (
                              <img
                                src={preview}
                                alt="Preview"
                                width="200"
                                style={{
                                  borderRadius: "10px",
                                  marginBottom: "10px",
                                  display: "block",
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={handleUpload}
                              style={{ marginBottom: "10px" }}
                            >
                              Şəkil Yüklə
                            </button>

                            {(uploadedImageUrl || editData.imageUrl) && (
                              <div style={{ marginBottom: "10px" }}>
                                <label>Image URL</label>
                                <input
                                  value={
                                    uploadedImageUrl || editData.imageUrl || ""
                                  }
                                  onChange={(e) =>
                                    handleChange("imageUrl", e.target.value)
                                  }
                                  placeholder="Image URL"
                                  style={{ width: "100%", padding: "5px" }}
                                />
                                <img
                                  src={uploadedImageUrl || editData.imageUrl}
                                  alt="Trainer"
                                  width="350"
                                  style={{
                                    borderRadius: "10px",
                                    marginTop: "10px",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="socials-container">
                            <label>Sosial Media Linkləri</label>
                            {editData.socials &&
                              Object.keys(editData.socials).map((socialId) => {
                                const social = editData.socials[socialId];
                                return (
                                  <div key={socialId} className="social-item">
                                    <input
                                      value={social?.platform || ""}
                                      onChange={(e) =>
                                        updateSocialPlatform(
                                          socialId,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Platform adı (instagram, twitter)"
                                    />
                                    <input
                                      value={social?.url || ""}
                                      onChange={(e) =>
                                        updateSocialUrl(
                                          socialId,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Sosial Media Link URL (https://www.instagram.com/yourusername)"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeSocial(socialId)}
                                      className="remove-btn"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                );
                              })}
                            <button
                              type="button"
                              onClick={addSocial}
                              className="add-btn"
                            >
                              Sosial Media Link Əlavə et
                            </button>
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleSave("trainers", tr.id)}
                            >
                              Yadda saxla
                            </button>
                            <button
                              onClick={() => handleDelete("trainers", tr.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>{tr.name}</p>
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setEditId(tr.id);
                                setEditData({
                                  ...tr,
                                  socials: migrateSocials(tr.socials),
                                });
                                setPreview("");
                                setUploadedImageUrl("");
                              }}
                            >
                              Redaktə et
                            </button>
                            <button
                              onClick={() => handleDelete("trainers", tr.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "blogs" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Blog Postları</h2>
                  <button
                    onClick={() => handleCreate("blogs")}
                    className="create-btn"
                  >
                    Yeni Blog Post Əlavə et
                  </button>
                </div>
                <div className="items-grid">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="data-item">
                      {editId === blog.id ? (
                        <>
                          <label>Title</label>
                          <input
                            value={editData.title || ""}
                            onChange={(e) =>
                              handleChange("title", e.target.value)
                            }
                            placeholder="Blog post title"
                          />
                          <label>Məzmun</label>
                          <textarea
                            value={editData.content || ""}
                            onChange={(e) =>
                              handleChange("content", e.target.value)
                            }
                            placeholder="Blog yazısını buraya yazın..."
                            rows="12"
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          />
                          <label>Sırası</label>
                          <input
                            type="number"
                            value={editData.order || ""}
                            onChange={(e) =>
                              handleChange("order", parseInt(e.target.value))
                            }
                            placeholder="Display order"
                          />
                          <div className="image-upload-section">
                            <label>Blog Şəkli</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ marginBottom: "10px" }}
                            />
                            {preview && (
                              <img
                                src={preview}
                                alt="Preview"
                                width="350"
                                style={{
                                  borderRadius: "10px",
                                  marginBottom: "10px",
                                  display: "block",
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={handleUpload}
                              style={{ marginBottom: "10px" }}
                            >
                              Şəkil Yüklə
                            </button>
                            {uploadedImageUrl && (
                              <div style={{ marginBottom: "10px" }}>
                                <p
                                  style={{ color: "green", fontWeight: "bold" }}
                                >
                                  ✅ Şəkil uğurla yükləndi!
                                </p>
                                <p>Image URL (automatically set):</p>
                                <input
                                  value={uploadedImageUrl}
                                  onChange={(e) =>
                                    handleChange("imageUrl", e.target.value)
                                  }
                                  placeholder="Image URL"
                                  style={{
                                    width: "100%",
                                    padding: "5px",
                                    backgroundColor: "#f0f8ff",
                                  }}
                                  readOnly
                                />
                                <img
                                  src={uploadedImageUrl}
                                  alt="Uploaded"
                                  width="200"
                                  style={{
                                    borderRadius: "10px",
                                    marginTop: "10px",
                                    border: "2px solid green",
                                  }}
                                />
                              </div>
                            )}
                            {editData.imageUrl && !uploadedImageUrl && (
                              <div style={{ marginBottom: "10px" }}>
                                <label>Current Image URL:</label>
                                <input
                                  value={editData.imageUrl || ""}
                                  onChange={(e) =>
                                    handleChange("imageUrl", e.target.value)
                                  }
                                  placeholder="Image URL"
                                  style={{ width: "100%", padding: "5px" }}
                                />
                                {editData.imageUrl && (
                                  <img
                                    src={editData.imageUrl}
                                    alt="Current"
                                    width="200"
                                    style={{
                                      borderRadius: "10px",
                                      marginTop: "10px",
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleSave("blogs", blog.id)}
                            >
                              Yadda saxla
                            </button>
                            <button
                              onClick={() => handleDelete("blogs", blog.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: "10px" }}>
                            <h4>{blog.title}</h4>
                            <p style={{ fontSize: "14px", color: "#666" }}>
                              {blog.content?.substring(0, 100)}...
                            </p>
                            {blog.imageUrl && (
                              <img
                                src={blog.imageUrl}
                                alt="Blog"
                                width="150"
                                style={{
                                  borderRadius: "5px",
                                  marginTop: "10px",
                                }}
                              />
                            )}
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#999",
                                marginTop: "5px",
                              }}
                            >
                              Order: {blog.order} | Created:{" "}
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setEditId(blog.id);
                                setEditData(blog);
                                setUploadedImageUrl("");
                                setPreview("");
                              }}
                            >
                              Redaktə et
                            </button>
                            <button
                              onClick={() => handleDelete("blogs", blog.id)}
                              className="delete-btn"
                            >
                              Sil
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "about" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Haqqımızda Bölməsi</h2>
                  <button
                    onClick={async () => {
                      if (about) return;
                      await handleCreate("about");
                    }}
                    className="create-btn"
                  >
                    {about ? "" : "Create About"}
                  </button>
                </div>
                {about ? (
                  <div className="data-item">
                    <label>Başlıq</label>
                    <input
                      value={
                        editId === about.id
                          ? editData.title || ""
                          : about.title || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== about.id) {
                          setEditId(about.id);
                          setEditData({ ...about, title: value });
                        } else {
                          handleChange("title", value);
                        }
                      }}
                      placeholder="About section header"
                    />
                    <label>Paragraf</label>
                    <textarea
                      value={
                        editId === about.id
                          ? editData.text || ""
                          : about.text || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== about.id) {
                          setEditId(about.id);
                          setEditData({ ...about, text: value });
                        } else {
                          handleChange("text", value);
                        }
                      }}
                      placeholder="Write about the company's history..."
                      rows="12"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                    />
                    <div className="image-upload-section">
                      <label>Haqqımızda Şəkli</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ marginBottom: "10px" }}
                      />
                      {preview && (
                        <img
                          src={preview}
                          alt="Preview"
                          width="350"
                          style={{
                            borderRadius: "10px",
                            marginBottom: "10px",
                            display: "block",
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleUpload}
                        style={{ marginBottom: "10px" }}
                      >
                        Şəkil Yüklə
                      </button>
                      {(uploadedImageUrl ||
                        editData.imageUrl ||
                        about.imageUrl) && (
                        <div style={{ marginBottom: "10px" }}>
                          <label>Image URL</label>
                          <input
                            value={
                              uploadedImageUrl ||
                              (editId === about.id
                                ? editData.imageUrl || ""
                                : about.imageUrl || "")
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (editId !== about.id) {
                                setEditId(about.id);
                                setEditData({ ...about, imageUrl: value });
                              } else {
                                handleChange("imageUrl", value);
                              }
                            }}
                            placeholder="Image URL"
                            style={{ width: "100%", padding: "5px" }}
                          />
                          <img
                            src={
                              uploadedImageUrl ||
                              editData.imageUrl ||
                              about.imageUrl
                            }
                            alt="About"
                            width="200"
                            style={{ borderRadius: "10px", marginTop: "10px" }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={async () => {
                          if (!about) return;
                          await handleSave("about", about.id);
                          setAbout({ ...about, ...editData });
                        }}
                      >
                        Yadda saxla
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>No About content yet. Click "Create About" to add it.</p>
                )}
              </div>
            )}

            {selectedSection === "contact" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Kontakt Bölməsi</h2>
                  <button
                    onClick={async () => {
                      if (contact) return;
                      await handleCreate("contact");
                    }}
                    className="create-btn"
                  >
                    {contact ? "" : "Create Contact"}
                  </button>
                </div>
                {contact ? (
                  <div className="data-item">
                    <label>Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ marginBottom: "10px" }}
                    />
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        width="200"
                        style={{
                          borderRadius: "10px",
                          marginBottom: "10px",
                          display: "block",
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleUpload}
                      style={{ marginBottom: "10px" }}
                    >
                      Logo Yüklə
                    </button>
                    <input
                      value={
                        editId === contact.id
                          ? editData.logoUrl || ""
                          : contact.logoUrl || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== contact.id) {
                          setEditId(contact.id);
                          setEditData({ ...contact, logoUrl: value });
                        } else {
                          handleChange("logoUrl", value);
                        }
                      }}
                      placeholder="Logo URL"
                    />
                    {(uploadedImageUrl ||
                      editData.logoUrl ||
                      contact.logoUrl) && (
                      <img
                        src={
                          uploadedImageUrl ||
                          editData.logoUrl ||
                          contact.logoUrl
                        }
                        alt="Logo"
                        width="200"
                        style={{ borderRadius: "8px", marginTop: "10px" }}
                      />
                    )}

                    <div className="features-container">
                      <label>İş Saatları</label>
                      {(editId === contact.id
                        ? editData.hours || []
                        : contact.hours || []
                      ).map((h, idx) => (
                        <div key={idx} className="feature-item">
                          <input
                            value={h}
                            onChange={(e) => {
                              const value = e.target.value;
                              const base =
                                editId === contact.id ? editData : contact;
                              const hours = [...(base.hours || [])];
                              hours[idx] = value;
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, hours });
                              } else {
                                setEditData({ ...editData, hours });
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              const base =
                                editId === contact.id ? editData : contact;
                              const hours = [...(base.hours || [])];
                              hours.splice(idx, 1);
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, hours });
                              } else {
                                setEditData({ ...editData, hours });
                              }
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                          const base =
                            editId === contact.id ? editData : contact;
                          const hours = [...(base.hours || []), ""];
                          if (editId !== contact.id) {
                            setEditId(contact.id);
                            setEditData({ ...base, hours });
                          } else {
                            setEditData({ ...editData, hours });
                          }
                        }}
                      >
                        Saat Əlavə et
                      </button>
                    </div>

                    <div className="features-container">
                      <label>Telefon Nömrələri</label>
                      {(editId === contact.id
                        ? editData.phones || []
                        : contact.phones || []
                      ).map((p, idx) => (
                        <div key={idx} className="feature-item">
                          <input
                            value={p}
                            onChange={(e) => {
                              const value = e.target.value;
                              const base =
                                editId === contact.id ? editData : contact;
                              const phones = [...(base.phones || [])];
                              phones[idx] = value;
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, phones });
                              } else {
                                setEditData({ ...editData, phones });
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              const base =
                                editId === contact.id ? editData : contact;
                              const phones = [...(base.phones || [])];
                              phones.splice(idx, 1);
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, phones });
                              } else {
                                setEditData({ ...editData, phones });
                              }
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                          const base =
                            editId === contact.id ? editData : contact;
                          const phones = [...(base.phones || []), ""];
                          if (editId !== contact.id) {
                            setEditId(contact.id);
                            setEditData({ ...base, phones });
                          } else {
                            setEditData({ ...editData, phones });
                          }
                        }}
                      >
                        Telefon Nömrə Əlavə et
                      </button>
                    </div>
                    <label>Email</label>
                    <input
                      value={
                        editId === contact.id
                          ? editData.email || ""
                          : contact.email || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== contact.id) {
                          setEditId(contact.id);
                          setEditData({ ...contact, email: value });
                        } else {
                          handleChange("email", value);
                        }
                      }}
                      placeholder="email@domain.com"
                    />
                    <label>Adres</label>
                    <textarea
                      value={
                        editId === contact.id
                          ? editData.address || ""
                          : contact.address || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editId !== contact.id) {
                          setEditId(contact.id);
                          setEditData({ ...contact, address: value });
                        } else {
                          handleChange("address", value);
                        }
                      }}
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                    />

                    <div className="socials-container">
                      <label>Sosial Media Linkləri</label>
                      {(editId === contact.id
                        ? editData.socials || []
                        : contact.socials || []
                      ).map((s) => (
                        <div key={s.id} className="social-item">
                          <input
                            value={s.platform}
                            onChange={(e) => {
                              const value = e.target.value;
                              const base =
                                editId === contact.id ? editData : contact;
                              const socials = (base.socials || []).map((x) =>
                                x.id === s.id ? { ...x, platform: value } : x
                              );
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, socials });
                              } else {
                                setEditData({ ...editData, socials });
                              }
                            }}
                            placeholder="platform (e.g., instagram)"
                          />
                          <input
                            value={s.url}
                            onChange={(e) => {
                              const value = e.target.value;
                              const base =
                                editId === contact.id ? editData : contact;
                              const socials = (base.socials || []).map((x) =>
                                x.id === s.id ? { ...x, url: value } : x
                              );
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, socials });
                              } else {
                                setEditData({ ...editData, socials });
                              }
                            }}
                            placeholder="URL"
                          />
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              const base =
                                editId === contact.id ? editData : contact;
                              const socials = (base.socials || []).filter(
                                (x) => x.id !== s.id
                              );
                              if (editId !== contact.id) {
                                setEditId(contact.id);
                                setEditData({ ...base, socials });
                              } else {
                                setEditData({ ...editData, socials });
                              }
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                          const base =
                            editId === contact.id ? editData : contact;
                          const socials = [
                            ...(base.socials || []),
                            {
                              id: `soc_${Date.now()}_${Math.random()
                                .toString(36)
                                .slice(2, 7)}`,
                              platform: "",
                              url: "",
                            },
                          ];
                          if (editId !== contact.id) {
                            setEditId(contact.id);
                            setEditData({ ...base, socials });
                          } else {
                            setEditData({ ...editData, socials });
                          }
                        }}
                      >
                        Link əlavə et
                      </button>
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={async () => {
                          if (!contact) return;
                          await handleSave("contact", contact.id);
                          setContact({ ...contact, ...editData });
                        }}
                      >
                        Yadda saxla
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>
                    No Contact content yet. Click "Create Contact" to add it.
                  </p>
                )}
              </div>
            )}
            {selectedSection === "why" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Xidmət Bölməsi</h2>
                  <button
                    onClick={() => handleCreate("why")}
                    className="create-btn"
                  >
                    Xidmət Əlavə et
                  </button>
                </div>
                <div className="items-grid">
                  {whys
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((w) => (
                      <div key={w.id} className="data-item">
                        {editId === w.id ? (
                          <>
                            <label>Title</label>
                            <input
                              value={editData.title || ""}
                              onChange={(e) =>
                                handleChange("title", e.target.value)
                              }
                            />
                            <label>Açıqlaması</label>
                            <textarea
                              value={editData.text || ""}
                              onChange={(e) =>
                                handleChange("text", e.target.value)
                              }
                              rows="4"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                              }}
                            />
                            <label>Sırası</label>
                            <input
                              type="number"
                              value={editData.order || 0}
                              onChange={(e) =>
                                handleChange(
                                  "order",
                                  parseInt(e.target.value || 0)
                                )
                              }
                            />
                            <div className="image-upload-section">
                              <label>Şəkil</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ marginBottom: "10px" }}
                              />
                              {preview && (
                                <img
                                  src={preview}
                                  alt="Preview"
                                  width="350"
                                  style={{
                                    borderRadius: "10px",
                                    marginBottom: "10px",
                                    display: "block",
                                  }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={handleUpload}
                                style={{ marginBottom: "10px" }}
                              >
                                Şəkil Yüklə
                              </button>
                              {(uploadedImageUrl || editData.imageUrl) && (
                                <div style={{ marginBottom: "10px" }}>
                                  <label>Image URL</label>
                                  <input
                                    value={
                                      uploadedImageUrl ||
                                      editData.imageUrl ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleChange("imageUrl", e.target.value)
                                    }
                                    placeholder="Image URL"
                                    style={{ width: "100%,", padding: "5px" }}
                                  />
                                  {(uploadedImageUrl || editData.imageUrl) && (
                                    <img
                                      src={
                                        uploadedImageUrl || editData.imageUrl
                                      }
                                      alt="Why"
                                      width="200"
                                      style={{
                                        borderRadius: "10px",
                                        marginTop: "10px",
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="action-buttons">
                              <button onClick={() => handleSave("why", w.id)}>
                                Yadda saxla
                              </button>
                              <button
                                onClick={() => handleDelete("why", w.id)}
                                className="delete-btn"
                              >
                                Sil
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                              }}
                            >
                              {w.imageUrl ? (
                                <img
                                  src={w.imageUrl}
                                  alt={w.title}
                                  width="80"
                                  style={{ borderRadius: 8 }}
                                />
                              ) : null}
                              <div>
                                <h4 style={{ margin: 0 }}>{w.title}</h4>
                                <p style={{ margin: "6px 0", color: "#aaa" }}>
                                  {w.text}
                                </p>
                                <small style={{ color: "#888" }}>
                                  Order: {w.order || 0}
                                </small>
                              </div>
                            </div>
                            <div className="action-buttons">
                              <button
                                onClick={() => {
                                  setEditId(w.id);
                                  setEditData(w);
                                  setPreview("");
                                  setUploadedImageUrl("");
                                }}
                              >
                                Redaktə et
                              </button>
                              <button
                                onClick={() => handleDelete("why", w.id)}
                                className="delete-btn"
                              >
                                Sil
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
