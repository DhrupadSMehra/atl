import React, { useState, useEffect } from 'react';
import { X, ArrowBigUp, MessageSquare, ChevronLeft, ChevronRight, Trash2, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { renderTextWithTags } from '../../utils/textFormatting';
import { MentionsTextarea } from './MentionsTextarea';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

interface PostThreadModalProps {
  postId: string;
  onClose: () => void;
  onUpvoteToggle: (postId: string, newUpvoteCount: number, hasUpvoted: boolean) => void;
  onDeletePost?: (postId: string) => void;
  onBanUser?: (userId: string) => void;
}

export const PostThreadModal: React.FC<PostThreadModalProps> = ({ postId, onClose, onUpvoteToggle, onDeletePost, onBanUser }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const isAdmin = user?.role === 'admin';
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('atl_jwt_token');
        const res = await fetch(`${API_URL}/api/community/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setPost(data.post);
        } else {
          setError(data.error || 'Failed to load post');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleUpvotePost = async () => {
    if (!userId || isVoting || !post) return;
    
    setIsVoting(true);
    const hasUpvoted = post.upvotedBy?.includes(userId);
    
    const newHasUpvoted = !hasUpvoted;
    const newUpvotes = newHasUpvoted ? post.upvotes + 1 : post.upvotes - 1;
    
    setPost({
      ...post,
      upvotes: newUpvotes,
      upvotedBy: newHasUpvoted 
        ? [...(post.upvotedBy || []), userId]
        : post.upvotedBy.filter((id: string) => id !== userId)
    });
    
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_URL}/api/community/posts/${post._id}/upvote`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        onUpvoteToggle(post._id, data.post.upvotes, data.post.upvotedBy.includes(userId));
      }
    } catch (_err) {
      // Ignore
    } finally {
      setIsVoting(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!userId) return;
    
    const commentIndex = post.comments.findIndex((c: any) => c._id === commentId);
    if (commentIndex === -1) return;
    
    const comment = post.comments[commentIndex];
    const hasUpvoted = comment.upvotedBy?.includes(userId);
    
    const newHasUpvoted = !hasUpvoted;
    const newUpvotes = newHasUpvoted ? comment.upvotes + 1 : comment.upvotes - 1;
    
    const newComments = [...post.comments];
    newComments[commentIndex] = {
      ...comment,
      upvotes: newUpvotes,
      upvotedBy: newHasUpvoted
        ? [...(comment.upvotedBy || []), userId]
        : comment.upvotedBy.filter((id: string) => id !== userId)
    };
    
    setPost({ ...post, comments: newComments });
    
    try {
      const token = localStorage.getItem('atl_jwt_token');
      await fetch(`${API_URL}/api/community/comments/${commentId}/upvote`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (_err) {
      // Revert in production
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      });
      const data = await res.json();
      if (data.success) {
        setPost({
          ...post,
          comments: [data.comment, ...post.comments]
        });
        setCommentContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !window.confirm('Delete this post?')) return;
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_URL}/api/community/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onDeletePost?.(post._id);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBan = async (targetAuthorId: string) => {
    if (!isAdmin || !window.confirm('Ban this user and delete all their posts?')) return;
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_URL}/api/auth/users/${targetAuthorId}/ban`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onBanUser?.(targetAuthorId);
        if (post.author?._id === targetAuthorId) {
          onClose(); // Close if we banned the OP
        } else {
          // If we banned a commenter, filter comments locally
          setPost({
            ...post,
            comments: post.comments.filter((c: any) => c.author?._id !== targetAuthorId && c.author !== targetAuthorId)
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resolveImgSrc = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
    const cleanPath = img.startsWith('/') ? img : `/${img}`;
    return `${API_URL}${cleanPath}`;
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
  };
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && post?.images && lightboxIndex < post.images.length - 1) setLightboxIndex(lightboxIndex + 1);
  };

  if (loading) {
    return (
      <div className="thread-overlay">
        <div className="thread-panel">
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <span className="landing-mono-label" style={{ color: '#ffffff' }}>LOADING DATASTREAM...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="thread-overlay" onClick={onClose}>
        <div className="thread-panel" onClick={e => e.stopPropagation()}>
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444' }}>Error: {error || 'Post not found'}</h2>
            <button className="btn-cancel" onClick={onClose} style={{ marginTop: '20px' }}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  const postHasUpvoted = userId ? post.upvotedBy?.includes(userId) : false;
  const hasImages = post.images && post.images.length > 0;

  return (
    <>
      <div className="thread-overlay" onClick={onClose}>
        <div className="thread-panel" onClick={e => e.stopPropagation()}>
          <div className="thread-close-bar">
            <button className="thread-back-btn" onClick={onClose}>
              <X size={18} />
              <span>Close</span>
            </button>
            {isAdmin && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                <button className="admin-action-btn" onClick={() => handleBan(post.author?._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ban size={16} /> Ban OP
                </button>
                <button className="admin-action-btn" onClick={handleDelete} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={16} /> Delete Post
                </button>
              </div>
            )}
          </div>

          <div className="thread-scroll-area">
            <div className="thread-op">
              <div className="thread-op-vote">
                <button 
                  className={`upvote-btn ${postHasUpvoted ? 'upvoted' : ''}`} 
                  onClick={handleUpvotePost}
                  disabled={!userId || isVoting}
                >
                  <ArrowBigUp size={28} fill={postHasUpvoted ? "currentColor" : "none"} strokeWidth={postHasUpvoted ? 1 : 1.5} />
                </button>
                <span className={`upvote-count ${postHasUpvoted ? 'upvoted' : ''}`}>
                  {post.upvotes}
                </span>
              </div>

              <div className="thread-op-body">
                <div className="post-meta">
                  <span className="post-author">{post.author?.name || 'Unknown User'}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
                <h1 className="thread-op-title">{renderTextWithTags(post.title)}</h1>

                <div className="thread-op-text">
                  {post.content.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} style={{ minHeight: paragraph ? 'auto' : '1em' }}>{renderTextWithTags(paragraph)}</p>
                  ))}
                </div>

                {hasImages && (
                  <div className={`thread-image-gallery ${post.images.length === 1 ? 'single' : ''}`}>
                    {post.images.map((img: string, i: number) => (
                      <div
                        className="thread-image-item"
                        key={i}
                        onClick={() => openLightbox(i)}
                      >
                        <img
                          src={resolveImgSrc(img)}
                          alt={`Image ${i + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            const el = e.currentTarget;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = 'true';
                              el.src = img.startsWith('/') ? img : `/${img}`;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="thread-op-stats">
                  <button className="action-btn">
                    <ArrowBigUp size={16} />
                    <span>{post.upvotes} Upvotes</span>
                  </button>
                  <button className="action-btn">
                    <MessageSquare size={16} />
                    <span>{post.comments?.length || 0} Comments</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="thread-comment-form">
              <div className="thread-comment-form-label">Comment as <strong>{user?.name || 'Guest'}</strong></div>
              <form onSubmit={handleSubmitComment}>
                <MentionsTextarea
                  className="comment-input"
                  placeholder="What are your thoughts? Use @ to mention someone or # for a department."
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="comment-submit" 
                  disabled={!commentContent.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? 'Posting...' : 'Comment'}
                </button>
              </form>
            </div>

            <div className="thread-comments">
              {post.comments?.length === 0 ? (
                <div className="thread-no-comments">No comments yet. Be the first to share your thoughts.</div>
              ) : (
                post.comments?.map((comment: any) => {
                  const commentHasUpvoted = userId ? comment.upvotedBy?.includes(userId) : false;
                  return (
                    <div className="thread-comment" key={comment._id}>
                      <div className="thread-comment-line" />
                      <div className="thread-comment-content">
                        <div className="comment-meta">
                          <span className="post-author">{comment.author?.name || 'Unknown User'}</span>
                          <span>•</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          
                          {isAdmin && (
                            <button className="admin-action-btn" onClick={() => handleBan(comment.author?._id)} title="Ban Commenter" style={{ marginLeft: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Ban size={12} /> Ban
                            </button>
                          )}
                        </div>
                        <div className="comment-text">
                           {comment.content.split('\n').map((paragraph: string, i: number) => (
                             <p key={i} style={{ margin: 0, minHeight: paragraph ? 'auto' : '1em' }}>{renderTextWithTags(paragraph)}</p>
                           ))}
                        </div>
                        <div className="thread-comment-actions">
                          <button 
                            className={`upvote-btn-inline ${commentHasUpvoted ? 'upvoted' : ''}`} 
                            onClick={() => handleUpvoteComment(comment._id)}
                          >
                            <ArrowBigUp size={18} fill={commentHasUpvoted ? "currentColor" : "none"} strokeWidth={commentHasUpvoted ? 1 : 1.5} />
                            <span>{comment.upvotes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && post.images && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}><X size={24} /></button>
          {lightboxIndex > 0 && (
            <button className="lightbox-nav lightbox-prev" onClick={prevImage}><ChevronLeft size={32} /></button>
          )}
          <img 
            className="lightbox-image" 
            src={resolveImgSrc(post.images[lightboxIndex])} 
            alt={`Full image ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()} 
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.dataset.fallback) {
                el.dataset.fallback = 'true';
                const cur = post.images[lightboxIndex];
                el.src = cur.startsWith('/') ? cur : `/${cur}`;
              }
            }}
          />
          {lightboxIndex < post.images.length - 1 && (
            <button className="lightbox-nav lightbox-next" onClick={nextImage}><ChevronRight size={32} /></button>
          )}
          <div className="lightbox-counter">{lightboxIndex + 1} / {post.images.length}</div>
        </div>
      )}
    </>
  );
};

export default PostThreadModal;
