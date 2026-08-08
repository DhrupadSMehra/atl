import React, { useState } from 'react';
import { MessageSquare, ArrowBigUp, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');

interface PostCardProps {
  post: any;
  onClick: () => void;
  onUpvoteToggle: (postId: string, newUpvoteCount: number, hasUpvoted: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, onUpvoteToggle }) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const initialHasUpvoted = userId ? post.upvotedBy?.includes(userId) : false;
  
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isVoting) return;

    setIsVoting(true);
    const newHasUpvoted = !hasUpvoted;
    const newUpvotes = newHasUpvoted ? upvotes + 1 : upvotes - 1;
    
    setHasUpvoted(newHasUpvoted);
    setUpvotes(newUpvotes);
    
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_URL}/api/community/posts/${post._id}/upvote`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        onUpvoteToggle(post._id, data.post.upvotes, data.post.upvotedBy.includes(userId));
      } else {
        setHasUpvoted(hasUpvoted);
        setUpvotes(upvotes);
      }
    } catch (_err) {
       setHasUpvoted(hasUpvoted);
       setUpvotes(upvotes);
    } finally {
      setIsVoting(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const hasImages = post.images && post.images.length > 0;

  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-sidebar">
        <button 
          className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`} 
          onClick={handleUpvote}
          disabled={!userId || isVoting}
          title="Upvote"
        >
          <ArrowBigUp size={24} fill={hasUpvoted ? "currentColor" : "none"} strokeWidth={hasUpvoted ? 1 : 1.5} />
        </button>
        <span className={`upvote-count ${hasUpvoted ? 'upvoted' : ''}`}>{upvotes}</span>
      </div>
      
      <div className="post-content-area">
        <div className="post-meta">
          <span className="post-author">{post.author?.name || 'Unknown User'}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
        
        <h3 className="post-title">{post.title}</h3>
        <p className="post-preview">{post.content}</p>

        {/* Image thumbnail strip */}
        {hasImages && (
          <div className="post-image-strip">
            {post.images.slice(0, 3).map((img: string, i: number) => (
              <div className="post-image-thumb" key={i}>
                <img src={img.startsWith('http') ? img : `${API_URL}${img}`} alt={`Post image ${i + 1}`} />
              </div>
            ))}
            {post.images.length > 3 && (
              <div className="post-image-thumb post-image-more">
                <ImageIcon size={16} />
                <span>+{post.images.length - 3}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="post-actions">
          <button className="action-btn">
            <MessageSquare size={16} />
            <span>{post.comments?.length || 0} Comments</span>
          </button>
          {hasImages && (
            <button className="action-btn">
              <ImageIcon size={16} />
              <span>{post.images.length} {post.images.length === 1 ? 'Photo' : 'Photos'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
