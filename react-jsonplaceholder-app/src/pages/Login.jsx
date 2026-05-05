import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState(''); // Used as password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !website) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const res = await login(username, website);
    if (res.success) {
      navigate('/home');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <LogIn size={40} color="var(--primary)" style={{margin: '0 auto 1rem'}} />
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="e.g. Bret"
            />
          </div>
          <div className="input-group">
            <label htmlFor="website">Password (Website)</label>
            <input 
              type="password" 
              id="website" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)} 
              placeholder="e.g. hildegard.org"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;
