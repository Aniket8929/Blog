import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/api';
import { Card, Badge, Avatar, Button, Spinner, Skeleton } from '@/components/ui';
import { Users, FileText, Eye, Heart, TrendingUp, Clock } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await blogService.getAdminStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Blogs', value: stats?.totalBlogs || 0, icon: FileText, color: 'bg-green-500' },
    { label: 'Published', value: stats?.publishedBlogs || 0, icon: TrendingUp, color: 'bg-primary' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Overview of your blog platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Blogs</h2>
            <Link to="/admin/blogs">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.recentBlogs?.map((blog) => (
              <Link key={blog._id} to={`/blog/${blog._id}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {blog.coverImage && (
                    <img
                      src={`/uploads/${blog.coverImage}`}
                      alt={blog.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{blog.title}</p>
                    <p className="text-xs text-text-muted">
                      by {blog.author?.name} • {formatRelativeDate(blog.createdAt)}
                    </p>
                  </div>
                  <Badge variant={blog.status === 'published' ? 'success' : 'default'}>
                    {blog.status}
                  </Badge>
                </div>
              </Link>
            ))}

            {(!stats?.recentBlogs || stats.recentBlogs.length === 0) && (
              <p className="text-center text-text-muted py-4">No blogs yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Platform Stats</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Total Likes</span>
                <span className="text-sm font-medium text-text-primary">
                  {stats?.totalLikes || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Total Views</span>
                <span className="text-sm font-medium text-text-primary">
                  {stats?.totalViews || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Published Rate</span>
                <span className="text-sm font-medium text-text-primary">
                  {stats?.totalBlogs
                    ? Math.round((stats.publishedBlogs / stats.totalBlogs) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats?.totalBlogs
                      ? (stats.publishedBlogs / stats.totalBlogs) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}