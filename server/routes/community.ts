import express, { Response } from 'express';
import multer from 'multer';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { uploadService } from '../services/uploadService';
import mongoose from 'mongoose';

const router = express.Router();

// ─── Multer — in-memory, raw size guard ────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },   // 6 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}" for "${file.originalname}".`));
    }
  },
});

// Search users for mentions
router.get('/users/search', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    
    // Import User model
    const { User } = require('../models/User');
    
    let filter: any = { isBanned: { $ne: true } };
    if (q) {
      filter.$or = [
        { name: { $regex: new RegExp(q, 'i') } },
        { 'adminProfile.displayName': { $regex: new RegExp(q, 'i') } }
      ];
    }
    
    const users = await User.find(filter).select('name adminProfile _id').limit(10);
    
    res.json({ success: true, users: users.map((u: any) => ({ 
      id: u._id, 
      name: u.adminProfile?.displayName || u.name 
    }))});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all posts
router.get('/posts', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get a single post with its comments
router.get('/posts/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name profilePicture' },
        options: { sort: { createdAt: -1 } }
      });
      
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new post (with optional images, up to 5)
router.post('/posts', verifyToken, upload.array('images', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, error: 'Title and content are required' });
      return;
    }

    // Viewer/guest users don't have valid MongoDB ObjectIds
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      res.status(403).json({ success: false, error: 'Guest viewers cannot create posts. Please sign in with Google.' });
      return;
    }

    // Process uploaded images
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploaded = await uploadService.upload(file);
        imageUrls.push(uploaded.url);
      }
    }

    const newPost = new Post({
      title,
      content,
      images: imageUrls,
      author: new mongoose.Types.ObjectId(req.user.id)
    });

    await newPost.save();
    
    // Populate author before returning
    await newPost.populate('author', 'name profilePicture');
    
    res.status(201).json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upvote a post
router.patch('/posts/:id/upvote', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      res.status(403).json({ success: false, error: 'Guest viewers cannot upvote. Please sign in with Google.' });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    // Check if already upvoted
    const hasUpvoted = post.upvotedBy.some(id => id.equals(userId));
    
    if (hasUpvoted) {
      // Remove upvote
      post.upvotedBy = post.upvotedBy.filter(id => !id.equals(userId));
      post.upvotes -= 1;
    } else {
      // Add upvote
      post.upvotedBy.push(userId);
      post.upvotes += 1;
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a comment on a post
router.post('/posts/:id/comments', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      res.status(403).json({ success: false, error: 'Guest viewers cannot comment. Please sign in with Google.' });
      return;
    }
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const newComment = new Comment({
      content,
      author: new mongoose.Types.ObjectId(req.user?.id),
      post: post._id
    });

    await newComment.save();

    // Add comment reference to post
    post.comments.push(newComment._id as mongoose.Types.ObjectId);
    await post.save();

    await newComment.populate('author', 'name profilePicture');

    res.status(201).json({ success: true, comment: newComment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upvote a comment
router.patch('/comments/:id/upvote', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      res.status(403).json({ success: false, error: 'Guest viewers cannot upvote. Please sign in with Google.' });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }

    const hasUpvoted = comment.upvotedBy.some(id => id.equals(userId));
    
    if (hasUpvoted) {
      comment.upvotedBy = comment.upvotedBy.filter(id => !id.equals(userId));
      comment.upvotes -= 1;
    } else {
      comment.upvotedBy.push(userId);
      comment.upvotes += 1;
    }

    await comment.save();
    res.json({ success: true, comment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a post (Admin only)
router.delete('/posts/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Only administrators can delete posts.' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    // Delete the post and its comments
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
