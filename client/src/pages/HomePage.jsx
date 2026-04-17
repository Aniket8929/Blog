import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { blogService } from '@/services/api';
import { Card, Badge, Avatar, Input, Button, Skeleton, Spinner, EmptyState } from '@/components/ui';
import { Search, Filter, Clock, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeDate, stripHtml, truncateText } from '@/lib/utils';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  const fetchBlogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await blogService.getAllBlogs(params);
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogService.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    fetchBlogs(page);
  }, [searchParams, search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({});
    if (search) {
      setSearchParams({ search });
    } else if (category) {
      setSearchParams({ category });
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat === category ? '' : cat);
    setSearchParams({});
    setSearch('');
  };

  const goToPage = (page) => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (page > 1) params.page = page;
    setSearchParams(params);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Discover</h1>
        <p className="text-text-secondary">Find stories that inspire and inform</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-text-muted flex-shrink-0" />
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !category ? 'bg-primary text-text-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat ? 'bg-primary text-text-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <Skeleton className="h-48 rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="No blogs found"
          description={search || category ? "Try adjusting your search or filters" : "Be the first to publish a blog!"}
          action={
            <Link to="/editor">
              <Button>Write a Blog</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id} to={`/blog/${blog._id}`}>
                <Card className="p-0 overflow-hidden h-full hover:scale-[1.01] transition-transform">
                  {blog.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={`/uploads/${blog.coverImage}`}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="info">{blog.category}</Badge>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readingTime} min read
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {truncateText(stripHtml(blog.content), 100)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={blog.author?.avatar ? `/uploads/${blog.author.avatar}` : undefined}
                          fallback={blog.author?.name}
                          className="w-8 h-8"
                        />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{blog.author?.name}</p>
                          <p className="text-xs text-text-muted">{formatRelativeDate(blog.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-text-muted text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {blog.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-text-secondary">
                Page {pagination.page} of {pagination.pages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}