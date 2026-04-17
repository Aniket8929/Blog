const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');

exports.createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, coverImage, tags, category, status } = req.body;
    console.log(coverImage)
    const blog = await Blog.create({
      title,
      content,
      coverImage,
      tags,
      category,
      status,
      author: req.user._id
    });

    await blog.populate('author', 'name avatar');
    res.status(201).json({ blog, message: 'Blog created successfully' });
  } catch (error) {
    console.error('CreateBlog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { search, category, tag, sort, page = 1, limit = 10 } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'likes') sortOption = { likesCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetAllBlogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'name avatar bio');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isLiked = req.user ? blog.likes.includes(req.user._id) : false;
    const isBookmarked = req.user ? blog.bookmarks.includes(req.user._id) : false;

    res.json({ blog, isLiked, isBookmarked });
  } catch (error) {
    console.error('GetBlogById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, coverImage, tags, category, status } = req.body;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.coverImage = coverImage || blog.coverImage;
    blog.tags = tags || blog.tags;
    blog.category = category || blog.category;
    blog.status = status || blog.status;

    await blog.save();
    await blog.populate('author', 'name avatar');

    res.json({ blog, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('UpdateBlog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('DeleteBlog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { author: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('GetMyBlogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id, status: 'draft' })
      .sort({ updatedAt: -1 });

    res.json({ blogs });
  } catch (error) {
    console.error('GetDrafts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find({ author: req.params.userId, status: 'published' })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({ author: req.params.userId, status: 'published' });

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('GetUserBlogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      blog.likes.push(req.user._id);
    } else {
      blog.likes.splice(likeIndex, 1);
    }

    await blog.save();

    res.json({
      likesCount: blog.likes.length,
      isLiked: likeIndex === -1,
      message: likeIndex === -1 ? 'Blog liked' : 'Blog unliked'
    });
  } catch (error) {
    console.error('ToggleLike error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const bookmarkIndex = blog.bookmarks.indexOf(req.user._id);

    if (bookmarkIndex === -1) {
      blog.bookmarks.push(req.user._id);
    } else {
      blog.bookmarks.splice(bookmarkIndex, 1);
    }

    await blog.save();

    res.json({
      isBookmarked: bookmarkIndex === -1,
      message: bookmarkIndex === -1 ? 'Blog bookmarked' : 'Bookmark removed'
    });
  } catch (error) {
    console.error('ToggleBookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookmarkedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find({ bookmarks: req.user._id, status: 'published' })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({ bookmarks: req.user._id, status: 'published' });

    res.json({
      blogs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('GetBookmarkedBlogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    res.json({ categories });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', { status: 'published' });
    res.json({ tags });
  } catch (error) {
    console.error('GetTags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);
    const totalLikes = await Blog.aggregate([
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);

    const recentBlogs = await Blog.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalBlogs,
        publishedBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        recentBlogs
      }
    });
  } catch (error) {
    console.error('GetAdminStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};