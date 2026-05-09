import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    website: '', // Using website for consistency
    verifyWebsite: '',
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, checkUserExists } = useAuth();
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.website || !formData.verifyWebsite) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.website !== formData.verifyWebsite) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const exists = await checkUserExists(formData.username);
      if (exists) {
        setError('Username already exists');
        setLoading(false);
        return;
      }
      setStep(2);
    } catch {
      setError('Server connection failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email) {
      setError('Name and Email are required');
      return;
    }

    setLoading(true);
    const dataToSave = { ...formData }; 
    delete dataToSave.verifyWebsite;   // Remove verifyWebsite before sending to server
    const res = await register(dataToSave);
    
    if (res.success) {
      navigate(`/users/${res.user.id}/home`);
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <UserPlus size={40} color="var(--primary)" style={{margin: '0 auto 1rem'}} />
        <h2>Create Account</h2>
        
        {step === 1 ? (
          <form onSubmit={handleNext}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="website">Password</label>
              <input 
                type="password" 
                id="website" 
                value={formData.website} 
                onChange={(e) => setFormData({...formData, website: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="verifyWebsite">Verify Password</label>
              <input 
                type="password" 
                id="verifyWebsite" 
                value={formData.verifyWebsite} 
                onChange={(e) => setFormData({...formData, verifyWebsite: e.target.value})} 
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
              {loading ? 'Checking...' : 'Next Step'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="text" 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button type="button" className="btn" onClick={() => setStep(1)} style={{flex: 1, border: '1px solid var(--border)'}}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={loading}>
                {loading ? 'Creating...' : 'Register'}
              </button>
            </div>
          </form>
        )}
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;
