import React, { useState, useRef } from 'react';
import { X, ImagePlus, Trash2 } from 'lucide-react';

interface CreatePostFormProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      setError('Maximum 5 images allowed.');
      return;
    }

    const validFiles = files.filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type));
    if (validFiles.length < files.length) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`${API_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        onPostCreated();
        onClose();
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create a Post</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="post-title">Title</label>
              <input
                id="post-title"
                className="form-input"
                type="text"
                placeholder="An interesting title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-content">Content</label>
              <textarea
                id="post-content"
                className="form-textarea"
                placeholder="What are your thoughts?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Images (optional, max 5)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="image-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= 5}
              >
                <ImagePlus size={18} />
                <span>Add Photos</span>
              </button>
              {previews.length > 0 && (
                <div className="image-preview-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeImage(i)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
