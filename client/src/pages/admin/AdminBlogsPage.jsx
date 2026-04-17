import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/api';
import { Card, Badge, Avatar, Button, Spinner, EmptyState } from '@/components/ui';
import { FileText, Edit2, Trash2, Eye, Clock, User } from 'lucide-react';
import { formatDate, truncateText, stripHtml } from '@/lib/utils';

export function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogService.getMyBlogs({ status: filter === 'all' ? undefined : filter });
        setBlogs(response.data.blogs);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filter]);

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await blogService.deleteBlog(blogId);
      setBlogs(blogs.filter((b) => b._id !== blogId));
    } catch (error) {
      console.error('Failed to delete blog:', error);
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Blog Management</h1>
          <p className="text-text-secondary">Manage all blog posts</p>
        </div>
        <Link to="/editor">
          <Button>Create New Blog</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-text-primary'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {blogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No blogs found"
          description={filter === 'all' ? "Create your first blog post" : `No ${filter} blogs yet`}
          action={
            <Link to="/editor">
              <Button>Create Blog</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {blogs.map((blog) => (
              <div key={blog._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {blog.coverImage && (
                    <img
                      src={`/uploads/${blog.coverImage}`}
                      alt={blog.title}
                      className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={blog.status === 'published' ? 'success' : 'default'}>
                        {blog.status}
                      </Badge>
                      <Badge variant="info">{blog.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">{blog.title || 'Untitled'}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1 mb-2">
                      {truncateText(stripHtml(blog.content), 100) || 'No content'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {blog.author?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.viewCount || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/blog/${blog._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to={`/editor/${blog._id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blog._id)}
                      className="text-error hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}