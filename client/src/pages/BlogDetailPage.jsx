import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { blogService, commentService } from '@/services/api';
import { Card, Badge, Avatar, Button, Input, Spinner, EmptyState } from '@/components/ui';
import { Heart, Bookmark, Clock, Eye, ArrowLeft, Send, Trash2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export function BlogDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogService.getBlogById(id);
        setBlog(response.data.blog);
        setIsLiked(response.data.isLiked);
        setIsBookmarked(response.data.isBookmarked);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await commentService.getBlogComments(id);
        setComments(response.data.comments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    if (blog) {
      fetchComments();
    }
  }, [blog, id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const response = await blogService.toggleLike(id);
      setIsLiked(response.data.isLiked);
      setBlog((prev) => ({
        ...prev,
        likes: response.data.isLiked
          ? [...prev.likes, user._id]
          : prev.likes.filter((uid) => uid !== user._id),
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      const response = await blogService.toggleBookmark(id);
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentService.createComment({ blogId: id, text: newComment });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!blog) {
    return (
      <EmptyState
        icon={<ArrowLeft className="w-12 h-12" />}
        title="Blog not found"
        description="This blog may have been removed or doesn't exist"
        action={
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <article>
        {blog.coverImage && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={`/uploads/${blog.coverImage}`}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-6">
          <Badge variant="info" className="mb-4">{blog.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {blog.readingTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {blog.viewCount} views
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to={`/user/${blog.author._id}`} className="flex items-center gap-3">
              <Avatar
                src={blog.author?.avatar ? `/uploads/${blog.author.avatar}` : undefined}
                fallback={blog.author?.name}
                className="w-12 h-12"
              />
              <div>
                <p className="font-medium text-text-primary">{blog.author?.name}</p>
                <p className="text-sm text-text-muted">{formatDate(blog.createdAt)}</p>
              </div>
            </Link>

            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    isLiked
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-border hover:bg-gray-50 text-text-secondary'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                  {blog.likes?.length || 0}
                </button>

                <button
                  onClick={handleBookmark}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    isBookmarked
                      ? 'border-primary bg-primary/10 text-text-primary'
                      : 'border-border hover:bg-gray-50 text-text-secondary'
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
                </button>
              </div>
            )}
          </div>
        </div>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="default" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      <div className="border-t border-border pt-8">
        <h3 className="text-xl font-bold text-text-primary mb-6">
          Comments ({comments.length})
        </h3>

        {user && (
          <form onSubmit={handleComment} className="flex gap-3 mb-8">
            <Avatar
              src={user.avatar ? `/uploads/${user.avatar}` : undefined}
              fallback={user.name}
              className="w-10 h-10 flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar
                src={comment.user?.avatar ? `/uploads/${comment.user.avatar}` : undefined}
                fallback={comment.user?.name}
                className="w-10 h-10 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-text-primary">{comment.user?.name}</span>
                  <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-text-secondary">{comment.text}</p>
              </div>

              {user && (user._id === comment.user._id || user.role === 'admin') && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <p className="text-center text-text-muted py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}