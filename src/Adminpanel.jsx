import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import "./Adminpanel.css";

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); // ID of the item currently being edited
  const [editData, setEditData] = useState({}); // Temporary store for edited data

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainerSnap = await getDocs(collection(db, "trainers"));
        const packageSnap = await getDocs(collection(db, "packages"));
        setTrainers(trainerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPackages(packageSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  // Add new feature to the features array
  const addFeature = () => {
    const currentFeatures = Array.isArray(editData.features) ? editData.features : [];
    setEditData({ ...editData, features: [...currentFeatures, ''] });
  };

  // Remove feature from the features array
  const removeFeature = (index) => {
    const currentFeatures = Array.isArray(editData.features) ? editData.features : [];
    const newFeatures = currentFeatures.filter((_, idx) => idx !== index);
    setEditData({ ...editData, features: newFeatures });
  };

  // Add new social link to the socials object
  const addSocial = () => {
    const currentSocials = editData.socials || {};
    const socialId = `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setEditData({ ...editData, socials: { ...currentSocials, [socialId]: { platform: '', url: '' } } });
  };

  // Remove social link from the socials object
  const removeSocial = (socialId) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    delete newSocials[socialId];
    setEditData({ ...editData, socials: newSocials });
  };

  // Update social platform name
  const updateSocialPlatform = (socialId, newPlatform) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    if (newSocials[socialId]) {
      newSocials[socialId] = { ...newSocials[socialId], platform: newPlatform };
      setEditData({ ...editData, socials: newSocials });
    }
  };

  // Update social URL
  const updateSocialUrl = (socialId, newUrl) => {
    const currentSocials = editData.socials || {};
    const newSocials = { ...currentSocials };
    if (newSocials[socialId]) {
      newSocials[socialId] = { ...newSocials[socialId], url: newUrl };
      setEditData({ ...editData, socials: newSocials });
    }
  };

  // Migrate old socials format to new format
  const migrateSocials = (socials) => {
    if (!socials) return {};
    const migrated = {};
    Object.keys(socials).forEach(key => {
      const value = socials[key];
      if (typeof value === 'string') {
        // Old format: { "instagram": "https://..." }
        const socialId = `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        migrated[socialId] = { platform: key, url: value };
      } else if (typeof value === 'object' && value.platform !== undefined) {
        // New format: { "social_123": { platform: "instagram", url: "https://..." } }
        migrated[key] = value;
      }
    });
    return migrated;
  };

  // Handle input changes in edit mode
  const handleChange = (field, value, subfield = null, index = null) => {
    if (index !== null) {
      // Updating array item (features)
      const currentArray = Array.isArray(editData[field]) ? editData[field] : [];
      const arrCopy = [...currentArray];
      arrCopy[index] = value;
      setEditData({ ...editData, [field]: arrCopy });
    } else if (subfield !== null) {
      setEditData({ ...editData, [field]: { ...editData[field], [subfield]: value } });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  // Save to Firebase
  const handleSave = async (type, id) => {
    try {
      // Convert socials back to simple key-value format for Firebase
      let dataToSave = { ...editData };
      if (type === "trainers" && editData.socials) {
        const simpleSocials = {};
        Object.keys(editData.socials).forEach(socialId => {
          const social = editData.socials[socialId];
          if (social.platform && social.url) {
            simpleSocials[social.platform] = social.url;
          }
        });
        dataToSave.socials = simpleSocials;
      }

      await updateDoc(doc(db, type, id), dataToSave);
      setEditId(null);

      // Update local state after saving
      if (type === "trainers") {
        setTrainers(trainers.map(t => (t.id === id ? dataToSave : t)));
      } else {
        setPackages(packages.map(p => (p.id === id ? dataToSave : p)));
      }
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  // Delete item from Firebase
  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      try {
        await deleteDoc(doc(db, type, id));
        
        // Update local state after deleting
        if (type === "trainers") {
          setTrainers(trainers.filter(t => t.id !== id));
        } else {
          setPackages(packages.filter(p => p.id !== id));
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
          features: ["Feature 1", "Feature 2"]
        };
      } else {
        newItem = {
          name: "New Trainer",
          order: trainers.length + 1,
          socials: {}
        };
      }

      const docRef = await addDoc(collection(db, type), newItem);
      
      // Update local state after creating
      if (type === "trainers") {
        setTrainers([...trainers, { id: docRef.id, ...newItem }]);
      } else {
        setPackages([...packages, { id: docRef.id, ...newItem }]);
      }

      // Automatically start editing the new item
      setEditId(docRef.id);
      setEditData({ id: docRef.id, ...newItem });
    } catch (err) {
      console.error("Error creating data:", err);
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Admin Login</h2>
          {error && <p className="error">{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-grid">

          {/* Packages */}
<div className="admin-card">
  <div className="card-header">
    <h2>Packages</h2>
    <button onClick={() => handleCreate("packages")} className="create-btn">Add New Package</button>
  </div>
  {packages.map(pkg => (
    <div key={pkg.id} className="data-item">
      {editId === pkg.id ? (
        <>
          <label>Name</label>
          <input value={editData.name} onChange={e => handleChange("name", e.target.value)} />

          <label>Price</label>
          <input value={editData.price} onChange={e => handleChange("price", e.target.value)} />

          <label>Time</label>
          <input value={editData.time} onChange={e => handleChange("time", e.target.value)} />

          <label>Order</label>
          <input value={editData.order} onChange={e => handleChange("order", e.target.value)} />

          <div className="features-container">
            <label>Features</label>
            {(Array.isArray(editData.features) ? editData.features : []).map((f, idx) => (
              <div key={idx} className="feature-item">
                <input value={f || ''} onChange={e => handleChange("features", e.target.value, null, idx)} placeholder={`Feature ${idx + 1}`} />
                <button type="button" onClick={() => removeFeature(idx)} className="remove-btn">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addFeature} className="add-btn">Add Feature</button>
          </div>

          <div className="action-buttons">
            <button onClick={() => handleSave("packages", pkg.id)}>Save</button>
            <button onClick={() => handleDelete("packages", pkg.id)} className="delete-btn">Delete</button>
          </div>
        </>
      ) : (
        <>
          <p>{pkg.name} - {pkg.price} {pkg.time}</p>
          <div className="action-buttons">
            <button onClick={() => { setEditId(pkg.id); setEditData(pkg); }}>Edit</button>
            <button onClick={() => handleDelete("packages", pkg.id)} className="delete-btn">Delete</button>
          </div>
        </>
      )}
    </div>
  ))}
</div>

{/* Trainers */}
<div className="admin-card">
  <div className="card-header">
    <h2>Trainers</h2>
    <button onClick={() => handleCreate("trainers")} className="create-btn">Add New Trainer</button>
  </div>
  {trainers.map(tr => (
    <div key={tr.id} className="data-item">
      {editId === tr.id ? (
        <>
          <label>Name</label>
          <input value={editData.name} onChange={e => handleChange("name", e.target.value)} />

          <label>Order</label>
          <input value={editData.order} onChange={e => handleChange("order", e.target.value)} />

          <div className="socials-container">
            <label>Social Links</label>
            {editData.socials && Object.keys(editData.socials).map(socialId => {
              const social = editData.socials[socialId];
              return (
                <div key={socialId} className="social-item">
                  <input 
                    value={social?.platform || ''} 
                    onChange={e => updateSocialPlatform(socialId, e.target.value)}
                    placeholder="Platform name (e.g., instagram, twitter)"
                  />
                  <input 
                    value={social?.url || ''} 
                    onChange={e => updateSocialUrl(socialId, e.target.value)} 
                    placeholder="Social link URL"
                  />
                  <button type="button" onClick={() => removeSocial(socialId)} className="remove-btn">Remove</button>
                </div>
              );
            })}
            <button type="button" onClick={addSocial} className="add-btn">Add Social Link</button>
          </div>

          <div className="action-buttons">
            <button onClick={() => handleSave("trainers", tr.id)}>Save</button>
            <button onClick={() => handleDelete("trainers", tr.id)} className="delete-btn">Delete</button>
          </div>
        </>
      ) : (
        <>
          <p>{tr.name}</p>
          <div className="action-buttons">
            <button onClick={() => { 
              setEditId(tr.id); 
              setEditData({ 
                ...tr, 
                socials: migrateSocials(tr.socials) 
              }); 
            }}>Edit</button>
            <button onClick={() => handleDelete("trainers", tr.id)} className="delete-btn">Delete</button>
          </div>
        </>
      )}
    </div>
  ))}
</div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
