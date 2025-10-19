import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./BlogPage.css";

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogDoc = await getDoc(doc(db, "blogs", id));
        if (blogDoc.exists()) {
          setBlog({ id: blogDoc.id, ...blogDoc.data() });
        } else {
          setError("Blog post not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-loading">
          <div className="spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-page">
        <div className="blog-error">
          <h2>Oops!</h2>
          <p>{error || "Blog post not found"}</p>
          <button onClick={() => navigate("/")} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-container">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Home
        </button>
        
        <article className="blog-article">
          <header className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-meta">
              <span className="blog-date">
                Published on {new Date(blog.createdAt).toLocaleDateString('az-AZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </header>

          {blog.imageUrl && (
            <div className="blog-featured-image">
              <img src={blog.imageUrl} alt={blog.title} />
            </div>
          )}

          <div className="blog-content">
            <div className="blog-text">
              {blog.content?.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <footer className="blog-footer">
            <div className="blog-tags">
              <span className="tag">Pilates</span>
              <span className="tag">Health</span>
              <span className="tag">Fitness</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default BlogPage;
