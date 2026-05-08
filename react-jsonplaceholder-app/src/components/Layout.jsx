import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ListTodo, FileText, Image as ImageIcon, Home as HomeIcon, User } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Task Gallery</h2>
          <p className="user-greeting">Welcome, {user?.name}</p>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/home" className={({isActive}) => isActive ? 'active' : ''}>
              <HomeIcon size={20} /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/todos" className={({isActive}) => isActive ? 'active' : ''}>
              <ListTodo size={20} /> Todos
            </NavLink>
          </li>
          <li>
            <NavLink to="/posts" className={({isActive}) => isActive ? 'active' : ''}>
              <FileText size={20} /> My Posts
            </NavLink>
          </li>
          <li>
            <NavLink to="/all-posts" className={({isActive}) => isActive ? 'active' : ''}>
              <FileText size={20} /> All Posts
            </NavLink>
          </li>
          <li>
            <NavLink to="/albums" className={({isActive}) => isActive ? 'active' : ''}>
              <ImageIcon size={20} /> Albums
            </NavLink>
          </li>
          <li>
            <button onClick={() => setShowInfo(true)} className="nav-link-btn" style={{ marginTop: '37px'}}>
              <User size={20} /> Info
            </button>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger" style={{width: '100%'}}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>


      <main className="main-content">
        <Outlet />
      </main>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>User Information</h3>
            <div className="info-grid" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
              {user?.company?.name && <p><strong>Company:</strong> {user?.company?.name}</p>}
            </div>
            <button className="btn btn-primary" onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
