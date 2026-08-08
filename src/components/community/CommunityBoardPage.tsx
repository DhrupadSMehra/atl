import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import PostThreadModal from './PostThreadModal';
import CreatePostForm from './CreatePostForm';
import './community.css';

interface CommunityBoardPageProps {
  onBack: () => void;
}

export const CommunityBoardPage: React.FC<CommunityBoardPageProps> = ({ onBack: _onBack }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/api/community/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleUpvoteToggle = (postId: string, newUpvoteCount: number, _hasUpvoted: boolean) => {
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        // Find current user id from the hasUpvoted flag by trusting the optimistic updates in child
        // or just updating the count
        return {
          ...p,
          upvotes: newUpvoteCount
        };
      }
      return p;
    }));
  };

  return (
    <div className="community-board-container">
      <header className="community-header">
        <div className="community-title-section">
          <span className="landing-mono-label">ATL_NETWORK // THREADS</span>
          <h1 className="community-title">Community Feed</h1>
          <p className="community-subtitle">Share research, ideas, and system logs.</p>
        </div>
        <button className="create-post-btn" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>NEW ENTRY</span>
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#00ff66', fontFamily: "'JetBrains Mono', monospace" }}>
          [FETCHING_RECORDS...]
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
              No threads found. Be the first to post.
            </div>
          ) : (
            posts.map(post => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard 
                  post={post} 
                  onClick={() => setActivePostId(post._id)} 
                  onUpvoteToggle={handleUpvoteToggle}
                />
              </motion.div>
            ))
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <CreatePostForm 
          onClose={() => setIsCreateModalOpen(false)} 
          onPostCreated={handlePostCreated} 
        />
      )}

      {activePostId && (
        <PostThreadModal 
          postId={activePostId} 
          onClose={() => setActivePostId(null)} 
          onUpvoteToggle={handleUpvoteToggle}
        />
      )}
    </div>
  );
};

export default CommunityBoardPage;
