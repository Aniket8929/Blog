import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/api';
import { Card, Badge, Avatar, Skeleton, EmptyState, Spinner } from '@/components/ui';
import { Clock, Heart, Bookmark as BookmarkIcon, X } from 'lucide-react';
import { formatRelativeDate, truncateText, stripHtml } from '@/lib/utils';

export function BookmarksPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await blogService.getBookmarkedBlogs();
        setBlogs(response.data.blogs);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await blogService.toggleBookmark(blogId);
      setBlogs(blogs.filter((b) => b._id !== blogId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Saved Blogs</h1>
        <p className="text-text-secondary">Blogs you've bookmarked for later reading</p>
      </div>

      {blogs.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="w-12 h-12" />}
          title="No saved blogs"
          description="Bookmark blogs to save them for later"
        />
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Link key={blog._id} to={`/blog/${blog._id}`}>
              <Card className="p-5 hover:scale-[1.01] transition-transform relative group">
                <button
                  onClick={(e) => handleRemoveBookmark(e, blog._id)}
                  className="absolute top-3 right-3 p-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4">
                  {blog.coverImage && (
                    <img
                      src={`/uploads/${blog.coverImage}`}
                      alt={blog.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info">{blog.category}</Badge>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readingTime} min read
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {truncateText(stripHtml(blog.content), 100)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={blog.author?.avatar ? `/uploads/${blog.author.avatar}` : undefined}
                          fallback={blog.author?.name}
                          className="w-6 h-6"
                        />
                        <span className="text-sm text-text-secondary">{blog.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {blog.likes?.length || 0}
                        </span>
                        <span>{formatRelativeDate(blog.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}