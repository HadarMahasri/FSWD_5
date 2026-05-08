import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, FileText, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const [recentTodos, setRecentTodos] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        // UPGRADE: Added sorting so it actually grabs the 3 NEWEST items, not the oldest!
        const [todos, posts, albums] = await Promise.all([
          apiFetch(`http://localhost:5000/todos?userId=${user.id}&_sort=id&_order=desc&_limit=3`),
          apiFetch(`http://localhost:5000/posts?userId=${user.id}&_sort=id&_order=desc&_limit=3`),
          apiFetch(`http://localhost:5000/albums?userId=${user.id}&_sort=id&_order=desc&_limit=3`),
        ]);

        setRecentTodos(todos);
        setRecentPosts(posts);
        setRecentAlbums(albums);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return (
    <div className="home-page">
      <div className="page-header home-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="home-header-subtitle">Here is what is happening in your network today.</p>
      </div>

      <div className="home-grid">
        {/* WIDGET 1: TODOS */}
        <div className="card home-widget-card">
          <div className="home-widget-header">
            <CheckSquare size={20} color="var(--primary)" />
            <h3>Recent Tasks</h3>
          </div>

          {loading ? (
            <div className="loader home-loader" />
          ) : recentTodos.length > 0 ? (
            <ul className="home-widget-list home-widget-list--todos">
              {recentTodos.map((todo) => (
                <li key={todo.id} className="home-item home-item--todo">
                  <div className="home-item-body">
                    <div className="home-item-title">
                      {todo.title}
                    </div>
                    <div className="home-item-meta">
                      <span className={todo.completed ? 'home-pill home-pill--success' : 'home-pill home-pill--warning'}>
                        {todo.completed ? 'Completed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-empty">No tasks yet.</p>
          )}

          <div className="home-widget-footer">
            <Link to="/todos" className="home-widget-link">
              View All Todos &rarr;
            </Link>
          </div>
        </div>

        {/* WIDGET 2: POSTS */}
        <div className="card home-widget-card">
          <div className="home-widget-header">
            <FileText size={20} color="var(--primary)" />
            <h3>Latest Thoughts</h3>
          </div>

          {loading ? (
            <div className="loader home-loader" />
          ) : recentPosts.length > 0 ? (
            <ul className="home-widget-list home-widget-list--posts">
              {recentPosts.map((post) => (
                <li key={post.id} className="home-item home-item--post">
                  <div className="home-post-topline">
                    <p className="home-item-title home-item-title--post">
                      {post.title}
                    </p>
                  </div>
                  <p className="home-item-copy">
                    {(post.body || '').slice(0, 90)}
                    {(post.body || '').length > 90 ? '...' : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-empty">No posts yet.</p>
          )}

          <div className="home-widget-footer">
            <Link to="/posts" className="home-widget-link">
              View All Posts &rarr;
            </Link>
          </div>
        </div>

        {/* WIDGET 3: ALBUMS */}
        <div className="card home-widget-card">
          <div className="home-widget-header">
            <Image size={20} color="var(--primary)" />
            <h3>Recent Albums</h3>
          </div>

          {loading ? (
            <div className="loader home-loader" />
          ) : recentAlbums.length > 0 ? (
            <ul className="home-widget-list home-widget-list--albums">
              {recentAlbums.map((album) => (
                <li key={album.id} className="home-item home-item--album">
                  <div className="home-item-badge home-item-badge--album">
                    <Image size={18} />
                  </div>
                  <div className="home-item-body">
                    <div className="home-item-title">
                      {album.title}
                    </div>
                    <div className="home-item-meta">
                      <span className="home-item-submeta">
                        Collection #{album.id}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-empty">No albums yet.</p>
          )}

          <div className="home-widget-footer">
            <Link to="/albums" className="home-widget-link">
              View All Albums &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;