import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService, blogService } from '@/services/api';
import { Card, Badge, Avatar, Button, Skeleton, EmptyState } from '@/components/ui';
import { Clock, Heart, FileText, BookOpen, Calendar } from 'lucide-react';
import { formatDate, cn, truncateText, stripHtml } from '@/lib/utils';

export function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [userRes, statsRes, blogsRes] = await Promise.all([
          userService.getUserById(id),
          userService.getUserStats(id),
          blogService.getUserBlogs(id),
        ]);
        setUser(userRes.data.user);
        setStats(statsRes.data.stats);
        setBlogs(blogsRes.data.blogs);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="User not found"
        description="This user may not exist or has been removed"
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
      <Card className="p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar
            src={user.avatar ? `/uploads/${user.avatar}` : undefined}
            fallback={user.name}
            className="w-24 h-24 text-2xl"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary mb-1">{user.name}</h1>
            <p className="text-sm text-text-muted mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {formatDate(user.createdAt)}
            </p>
            {user.bio && <p className="text-text-secondary mb-4">{user.bio}</p>}

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-text-muted" />
                <span className="font-medium text-text-primary">{stats?.totalPosts || 0}</span>
                <span className="text-text-muted">posts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-text-muted" />
                <span className="font-medium text-text-primary">{stats?.totalLikes || 0}</span>
                <span className="text-text-muted">likes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-text-muted" />
                <span className="font-medium text-text-primary">{stats?.totalViews || 0}</span>
                <span className="text-text-muted">views</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'posts'
              ? 'border-primary text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Posts ({blogs.length})
        </button>
      </div>

      {blogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No posts yet"
          description="This user hasn't published any blogs"
        />
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Link key={blog._id} to={`/blog/${blog._id}`}>
              <Card className="p-5 hover:scale-[1.01] transition-transform">
                <div className="flex gap-4">
                  {blog.coverImage && (
                    <img
                      src={`/uploads/${blog.coverImage}`}
                      alt={blog.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {truncateText(stripHtml(blog.content), 100)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readingTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {blog.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatDate(blog.createdAt)}
                      </span>
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