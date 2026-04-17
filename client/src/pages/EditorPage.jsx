import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/api';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Code, Link as LinkIcon, Image as ImageIcon, Save, Send, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuButton = ({ onClick, active, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'p-2 rounded hover:bg-gray-100 transition-colors',
      active && 'bg-gray-200 text-text-primary',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(isEditing);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchBlog = async () => {
        try {
          const response = await blogService.getBlogById(id);
          const blog = response.data.blog;
          setTitle(blog.title);
          setCategory(blog.category);
          setTags(blog.tags?.join(', ') || '');
          setStatus(blog.status);
          if (blog.coverImage) {
            setCoverImagePreview(`/uploads/${blog.coverImage}`);
          }
          if (editor && blog.content) {
            editor.commands.setContent(blog.content);
          }
        } catch (error) {
          console.error('Failed to fetch blog:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    }
  }, [isEditing, id, editor]);

  const saveDraft = useCallback(async () => {
    if (!title.trim() && !editor?.getHTML()) return;

    setSaving(true);
    try {
      const formData = {
        title: title || 'Untitled',
        content: editor?.getHTML() || '',
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'draft',
      };

      if (coverImage) {
        formData["coverImage"]= coverImage;
      }

      if (isEditing) {
        await blogService.updateBlog(id, formData);
      } else {
        
        const response = await blogService.createBlog(formData);
        navigate(`/editor/${response.data.blog._id}`, { replace: true });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setSaving(false);
    }
  }, [title, editor, category, tags, coverImage, isEditing, id, navigate]);

  const publish = async () => {
    if (!title.trim()) {
      alert('Please add a title before publishing');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        title,
        content: editor?.getHTML() || '',
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'published',
      };

      if (coverImage) {
        formData.coverImage = coverImage;
      }

      if (isEditing) {
        await blogService.updateBlog(id, formData);
      } else {
        const response = await blogService.createBlog(formData);
        navigate(`/blog/${response.data.blog._id}`);
        return;
      }

      navigate(`/blog/${id}`);
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter link URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'draft') {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [saveDraft, status]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'success' : 'default'}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          {lastSaved && (
            <span className="text-xs text-text-muted">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button variant="secondary" onClick={saveDraft} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={publish} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden mb-6">
        {coverImagePreview ? (
          <div className="relative aspect-video">
            <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setCoverImage(null);
                setCoverImagePreview('');
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block aspect-video bg-gray-50 border-2 border-dashed border-border cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <span className="text-sm text-text-muted">Add cover image</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </label>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your title..."
          className="w-full text-3xl font-bold text-text-primary placeholder:text-text-muted outline-none"
        />
      </Card>

      <Card className="p-0 mb-6">
        <div className="flex items-center gap-1 p-2 border-b border-border">
          <MenuButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>
            <Heading1 className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
            <Heading2 className="w-4 h-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
          <MenuButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}>
            <Quote className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')}>
            <Code className="w-4 h-4" />
          </MenuButton>
          <div className="w-px h-6 bg-border mx-1" />
          <MenuButton onClick={addLink} active={editor?.isActive('link')}>
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={addImage}>
            <ImageIcon className="w-4 h-4" />
          </MenuButton>
        </div>

        <EditorContent editor={editor} />
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Category
            </label>
            <Input
              type="text"
              placeholder="e.g., Technology"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Tags (comma-separated)
            </label>
            <Input
              type="text"
              placeholder="e.g., react, javascript, web"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}