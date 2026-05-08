import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Trash2, Edit2, Plus, MessageSquare } from 'lucide-react';
import './Posts.css';

const PostDetail = ({ posts, updatePost }) => {
  const { postId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  
  const selectedPost = posts.find(p => p.id.toString() === postId) || location.state?.post;
  
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => {
    // Reset comments view when selecting a different post
    setShowComments(false);
    setComments([]);

    // On mobile, scroll to the details section when a post is selected
    if (detailRef.current && window.innerWidth < 900) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPost?.id]);

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments(selectedPost.id);
    }
    setShowComments(!showComments);
  };

  const fetchComments = async (id) => {
    try {
      setLoadingComments(true);
      const data = await apiFetch(`http://localhost:5000/comments`);
      setComments(data.filter(c => String(c.postId) === String(id)));
    } catch (err) { console.error(err); } 
    finally { setLoadingComments(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    try {
      const commentData = {
        postId: selectedPost.id,
        name: user.name,
        email: user.email,
        body: newComment
      };
      const saved = await apiFetch('http://localhost:5000/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      setComments([...comments, saved]);
      setNewComment('');
    } catch (err) { console.error(err); }
  };

  const deleteComment = async (id) => {
    try {
      await apiFetch(`http://localhost:5000/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  const updateComment = async (id, body) => {
    try {
      const saved = await apiFetch(`http://localhost:5000/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      setComments(comments.map(c => c.id === id ? saved : c));
    } catch (err) { console.error(err); }
  };

  if (!selectedPost) return <div className="loader" style={{margin: '2rem auto'}}></div>;

  return (
    <div className="post-detail-section" ref={detailRef}>
      <div className="card full-post" style={{marginBottom: '1.5rem'}}>
        <h2 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>{selectedPost.title}</h2>
        <div className="post-meta" style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
          Post ID: #{selectedPost.id}
        </div>
        <div className="post-body" style={{position: 'relative'}}>
          <p style={{whiteSpace: 'pre-wrap'}}>{selectedPost.body}</p>
          {selectedPost.userId === user.id && (
            <button className="btn-icon" style={{position: 'absolute', top: 0, right: 0}} onClick={() => {
              const newBody = prompt('Edit content:', selectedPost.body);
              if (newBody) updatePost(selectedPost.id, {body: newBody});
            }}><Edit2 size={16}/></button>
          )}
        </div>
      </div>

      <div className="card comments-section">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0}}>
            <MessageSquare size={20} /> Comments
          </h3>
          <button className="btn btn-primary" onClick={handleToggleComments} style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>
        
        {showComments && (
          <>
            {loadingComments ? <div className="loader" style={{margin: '1rem auto'}}></div> : (
              <ul className="comments-list">
                {comments.length === 0 ? <p className="empty-msg">No comments yet.</p> : null}
                {comments.map(c => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{c.name}</strong> <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>({c.email})</span>
                    </div>
                    <p className="comment-body">{c.body}</p>
                    
                    {c.email === user.email && (
                      <div className="comment-actions">
                        <button className="btn-icon" onClick={() => {
                          const newBody = prompt('Edit comment:', c.body);
                          if (newBody) updateComment(c.id, newBody);
                        }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon delete-btn" onClick={() => deleteComment(c.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddComment} className="add-comment-form">
              <input 
                type="text" 
                placeholder="Write a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const Posts = ({ mode = 'my' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [newPost, setNewPost] = useState({ title: '', body: '' });

  useEffect(() => {
    fetchPosts();
  }, [user.id, mode]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = mode === 'all' 
        ? 'http://localhost:5000/posts' 
        : `http://localhost:5000/posts?userId=${user.id}`;
      const data = await apiFetch(url);
      setPosts(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.body) return;
    try {
      const saved = await apiFetch('http://localhost:5000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPost, userId: user.id })
      });
      setPosts([saved, ...posts]);
      setNewPost({ title: '', body: '' });
    } catch (err) { console.error(err); }
  };

  const deletePost = async (id) => {
    try {
      await apiFetch(`http://localhost:5000/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
      if (location.pathname.includes(`/posts/${id}/comments`)) {
        navigate('/posts');
      }
    } catch (err) { console.error(err); }
  };

  const updatePost = async (id, updatedData) => {
    try {
      const saved = await apiFetch(`http://localhost:5000/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      setPosts(posts.map(p => p.id === id ? saved : p));
    } catch (err) { console.error(err); }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toString().includes(search)
  );

  const basePath = mode === 'all' ? '/all-posts' : '/posts';

  return (
    <div className="posts-page">
      <div className="page-header">
        <h1>{mode === 'all' ? 'All Posts' : 'My Posts'}</h1>
      </div>

      <div className="posts-layout">
        <div className="posts-list-section">
          {mode === 'my' && (
            <div className="card add-post-card">
              <h3>Add New Post</h3>
              <form onSubmit={handleAddPost}>
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Post Title" 
                    value={newPost.title} 
                    onChange={e => setNewPost({...newPost, title: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <textarea 
                    placeholder="Post Content" 
                    value={newPost.body}
                    onChange={e => setNewPost({...newPost, body: e.target.value})}
                    rows={3}
                    className="post-textarea"
                  />
                </div>
                <button className="btn btn-primary"><Plus size={18} /> Add Post</button>
              </form>
            </div>
          )}

          <div className="card search-card" style={{marginBottom: '1.5rem'}}>
            <div className="input-group" style={{marginBottom: 0}}>
              <input 
                type="text" 
                placeholder="Search posts by ID or Title..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? <div className="loader"></div> : (
            <ul className="posts-list">
              {filteredPosts.map(post => {
                const isSelected = location.pathname.includes(`/posts/${post.id}/comments`);
                return (
                  <li 
                    key={post.id} 
                    className={`card post-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => navigate(`${basePath}/${post.id}/comments`, { state: { post } })}
                  >
                    <div className="post-item-header">
                      <span className="post-id">#{post.id}</span>
                      <h4 className="post-title">{post.title}</h4>
                    </div>
                    <div className="post-actions" onClick={e => e.stopPropagation()}>
                      {post.userId === user.id && (
                        <>
                          <button className="btn-icon" onClick={() => {
                             const newTitle = prompt('Edit Title:', post.title);
                             if(newTitle) updatePost(post.id, {title: newTitle});
                          }}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon delete-btn" onClick={() => deletePost(post.id)}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Routes>
          <Route path=":postId/comments" element={<PostDetail posts={posts} updatePost={updatePost} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Posts;
