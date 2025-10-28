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
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("packages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        const aboutSnap = await getDocs(collection(db, "about"));
        setTrainers(trainerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPackages(packageSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setBlogs(blogSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        const aboutDoc = aboutSnap.docs[0]
          ? { id: aboutSnap.docs[0].id, ...aboutSnap.docs[0].data() }
          : null;
        setAbout(aboutDoc);
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
          name: "New Package",
          price: "0",
          time: "1 hour",
          order: packages.length + 1,
          features: ["Feature 1", "Feature 2"],
        };
      } else if (type === "trainers") {
        newItem = {
          name: "New Trainer",
          order: trainers.length + 1,
          socials: {},
        };
      } else if (type === "blogs") {
        newItem = {
          title: "New Blog Post",
          content: "Write your blog content here...",
          imageUrl: "",
          createdAt: new Date().toISOString(),
          order: blogs.length + 1,
        };
      } else if (type === "about") {
        newItem = {
          title: "About Our Company",
          text: "Write about the company's history and mission here...",
          imageUrl: "",
        };
      }

      const docRef = await addDoc(collection(db, type), newItem);

      if (type === "trainers") {
        setTrainers([...trainers, { id: docRef.id, ...newItem }]);
      } else if (type === "packages") {
        setPackages([...packages, { id: docRef.id, ...newItem }]);
      } else if (type === "blogs") {
        setBlogs([...blogs, { id: docRef.id, ...newItem }]);
      } else if (type === "about") {
        const created = { id: docRef.id, ...newItem };
        setAbout(created);
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
      alert("Please select an image first!");
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedImage.size > maxSize) {
      alert("File size too large. Maximum size is 10MB. Please choose a smaller image.");
      return;
    }

    try {
      alert("Uploading image...");
      const imageUrl = await uploadToCloudinary(selectedImage);
      
      setUploadedImageUrl(imageUrl);
      // Automatically update the imageUrl field in editData
      setEditData({ ...editData, imageUrl });
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! Please check your Cloudinary settings.");
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
            placeholder="Password"
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
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-layout">
          <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
            <button
              className={`nav-item ${selectedSection === "packages" ? "active" : ""}`}
              onClick={() => setSelectedSection("packages")}
            >
              Packages
            </button>
            <button
              className={`nav-item ${selectedSection === "trainers" ? "active" : ""}`}
              onClick={() => setSelectedSection("trainers")}
            >
              Trainers
            </button>
            <button
              className={`nav-item ${selectedSection === "blogs" ? "active" : ""}`}
              onClick={() => setSelectedSection("blogs")}
            >
              Blog
            </button>
            <button
              className={`nav-item ${selectedSection === "about" ? "active" : ""}`}
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
              About
            </button>
          </aside>
          <main className="content">
            {selectedSection === "packages" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Packages</h2>
                  <button
                    onClick={() => handleCreate("packages")}
                    className="create-btn"
                  >
                    Add New Package
                  </button>
                </div>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="data-item">
                    {editId === pkg.id ? (
                      <>
                        <label>Name</label>
                        <input
                          value={editData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                        <label>Price</label>
                        <input
                          value={editData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                        />
                        <label>Time</label>
                        <input
                          value={editData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                        />
                        <label>Order</label>
                        <input
                          value={editData.order}
                          onChange={(e) => handleChange("order", e.target.value)}
                        />
                        <div className="features-container">
                          <label>Features</label>
                          {(Array.isArray(editData.features) ? editData.features : []).map((f, idx) => (
                            <div key={idx} className="feature-item">
                              <input
                                value={f || ""}
                                onChange={(e) =>
                                  handleChange("features", e.target.value, null, idx)
                                }
                                placeholder={`Feature ${idx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeFeature(idx)}
                                className="remove-btn"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={addFeature} className="add-btn">
                            Add Feature
                          </button>
                        </div>
                        <div className="action-buttons">
                          <button onClick={() => handleSave("packages", pkg.id)}>Save</button>
                          <button onClick={() => handleDelete("packages", pkg.id)} className="delete-btn">
                            Delete
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
                            Edit
                          </button>
                          <button onClick={() => handleDelete("packages", pkg.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "trainers" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Trainers</h2>
                  <button onClick={() => handleCreate("trainers")} className="create-btn">
                    Add New Trainer
                  </button>
                </div>
                {trainers.map((tr) => (
                  <div key={tr.id} className="data-item">
                    {editId === tr.id ? (
                      <>
                        <label>Name</label>
                        <input
                          value={editData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                        <label>Order</label>
                        <input
                          value={editData.order}
                          onChange={(e) => handleChange("order", e.target.value)}
                        />
                        <div className="socials-container">
                          <label>Social Links</label>
                          {editData.socials &&
                            Object.keys(editData.socials).map((socialId) => {
                              const social = editData.socials[socialId];
                              return (
                                <div key={socialId} className="social-item">
                                  <input
                                    value={social?.platform || ""}
                                    onChange={(e) => updateSocialPlatform(socialId, e.target.value)}
                                    placeholder="Platform name (e.g., instagram, twitter)"
                                  />
                                  <input
                                    value={social?.url || ""}
                                    onChange={(e) => updateSocialUrl(socialId, e.target.value)}
                                    placeholder="Social link URL"
                                  />
                                  <button type="button" onClick={() => removeSocial(socialId)} className="remove-btn">
                                    Remove
                                  </button>
                                </div>
                              );
                            })}
                          <button type="button" onClick={addSocial} className="add-btn">
                            Add Social Link
                          </button>
                        </div>
                        <div className="action-buttons">
                          <button onClick={() => handleSave("trainers", tr.id)}>Save</button>
                          <button onClick={() => handleDelete("trainers", tr.id)} className="delete-btn">
                            Delete
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
                            }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete("trainers", tr.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "blogs" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>Blog Posts</h2>
                  <button onClick={() => handleCreate("blogs")} className="create-btn">
                    Add New Blog Post
                  </button>
                </div>
                {blogs.map((blog) => (
                  <div key={blog.id} className="data-item">
                    {editId === blog.id ? (
                      <>
                        <label>Title</label>
                        <input
                          value={editData.title || ""}
                          onChange={(e) => handleChange("title", e.target.value)}
                          placeholder="Blog post title"
                        />
                        <label>Content</label>
                        <textarea
                          value={editData.content || ""}
                          onChange={(e) => handleChange("content", e.target.value)}
                          placeholder="Write your blog content here..."
                          rows="6"
                          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                        <label>Order</label>
                        <input
                          type="number"
                          value={editData.order || ""}
                          onChange={(e) => handleChange("order", parseInt(e.target.value))}
                          placeholder="Display order"
                        />
                        <div className="image-upload-section">
                          <label>Blog Image</label>
                          <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
                          {preview && (
                            <img
                              src={preview}
                              alt="Preview"
                              width="200"
                              style={{ borderRadius: "10px", marginBottom: "10px", display: "block" }}
                            />
                          )}
                          <button type="button" onClick={handleUpload} style={{ marginBottom: "10px" }}>
                            Upload Image
                          </button>
                          {uploadedImageUrl && (
                            <div style={{ marginBottom: "10px" }}>
                              <p style={{ color: "green", fontWeight: "bold" }}>✅ Image uploaded successfully!</p>
                              <p>Image URL (automatically set):</p>
                              <input
                                value={uploadedImageUrl}
                                onChange={(e) => handleChange("imageUrl", e.target.value)}
                                placeholder="Image URL"
                                style={{ width: "100%", padding: "5px", backgroundColor: "#f0f8ff" }}
                                readOnly
                              />
                              <img src={uploadedImageUrl} alt="Uploaded" width="200" style={{ borderRadius: "10px", marginTop: "10px", border: "2px solid green" }} />
                            </div>
                          )}
                          {editData.imageUrl && !uploadedImageUrl && (
                            <div style={{ marginBottom: "10px" }}>
                              <label>Current Image URL:</label>
                              <input
                                value={editData.imageUrl || ""}
                                onChange={(e) => handleChange("imageUrl", e.target.value)}
                                placeholder="Image URL"
                                style={{ width: "100%", padding: "5px" }}
                              />
                              {editData.imageUrl && (
                                <img src={editData.imageUrl} alt="Current" width="200" style={{ borderRadius: "10px", marginTop: "10px" }} />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="action-buttons">
                          <button onClick={() => handleSave("blogs", blog.id)}>Save</button>
                          <button onClick={() => handleDelete("blogs", blog.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: "10px" }}>
                          <h4>{blog.title}</h4>
                          <p style={{ fontSize: "14px", color: "#666" }}>{blog.content?.substring(0, 100)}...</p>
                          {blog.imageUrl && (
                            <img src={blog.imageUrl} alt="Blog" width="150" style={{ borderRadius: "5px", marginTop: "10px" }} />
                          )}
                          <p style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                            Order: {blog.order} | Created: {new Date(blog.createdAt).toLocaleDateString()}
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
                            Edit
                          </button>
                          <button onClick={() => handleDelete("blogs", blog.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "about" && (
              <div className="admin-card">
                <div className="card-header">
                  <h2>About Section</h2>
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
                    <label>Header</label>
                    <input
                      value={editId === about.id ? (editData.title || "") : (about.title || "")}
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
                    <label>Paragraph</label>
                    <textarea
                      value={editId === about.id ? (editData.text || "") : (about.text || "")}
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
                      rows="6"
                      style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                    />
                    <div className="image-upload-section">
                      <label>About Image</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
                      {preview && (
                        <img src={preview} alt="Preview" width="200" style={{ borderRadius: "10px", marginBottom: "10px", display: "block" }} />
                      )}
                      <button type="button" onClick={handleUpload} style={{ marginBottom: "10px" }}>
                        Upload Image
                      </button>
                      {(uploadedImageUrl || editData.imageUrl || about.imageUrl) && (
                        <div style={{ marginBottom: "10px" }}>
                          <label>Image URL</label>
                          <input
                            value={uploadedImageUrl || (editId === about.id ? (editData.imageUrl || "") : (about.imageUrl || ""))}
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
                            src={uploadedImageUrl || editData.imageUrl || about.imageUrl}
                            alt="About"
                            width="200"
                            style={{ borderRadius: "10px", marginTop: "10px" }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="action-buttons">
                      <button onClick={async () => {
                        if (!about) return;
                        await handleSave("about", about.id);
                        setAbout({ ...about, ...editData });
                      }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p>No About content yet. Click "Create About" to add it.</p>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
