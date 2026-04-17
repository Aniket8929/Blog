import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { userService, blogService } from '@/services/api';
import { Card, Badge, Avatar, Button, Input, Skeleton, EmptyState } from '@/components/ui';
import { Clock, Heart, Edit2, FileText, Bookmark, Camera } from 'lucide-react';
import { formatDate, cn, truncateText, stripHtml } from '@/lib/utils';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
     
      try {
        const [blogsRes, statsRes] = await Promise.all([
          blogService.getMyBlogs(),
          userService.getUserStats(user.id),
        ]);
        setBlogs(blogsRes.data.blogs);
        setStats(statsRes.data.stats);
        setEditForm({ name: user.name, bio: user.bio || '' });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await userService.updateUser(user._id, editForm);
      updateUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const publishedBlogs = blogs.filter((b) => b.status === 'published');
  const draftBlogs = blogs.filter((b) => b.status === 'draft');

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <Avatar
              src={user.avatar ? `/uploads/${user.avatar}` : undefined}
              fallback={user.name}
              className="w-24 h-24 text-2xl"
            />
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
              <Camera className="w-4 h-4 text-text-primary" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Name</label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Bio</label>
                  <Input
                    type="text"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">{user.name}</h1>
                    <p className="text-sm text-text-muted">{user.email}</p>
                    {user.bio && <p className="text-text-secondary mt-2">{user.bio}</p>}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
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
                    <Bookmark className="w-4 h-4 text-text-muted" />
                    <span className="font-medium text-text-primary">{stats?.totalViews || 0}</span>
                    <span className="text-text-muted">views</span>
                  </div>
                </div>
              </>
            )}
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
          Posts ({publishedBlogs.length})
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'drafts'
              ? 'border-primary text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Drafts ({draftBlogs.length})
        </button>
      </div>

      {activeTab === 'posts' && (
        publishedBlogs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No posts yet"
            description="Start writing and share your stories with the world"
            action={
              <Link to="/editor">
                <Button>Write a Blog</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {publishedBlogs.map((blog) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info">{blog.category}</Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.readingTime} min
                        </span>
                      </div>
                      <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{blog.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                        {truncateText(stripHtml(blog.content), 100)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>{formatDate(blog.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {blog.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === 'drafts' && (
        draftBlogs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No drafts"
            description="Saved drafts will appear here"
          />
        ) : (
          <div className="space-y-4">
            {draftBlogs.map((blog) => (
              <Link key={blog._id} to={`/editor/${blog._id}`}>
                <Card className="p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default">Draft</Badge>
                        <span className="text-xs text-text-muted">{formatDate(blog.updatedAt)}</span>
                      </div>
                      <h3 className="font-semibold text-text-primary">{blog.title || 'Untitled'}</h3>
                    </div>
                    <Button variant="secondary" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}