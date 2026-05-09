import React, { useState, useEffect } from 'react';

const EditModal = ({ isOpen, onClose, onSave, initialValue, title, isTextarea = false }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(value);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            {isTextarea ? (
              <textarea 
                value={value} 
                onChange={e => setValue(e.target.value)}
                className="post-textarea"
                rows={6}
                autoFocus
                style={{ width: '100%' }}
              />
            ) : (
              <input 
                type="text" 
                value={value} 
                onChange={e => setValue(e.target.value)}
                autoFocus
                style={{ width: '100%' }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} style={{ border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
