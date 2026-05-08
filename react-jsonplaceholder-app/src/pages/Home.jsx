import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
      </div>
      <div className="card">
        <h3>Overview</h3>
        <p style={{marginTop: '1rem', color: 'var(--text-muted)'}}>
          Use the sidebar navigation to view your Todos, Posts, and Albums.
          All data is linked to your user account (ID: {user?.id}).
        </p>
      </div>
    </div>
  );
};

export default Home;
