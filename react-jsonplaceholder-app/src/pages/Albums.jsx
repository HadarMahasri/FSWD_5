import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Trash2, Edit2, Plus, Image as ImageIcon } from 'lucide-react';
import EditModal from '../components/EditModal';
import './Albums.css';

const AlbumsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, [user.id]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`http://localhost:5000/albums?userId=${user.id}`);
      setAlbums(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle) return;
    try {
      const saved = await apiFetch('http://localhost:5000/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: newAlbumTitle })
      });
      setAlbums([saved, ...albums]);
      setNewAlbumTitle('');
    } catch (err) { console.error(err); }
  };

  const filteredAlbums = albums.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toString().includes(search)
  );

  return (
    <div className="albums-list-view">
      <div className="card add-album-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleAddAlbum} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="New Album Title..."
            value={newAlbumTitle}
            onChange={e => setNewAlbumTitle(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Create</button>
        </form>
      </div>

      <div className="card search-card" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search albums by ID or Title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
        />
      </div>

      {loading ? <div className="loader"></div> : (
        <div className="albums-grid">
          {filteredAlbums.map(album => (
            <div key={album.id} className="card album-card" onClick={() => navigate(`${album.id}/photos`, { state: { album } })}>
              <div className="album-icon"><ImageIcon size={40} color="var(--primary)" /></div>
              <h4>{album.title}</h4>
              <span className="album-id">#{album.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [album, setAlbum] = useState(location.state?.album || null);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, title: '', initialValue: '', isTextarea: false, onSave: null });

  useEffect(() => {
    if (!album) {
      // Fetch album if not passed via state (e.g. direct URL visit)
      // Can't use await in useEffect directly, so define an async function inside
      const fetchAlbum = async () => {
        try {
          const data = await apiFetch(`http://localhost:5000/albums/${albumId}`);
          setAlbum(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchAlbum();
    }
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    fetchPhotos(albumId, 1);
  }, [albumId]);

  const fetchPhotos = async (id, pageNum) => {
    try {
      setLoadingPhotos(true);
      const data = await apiFetch(`http://localhost:5000/photos?albumId=${id}&_page=${pageNum}&_limit=12`);

      // json-server v1 pagination returns { data: [], items: ... }
      const fetchedPhotos = Array.isArray(data) ? data : (data.data || []);

      if (fetchedPhotos.length < 12) setHasMore(false);

      setPhotos(prev => pageNum === 1 ? fetchedPhotos : [...prev, ...fetchedPhotos]);
    } catch (err) { console.error(err); }
    finally { setLoadingPhotos(false); }
  };

  const loadMorePhotos = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(albumId, nextPage);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhoto.title || !newPhoto.url) return;
    try {
      // If albumId is fully numeric, parse it. Otherwise, keep it as string.
      const parsedAlbumId = /^\d+$/.test(albumId) ? Number(albumId) : albumId;

      const photoData = {
        albumId: parsedAlbumId,
        title: newPhoto.title,
        url: newPhoto.url,
        thumbnailUrl: newPhoto.url
      };
      const saved = await apiFetch('http://localhost:5000/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData)
      });
      setPhotos([saved, ...photos]);
      setNewPhoto({ title: '', url: '' });
    } catch (err) { console.error(err); }
  };

  const deletePhoto = async (id) => {
    try {
      await apiFetch(`http://localhost:5000/photos/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  const updatePhoto = async (id, title) => {
    try {
      const saved = await apiFetch(`http://localhost:5000/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      setPhotos(photos.map(p => p.id === id ? saved : p));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="album-detail-view">
      <button className="btn" style={{ marginBottom: '1rem', border: '1px solid var(--border)' }} onClick={() => navigate('..')}>
        &larr; Back to Albums
      </button>

      {album && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary)' }}>{album.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Album ID: #{album.id}</p>
        </div>
      )}

      <div className="card add-photo-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add Photo</h3>
        <form onSubmit={handleAddPhoto} className="add-photo-form">
          <input type="text" placeholder="Title" value={newPhoto.title} onChange={e => setNewPhoto({ ...newPhoto, title: e.target.value })} />
          <input type="text" placeholder="Image URL" value={newPhoto.url} onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Add</button>
        </form>
      </div>

      <div className="photos-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card card">
            <div className="photo-img-wrapper">
              <img src={photo.url} alt={photo.title} loading="lazy" />
            </div>
            <div className="photo-info">
              <p>{photo.title}</p>
              <div className="photo-actions">
                <button className="btn-icon" onClick={() => {
                  setEditModal({
                    isOpen: true,
                    title: 'Edit Photo Title',
                    initialValue: photo.title,
                    isTextarea: false,
                    onSave: (newTitle) => updatePhoto(photo.id, newTitle)
                  });
                }}><Edit2 size={14} /></button>
                <button className="btn-icon delete-btn" onClick={() => deletePhoto(photo.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loadingPhotos && <div className="loader" style={{ margin: '1rem auto' }}></div>}

      {!loadingPhotos && hasMore && (
        <div className="load-more-container">
          <button className="btn btn-primary" onClick={loadMorePhotos}>
            Load More Photos
          </button>
        </div>
      )}
      <EditModal 
        isOpen={editModal.isOpen} 
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        title={editModal.title}
        initialValue={editModal.initialValue}
        isTextarea={editModal.isTextarea}
        onSave={editModal.onSave}
      />
    </div>
  );
};

const Albums = () => {
  return (
    <div className="albums-page">
      <div className="page-header">
        <h1>My Albums</h1>
      </div>
      <Routes>
        <Route path="/" element={<AlbumsList />} />
        <Route path=":albumId/photos" element={<AlbumDetail />} />
      </Routes>
    </div>
  );
};

export default Albums;
