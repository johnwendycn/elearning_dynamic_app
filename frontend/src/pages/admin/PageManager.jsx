import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  Plus, Edit2, Trash2, Eye, Search, AlertCircle, ChevronUp, ChevronDown, 
  Settings, MessageSquare, Image, FileText, Check, ShieldAlert, Sparkles, X, Play,
  GripVertical, Copy, Video, Layout, Columns, BarChart3, HelpCircle, List,
  Tv, Radio, Palette, CheckCircle2, ArrowRight, ExternalLink, Users, Star
} from 'lucide-react';
import api from '../../services/api';
import MediaSelectorModal from './MediaSelectorModal';
import RichTextEditor from '../../components/common/RichTextEditor';
import { getFullMediaUrl } from '../../utils/mediaUrl';

const BLOCK_TYPES = [
  { type: 'about_intro', label: 'About Us Intro', icon: Users, desc: 'Headline, tagline, paragraphs, CTA & 3 feature highlights' },
  { type: 'values_grid', label: 'Core Values Grid', icon: Star, desc: 'Grid of values with icon, title and description' },
  { type: 'text', label: 'Rich Text / Article', icon: FileText, desc: 'WYSIWYG formatted text, headings, and quotes' },
  { type: 'video', label: 'Video Player', icon: Video, desc: 'YouTube, Vimeo or uploaded MP4 video' },
  { type: 'hero', label: 'Hero Banner', icon: Layout, desc: 'Big headline, background image & CTA button' },
  { type: 'split', label: 'Two-Column Split', icon: Columns, desc: 'Side-by-side media and rich text description' },
  { type: 'cards', label: 'Feature Cards', icon: Layout, desc: 'Grid of feature cards with images and links' },
  { type: 'stats', label: 'Stats / Counters', icon: BarChart3, desc: 'Key performance metrics and numbers' },
  { type: 'cta', label: 'Call to Action', icon: Sparkles, desc: 'High-conversion banner with action button' },
  { type: 'accordion', label: 'Accordion / FAQ', icon: HelpCircle, desc: 'Collapsible questions and answers' },
  { type: 'list', label: 'Bullet / Numbered List', icon: List, desc: 'Structured list items' },
  { type: 'carousel', label: 'Carousel Slider', icon: Tv, desc: 'Embed a slideshow from Carousel Manager' },
  { type: 'news_feed', label: 'News Feed', icon: Radio, desc: 'Dynamic stream of published news posts' }
];

const PageManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [pages, setPages] = useState([]);
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  
  // Editing target
  const [editingPage, setEditingPage] = useState(null);
  const [previewPage, setPreviewPage] = useState(null);
  const [activeMediaTarget, setActiveMediaTarget] = useState(null); // { type: 'section' | 'card' | 'pageBanner', secIndex, cardIndex, field }
  
  // Drag-and-drop states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'settings'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    bannerImageUrl: '',
    bannerTitle: '',
    bannerSubtitle: '',
    pageType: 'standard',
    customPageType: '',
    template: 'default',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    showInMenu: true,
    menuTitle: '',
    menuOrder: 0,
    isHomepage: false,
    content: '',
    sections: [],
    chatSettings: {
      enabled: false,
      allowReplies: true
    }
  });

  const canCreate = hasPermission('pages', 'create');
  const canUpdate = hasPermission('pages', 'update');
  const canDelete = hasPermission('pages', 'delete');

  const fetchPages = () => {
    setLoading(true);
    let url = `/pages?search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (typeFilter) url += `&pageType=${typeFilter}`;
    
    api.get(url)
      .then((res) => {
        if (res.data.success) setPages(res.data.pages || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchCarousels = () => {
    api.get('/carousels')
      .then((res) => {
        if (res.data.success) setCarousels(res.data.carousels || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPages();
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleOpenModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      const isCustomType = !['standard', 'news', 'event', 'course'].includes(page.pageType);
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        bannerImageUrl: page.bannerImageUrl || '',
        bannerTitle: page.bannerTitle || '',
        bannerSubtitle: page.bannerSubtitle || '',
        pageType: isCustomType ? 'custom' : (page.pageType || 'standard'),
        customPageType: isCustomType ? page.pageType : '',
        template: page.template || 'default',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        status: page.status || 'draft',
        showInMenu: page.showInMenu !== undefined ? page.showInMenu : true,
        menuTitle: page.menuTitle || '',
        menuOrder: page.menuOrder || 0,
        isHomepage: page.isHomepage || false,
        content: page.content || '',
        sections: Array.isArray(page.sections) ? page.sections : [],
        chatSettings: page.chatSettings || { enabled: false, allowReplies: true }
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        bannerImageUrl: '',
        bannerTitle: '',
        bannerSubtitle: '',
        pageType: 'standard',
        customPageType: '',
        template: 'default',
        metaTitle: '',
        metaDescription: '',
        status: 'draft',
        showInMenu: true,
        menuTitle: '',
        menuOrder: 0,
        isHomepage: false,
        content: '',
        sections: [],
        chatSettings: { enabled: false, allowReplies: true }
      });
    }
    setActiveTab('builder');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalPageType = formData.pageType === 'custom' ? formData.customPageType : formData.pageType;
      if (!finalPageType) {
        showError('Please specify a page type');
        return;
      }
      
      const payload = {
        ...formData,
        pageType: finalPageType
      };

      if (editingPage) {
        await api.put(`/pages/${editingPage.id}`, payload);
        showSuccess('Page updated successfully!');
      } else {
        await api.post('/pages', payload);
        showSuccess('Page created successfully!');
      }
      setFormOpen(false);
      fetchPages();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save page');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/pages/${id}/approve`);
      fetchPages();
      if (previewOpen) setPreviewOpen(false);
      showSuccess('Page approved and published online successfully!');
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to approve page');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await api.delete(`/pages/${id}`);
        showSuccess('Page deleted successfully.');
        fetchPages();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete page');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected pages?`)) {
      try {
        await api.post('/pages/bulk-delete', { ids: selectedIds });
        showSuccess(`Deleted ${selectedIds.length} pages successfully.`);
        setSelectedIds([]);
        fetchPages();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to bulk delete');
      }
    }
  };

  // ── Block Builders Helper ──────────────────────────────────────────────────
  const createDefaultSection = (type) => {
    const newSection = { type, id: 'section_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) };

    if (type === 'about_intro') {
      newSection.headline = 'About JONIKWIRIA';
      newSection.tagline = 'Building People. Building Technology.';
      newSection.para1 = 'JONIKWIRIA is a technology training and development company focused on equipping individuals and organizations with practical digital skills while building innovative technology solutions.';
      newSection.para2 = 'We provide training in software development, data science, artificial intelligence, machine learning and other emerging technologies.';
      newSection.para3 = 'We also design and develop custom software, AI and data-driven solutions that help organizations solve real-world problems.';
      newSection.btnText = 'Learn More';
      newSection.btnUrl = '/p/about-us';
      newSection.features = [
        { title: 'Hands-On Practical Training', desc: 'Real-world, project-driven curriculum for kids, students and professionals.', icon: 'code', color: 0 },
        { title: 'Cutting-Edge AI & Software', desc: 'Custom software and AI solutions tailored to business needs.', icon: 'cpu', color: 2 },
        { title: 'Digital Transformation', desc: 'Empowering learners and organizations in the digital economy.', icon: 'rocket', color: 3 },
      ];
    } else if (type === 'values_grid') {
      newSection.title = 'Our Core Values';
      newSection.subtitle = 'The principles that shape everything we teach and build.';
      newSection.values = [
        { icon: 'lightbulb', title: 'Innovation',          desc: 'We encourage creativity, experimentation and new ways of solving problems.' },
        { icon: 'award',     title: 'Excellence',          desc: 'We strive for high standards in everything we teach and build.' },
        { icon: 'wrench',    title: 'Practicality',        desc: 'We focus on skills and solutions that can be applied to real-world problems.' },
        { icon: 'shield',    title: 'Integrity',           desc: 'We operate with honesty, transparency and professionalism.' },
        { icon: 'book',      title: 'Continuous Learning', desc: 'We believe technology is constantly evolving, and learning must evolve with it.' },
        { icon: 'rocket',    title: 'Impact',              desc: 'We measure our success by the value we create for learners, clients and society.' },
      ];
    } else if (type === 'text') {
      newSection.content = '<h2>Section Headline</h2><p>Write your detailed content, explain key benefits, or share your story here using the rich toolbar above.</p>';
    } else if (type === 'video') {
      newSection.title = 'Featured Video Overview';
      newSection.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      newSection.caption = 'Watch this short walkthrough video';
      newSection.autoPlay = false;
    } else if (type === 'hero') {
      newSection.title = 'Empowering The Next Generation of Innovators';
      newSection.subtitle = 'Practical technology training and scalable software solutions designed for real-world impact.';
      newSection.badge = 'Welcome to Jonikwiria';
      newSection.bgImage = '';
      newSection.btnText = 'Get Started';
      newSection.btnUrl = '/p/about-us';
      newSection.align = 'center';
    } else if (type === 'split') {
      newSection.title = 'Custom Software & AI Solutions';
      newSection.badge = 'Technology Solutions';
      newSection.content = '<p>We design and develop intelligent applications that help businesses automate tasks, analyze data, and build competitive advantage.</p>';
      newSection.image = '';
      newSection.btnText = 'Explore Solutions';
      newSection.btnUrl = '/p/software-development';
      newSection.layout = 'media-right';
    } else if (type === 'cards') {
      newSection.title = 'Our Programs & Services';
      newSection.columns = 3;
      newSection.items = [
        { title: 'Software Development', text: 'Master modern programming and build full-stack web, mobile, and backend applications.', image: '', badge: 'Popular', link: '/p/software-development' },
        { title: 'Data Science & AI', text: 'Learn data analysis, predictive modeling, and cutting-edge machine learning solutions.', image: '', badge: 'In-Demand', link: '/p/data-science' },
        { title: 'IT Capacity Building', text: 'Tailored technology training for companies, government institutions, and schools.', image: '', badge: 'Enterprise', link: '/p/about-us' }
      ];
    } else if (type === 'stats') {
      newSection.title = 'Our Impact In Numbers';
      newSection.items = [
        { number: '1,000+', label: 'Students Trained', subtext: 'Across schools & bootcamps' },
        { number: '50+', label: 'Software Projects', subtext: 'Delivered for clients' },
        { number: '99%', label: 'Satisfaction Rate', subtext: 'From learners and partners' },
        { number: '24/7', label: 'Community Support', subtext: 'Mentorship & collaboration' }
      ];
    } else if (type === 'cta') {
      newSection.title = 'Ready to Build Your Digital Future?';
      newSection.subtitle = 'Join hundreds of ambitious students and organizations transforming their capabilities with JONIKWIRIA.';
      newSection.btnText = 'Get Started Today';
      newSection.btnUrl = '/p/about-us';
      newSection.gradient = 'linear-gradient(135deg, #0052cc 0%, #007bff 100%)';
    } else if (type === 'accordion') {
      newSection.title = 'Frequently Asked Questions';
      newSection.items = [
        { header: 'Who is eligible to join the technology programs?', content: 'Our courses are tailored for learners of all levels — including children, high school students, university graduates, working professionals, and corporate teams.' },
        { header: 'Are the training programs hands-on and practical?', content: 'Yes! Every program focuses on real projects, practical coding assignments, and building portfolio-ready applications.' },
        { header: 'Do you offer custom software development for businesses?', content: 'Yes, we provide end-to-end software development, AI model integration, and cloud-backed data analytics solutions for companies and startups.' }
      ];
    } else if (type === 'list') {
      newSection.title = 'Key Highlights & Curriculum';
      newSection.listType = 'unordered';
      newSection.items = [
        'Interactive live coding and mentorship sessions',
        'Industry-standard frameworks and development tools',
        'Real-world capstone projects and certifications'
      ];
    } else if (type === 'carousel') {
      newSection.carouselId = carousels.length > 0 ? carousels[0].id : '';
    } else if (type === 'news_feed') {
      newSection.title = 'Latest News & Updates';
      newSection.limit = 3;
    }
    return newSection;
  };

  const addSection = (type, targetIndex = null) => {
    const newSection = createDefaultSection(type);
    setFormData(prev => {
      const list = [...prev.sections];
      if (targetIndex !== null && targetIndex >= 0 && targetIndex <= list.length) {
        list.splice(targetIndex, 0, newSection);
      } else {
        list.push(newSection);
      }
      return { ...prev, sections: list };
    });
  };

  const duplicateSection = (index) => {
    setFormData(prev => {
      const list = [...prev.sections];
      const copy = JSON.parse(JSON.stringify(list[index]));
      copy.id = 'section_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      list.splice(index + 1, 0, copy);
      return { ...prev, sections: list };
    });
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index, direction) => {
    const list = [...formData.sections];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setFormData(prev => ({ ...prev, sections: list }));
  };

  const updateSection = (index, fields) => {
    setFormData(prev => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], ...fields };
      return { ...prev, sections: updated };
    });
  };

  // ── Drag and Drop Reordering Handlers ─────────────────────────────────────
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    // Check if dragging from palette
    const paletteType = e.dataTransfer.getData('palette-type');
    if (paletteType) {
      addSection(paletteType, targetIndex);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reordering existing sections
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setFormData(prev => {
      const list = [...prev.sections];
      const [draggedItem] = list.splice(draggedIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return { ...prev, sections: list };
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.setData('palette-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // ── Media Selection Helpers ───────────────────────────────────────────────
  const openMediaFor = (target) => {
    setActiveMediaTarget(target);
    setMediaModalOpen(true);
  };

  const handleSelectMedia = (media) => {
    if (activeMediaTarget) {
      if (activeMediaTarget.type === 'pageBanner') {
        setFormData(prev => ({ ...prev, bannerImageUrl: media.url }));
        setActiveMediaTarget(null);
        return;
      }

      const { secIndex, cardIndex, field } = activeMediaTarget;
      const sec = formData.sections[secIndex];

      if (cardIndex !== undefined && sec.items) {
        const items = [...sec.items];
        items[cardIndex] = { ...items[cardIndex], [field || 'image']: media.url };
        updateSection(secIndex, { items });
      } else {
        updateSection(secIndex, { [field || 'image']: media.url });
      }
      setActiveMediaTarget(null);
    }
  };

  return (
    <div className="admin-page-container">
      
      {/* Top Header */}
      <div className="admin-header-bar">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pages Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Build responsive web pages visually with drag & drop blocks, WYSIWYG text formatting, video embeds, and media integration
          </p>
        </div>

        <div className="admin-header-actions">
          {canDelete && selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
              <Trash2 size={16} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          {canCreate && (
            <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Create Dynamic Page</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1rem' }}>
        <div className="admin-filter-grid-3">
          <div className="flex items-center gap-2" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.75rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Search pages by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="published">Published</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Page Types</option>
            <option value="standard">Standard</option>
            <option value="news">News</option>
            <option value="event">Event</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(pages.map((p) => p.id));
                    else setSelectedIds([]);
                  }}
                  checked={selectedIds.length === pages.length && pages.length > 0}
                />
              </th>
              <th>Title</th>
              <th>Slug</th>
              <th>Page Type</th>
              <th>Status</th>
              <th>Comments</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Loading pages list...</td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No pages found.</td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(page.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, page.id]);
                        else setSelectedIds(selectedIds.filter((id) => id !== page.id));
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <div className="flex items-center gap-2">
                      <span>{page.title}</span>
                      {page.isHomepage && <span className="badge badge-success">Home</span>}
                    </div>
                  </td>
                  <td><code>/{page.slug}</code></td>
                  <td>
                    <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                      {page.pageType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      page.status === 'published' ? 'badge-success' : 
                      page.status === 'pending_approval' ? 'badge-warning' : 'badge-neutral'
                    }`}>
                      {page.status === 'pending_approval' ? 'Pending Approval' : page.status}
                    </span>
                  </td>
                  <td>
                    {page.chatSettings?.enabled ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }} className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{(page.comments || []).length} comments</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Disabled</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setPreviewPage(page); setPreviewOpen(true); }}
                        className="btn btn-secondary btn-sm" 
                        title="Interactive Preview"
                      >
                        <Eye size={15} />
                      </button>

                      {page.status === 'pending_approval' && canUpdate && (
                        <button 
                          onClick={() => handleApprove(page.id)} 
                          className="btn btn-primary btn-sm" 
                          title="Approve and Publish"
                          style={{ background: '#10B981', borderColor: '#10B981' }}
                        >
                          <Check size={15} />
                        </button>
                      )}

                      {canUpdate && (
                        <button onClick={() => handleOpenModal(page)} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit2 size={15} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(page.id)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── DRAG & DROP VISUAL PAGE BUILDER MODAL ──────────────────────────── */}
      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '0.5rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '1240px', height: '94vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', background: 'var(--bg-surface)' }}>
            
            {/* Modal Header */}
            <div className="admin-card-header-responsive" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Layout size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {editingPage ? `Editing Page: ${formData.title}` : 'Dynamic Page Builder'}
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Drag blocks to rearrange • Zero JSON code • WYSIWYG
                  </span>
                </div>
              </div>

              <div className="admin-card-header-tools" style={{ flexWrap: 'wrap' }}>
                {/* Tab Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    className="btn btn-xs"
                    style={{
                      background: activeTab === 'builder' ? 'var(--bg-surface)' : 'transparent',
                      color: activeTab === 'builder' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      boxShadow: activeTab === 'builder' ? 'var(--shadow-sm)' : 'none',
                      padding: '0.35rem 0.85rem'
                    }}
                  >
                    Visual Builder ({formData.sections.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="btn btn-xs"
                    style={{
                      background: activeTab === 'settings' ? 'var(--bg-surface)' : 'transparent',
                      color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      boxShadow: activeTab === 'settings' ? 'var(--shadow-sm)' : 'none',
                      padding: '0.35rem 0.85rem'
                    }}
                  >
                    Page Settings & SEO
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    setPreviewPage({ ...formData, id: 'temp_preview' });
                    setPreviewOpen(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={15} />
                  <span>Preview</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setFormOpen(false)} 
                  className="btn btn-secondary btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* TAB 1: VISUAL DRAG & DROP BUILDER */}
              {activeTab === 'builder' && (
                <div className="admin-builder-layout">
                  
                  {/* Left Sidebar: Block Palette */}
                  <div style={{ background: 'var(--bg-app)', borderRight: '1px solid var(--border)', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '100%' }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>
                        Block Palette
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Click or drag any block into the page canvas:
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {BLOCK_TYPES.map((block) => {
                        const IconComp = block.icon;
                        return (
                          <div
                            key={block.type}
                            draggable
                            onDragStart={(e) => handlePaletteDragStart(e, block.type)}
                            onClick={() => addSection(block.type)}
                            className="card hover-scale"
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-surface)',
                              cursor: 'grab',
                              userSelect: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'var(--transition)'
                            }}
                          >
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={16} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {block.label}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {block.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Canvas: Drag & Drop Sections Area */}
                  <div 
                    style={{ padding: '1.5rem 2rem', overflowY: 'auto', background: 'var(--bg-surface)' }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => {
                      const paletteType = e.dataTransfer.getData('palette-type');
                      if (paletteType) {
                        e.preventDefault();
                        addSection(paletteType);
                      }
                    }}
                  >
                    {/* Quick Page Title Indicator */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Enter Page Title (e.g. Artificial Intelligence)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={{ fontSize: '1.25rem', fontWeight: 800, padding: '0.6rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', flex: '1 1 240px', minWidth: '0' }}
                      />
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ width: 'auto', minWidth: '160px', fontWeight: 700 }}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="published">Published Live</option>
                      </select>
                    </div>

                    {/* Page Banner Configuration Box */}
                    <div 
                      className="card" 
                      style={{ 
                        marginBottom: '1.5rem', 
                        padding: '1.25rem 1.5rem', 
                        borderRadius: '14px', 
                        border: '1px solid var(--border)', 
                        background: 'var(--bg-app)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div className="flex items-center gap-2">
                          <Image size={18} color="var(--primary)" />
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            Page Header Banner & Background Image
                          </strong>
                        </div>
                        {formData.bannerImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, bannerImageUrl: '' }))}
                            className="btn btn-secondary btn-xs"
                            style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                          >
                            Remove Banner Image
                          </button>
                        )}
                      </div>

                      <div className="admin-aside-grid" style={{ alignItems: 'center' }}>
                        {formData.bannerImageUrl && (
                          <div style={{ width: '100%', maxWidth: '160px', height: '85px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', background: '#0b132b' }}>
                            <img
                              src={getFullMediaUrl(formData.bannerImageUrl)}
                              alt="Banner Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
                          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Banner Image URL (/media/general/... or https://...)"
                              value={formData.bannerImageUrl || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                              style={{ flex: '1 1 200px', fontSize: '0.85rem', minWidth: 0 }}
                            />
                            <button
                              type="button"
                              onClick={() => openMediaFor({ type: 'pageBanner' })}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', fontWeight: 700 }}
                            >
                              <Image size={14} />
                              <span>Choose / Upload Image</span>
                            </button>
                          </div>

                          <div className="admin-form-grid-2" style={{ gap: '0.65rem' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Banner Title Override (optional, defaults to Page Title)"
                              value={formData.bannerTitle || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bannerTitle: e.target.value }))}
                              style={{ fontSize: '0.8rem' }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Banner Subtitle Override (optional)"
                              value={formData.bannerSubtitle || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.sections.length === 0 ? (
                      <div 
                        style={{
                          border: '2px dashed var(--border)',
                          borderRadius: '16px',
                          padding: '4rem 2rem',
                          textAlign: 'center',
                          background: 'var(--bg-app)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layout size={28} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>Your canvas is empty</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '420px' }}>
                            Click any block from the left palette or drag it here to begin constructing this page.
                          </p>
                        </div>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                          <button type="button" onClick={() => addSection('hero')} className="btn btn-secondary btn-sm">+ Hero Banner</button>
                          <button type="button" onClick={() => addSection('text')} className="btn btn-secondary btn-sm">+ Rich Text</button>
                          <button type="button" onClick={() => addSection('video')} className="btn btn-secondary btn-sm">+ Video</button>
                          <button type="button" onClick={() => addSection('cards')} className="btn btn-secondary btn-sm">+ Feature Cards</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {formData.sections.map((sec, secIndex) => {
                          const blockMeta = BLOCK_TYPES.find(b => b.type === sec.type) || { label: sec.type, icon: Layout };
                          const BlockIcon = blockMeta.icon;
                          const isBeingDragged = draggedIndex === secIndex;
                          const isDragOver = dragOverIndex === secIndex;

                          return (
                            <div
                              key={sec.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, secIndex)}
                              onDragOver={(e) => handleDragOver(e, secIndex)}
                              onDrop={(e) => handleDrop(e, secIndex)}
                              className="card animate-fade-in"
                              style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: isDragOver ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: isBeingDragged ? 'var(--bg-app)' : 'var(--bg-surface)',
                                opacity: isBeingDragged ? 0.5 : 1,
                                boxShadow: isDragOver ? '0 0 16px var(--primary-glow)' : 'var(--shadow-sm)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {/* Block Control Bar */}
                              <div className="flex items-center justify-between" style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} 
                                    title="Drag to reorder section"
                                  >
                                    <GripVertical size={18} />
                                  </div>
                                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BlockIcon size={14} />
                                  </div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {blockMeta.label}
                                  </span>
                                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                    #{secIndex + 1}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => duplicateSection(secIndex)} className="btn btn-secondary btn-xs" title="Duplicate Block">
                                    <Copy size={13} />
                                  </button>
                                  <button type="button" onClick={() => moveSection(secIndex, -1)} className="btn btn-secondary btn-xs" disabled={secIndex === 0} title="Move Up">
                                    <ChevronUp size={13} />
                                  </button>
                                  <button type="button" onClick={() => moveSection(secIndex, 1)} className="btn btn-secondary btn-xs" disabled={secIndex === formData.sections.length - 1} title="Move Down">
                                    <ChevronDown size={13} />
                                  </button>
                                  <button type="button" onClick={() => removeSection(secIndex)} className="btn btn-danger btn-xs" title="Delete Block">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* BLOCK FORM FIELDS (NO JSON) */}
                              
                              {/* 1. Rich Text Block */}
                              {sec.type === 'text' && (
                                <div>
                                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>Visual Rich Text Editor</label>
                                  <RichTextEditor
                                    value={sec.content}
                                    onChange={(html) => updateSection(secIndex, { content: html })}
                                  />
                                </div>
                              )}

                              {/* 2. Video Player Block */}
                              {sec.type === 'video' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title (Optional)</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Jonikwiria Learning Walkthrough"
                                        value={sec.title || ''}
                                        onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Caption / Subtitle</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Discover our training approach"
                                        value={sec.caption || ''}
                                        onChange={(e) => updateSection(secIndex, { caption: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Video URL (YouTube, Vimeo, or Video File Link)</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://www.youtube.com/watch?v=... or /uploads/media/video.mp4"
                                        value={sec.videoUrl || ''}
                                        onChange={(e) => updateSection(secIndex, { videoUrl: e.target.value })}
                                        style={{ flex: 1 }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => openMediaFor({ secIndex, field: 'videoUrl' })}
                                        className="btn btn-secondary btn-sm"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                                      >
                                        <Play size={14} />
                                        <span>Pick from Media</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 3. Hero Banner Block */}
                              {sec.type === 'hero' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Top Badge</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Welcome"
                                        value={sec.badge || ''}
                                        onChange={(e) => updateSection(secIndex, { badge: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Hero Headline</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Empowering The Digital Generation"
                                        value={sec.title || ''}
                                        onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Subtitle Description</label>
                                    <textarea
                                      className="form-textarea"
                                      rows={2}
                                      placeholder="Practical skills and custom software development..."
                                      value={sec.subtitle || ''}
                                      onChange={(e) => updateSection(secIndex, { subtitle: e.target.value })}
                                    />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Learn More"
                                        value={sec.btnText || ''}
                                        onChange={(e) => updateSection(secIndex, { btnText: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Link</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="/p/about-us"
                                        value={sec.btnUrl || ''}
                                        onChange={(e) => updateSection(secIndex, { btnUrl: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Background Image (Optional)</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Image URL..."
                                          value={sec.bgImage || ''}
                                          onChange={(e) => updateSection(secIndex, { bgImage: e.target.value })}
                                          style={{ flex: 1 }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => openMediaFor({ secIndex, field: 'bgImage' })}
                                          className="btn btn-secondary btn-sm"
                                        >
                                          <Image size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 4. Split Two-Column Block */}
                              {sec.type === 'split' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Badge</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Highlights"
                                        value={sec.badge || ''}
                                        onChange={(e) => updateSection(secIndex, { badge: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Title text"
                                        value={sec.title || ''}
                                        onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Layout Order</label>
                                      <select
                                        className="form-select"
                                        value={sec.layout || 'media-right'}
                                        onChange={(e) => updateSection(secIndex, { layout: e.target.value })}
                                      >
                                        <option value="media-right">Media on Right</option>
                                        <option value="media-left">Media on Left</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Rich Text Content</label>
                                    <RichTextEditor
                                      value={sec.content}
                                      onChange={(html) => updateSection(secIndex, { content: html })}
                                    />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Media Image</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Image URL..."
                                          value={sec.image || ''}
                                          onChange={(e) => updateSection(secIndex, { image: e.target.value })}
                                          style={{ flex: 1 }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => openMediaFor({ secIndex, field: 'image' })}
                                          className="btn btn-secondary btn-sm"
                                        >
                                          <Image size={14} />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Learn More"
                                        value={sec.btnText || ''}
                                        onChange={(e) => updateSection(secIndex, { btnText: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Link</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="/p/about-us"
                                        value={sec.btnUrl || ''}
                                        onChange={(e) => updateSection(secIndex, { btnUrl: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 5. Feature Cards Block */}
                              {sec.type === 'cards' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Grid Title</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Key Features"
                                        value={sec.title || ''}
                                        onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Columns</label>
                                      <select
                                        className="form-select"
                                        value={sec.columns || 3}
                                        onChange={(e) => updateSection(secIndex, { columns: parseInt(e.target.value) || 3 })}
                                      >
                                        <option value={2}>2 Columns</option>
                                        <option value={3}>3 Columns</option>
                                        <option value={4}>4 Columns</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {(sec.items || []).map((card, cardIdx) => (
                                      <div key={cardIdx} style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Card #{cardIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const items = sec.items.filter((_, i) => i !== cardIdx);
                                              updateSection(secIndex, { items });
                                            }}
                                            className="btn btn-danger btn-xs"
                                          >
                                            Remove
                                          </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                          <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Card Title"
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                            value={card.title || ''}
                                            onChange={(e) => {
                                              const items = [...sec.items];
                                              items[cardIdx] = { ...items[cardIdx], title: e.target.value };
                                              updateSection(secIndex, { items });
                                            }}
                                          />
                                          <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Badge (e.g. Hot)"
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                            value={card.badge || ''}
                                            onChange={(e) => {
                                              const items = [...sec.items];
                                              items[cardIdx] = { ...items[cardIdx], badge: e.target.value };
                                              updateSection(secIndex, { items });
                                            }}
                                          />
                                          <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Link URL (/p/...)"
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                            value={card.link || ''}
                                            onChange={(e) => {
                                              const items = [...sec.items];
                                              items[cardIdx] = { ...items[cardIdx], link: e.target.value };
                                              updateSection(secIndex, { items });
                                            }}
                                          />
                                        </div>

                                        <textarea
                                          className="form-textarea"
                                          rows={2}
                                          placeholder="Card description body..."
                                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', marginBottom: '0.4rem' }}
                                          value={card.text || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[cardIdx] = { ...items[cardIdx], text: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />

                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Card Image URL..."
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', flex: 1 }}
                                            value={card.image || ''}
                                            onChange={(e) => {
                                              const items = [...sec.items];
                                              items[cardIdx] = { ...items[cardIdx], image: e.target.value };
                                              updateSection(secIndex, { items });
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => openMediaFor({ secIndex, cardIndex: cardIdx, field: 'image' })}
                                            className="btn btn-secondary btn-xs"
                                          >
                                            <Image size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = [...(sec.items || []), { title: 'New Feature', text: 'Feature description', image: '', badge: '', link: '' }];
                                        updateSection(secIndex, { items });
                                      }}
                                      className="btn btn-secondary btn-xs w-full"
                                    >
                                      + Add Card
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 6. Stats Metric Block */}
                              {sec.type === 'stats' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="e.g. Key Performance Metrics"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                    />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                    {(sec.items || []).map((st, stIdx) => (
                                      <div key={stIdx} style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div className="flex justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Metric #{stIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const items = sec.items.filter((_, i) => i !== stIdx);
                                              updateSection(secIndex, { items });
                                            }}
                                            className="btn btn-danger btn-xs"
                                            style={{ padding: '0.1rem 0.3rem' }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Number (e.g. 500+)"
                                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.4rem', marginBottom: '0.3rem', fontWeight: 800 }}
                                          value={st.number || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[stIdx] = { ...items[stIdx], number: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Label (e.g. Students)"
                                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem', marginBottom: '0.3rem' }}
                                          value={st.label || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[stIdx] = { ...items[stIdx], label: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Subtext (Optional)"
                                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                                          value={st.subtext || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[stIdx] = { ...items[stIdx], subtext: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const items = [...(sec.items || []), { number: '100+', label: 'New Metric', subtext: 'Description' }];
                                      updateSection(secIndex, { items });
                                    }}
                                    className="btn btn-secondary btn-xs"
                                  >
                                    + Add Metric
                                  </button>
                                </div>
                              )}

                              {/* 7. Call To Action (CTA) Block */}
                              {sec.type === 'cta' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>CTA Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="Ready to transform your tech skills?"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                    />
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Subtitle</label>
                                    <textarea
                                      className="form-textarea"
                                      rows={2}
                                      placeholder="Join our community of creators and builders today..."
                                      value={sec.subtitle || ''}
                                      onChange={(e) => updateSection(secIndex, { subtitle: e.target.value })}
                                    />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Get Started"
                                        value={sec.btnText || ''}
                                        onChange={(e) => updateSection(secIndex, { btnText: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button URL</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="/p/about-us"
                                        value={sec.btnUrl || ''}
                                        onChange={(e) => updateSection(secIndex, { btnUrl: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Theme Gradient</label>
                                      <select
                                        className="form-select"
                                        value={sec.gradient || 'linear-gradient(135deg, #0052cc 0%, #007bff 100%)'}
                                        onChange={(e) => updateSection(secIndex, { gradient: e.target.value })}
                                      >
                                        <option value="linear-gradient(135deg, #0052cc 0%, #007bff 100%)">Classic Blue</option>
                                        <option value="linear-gradient(135deg, #10b981 0%, #059669 100%)">Emerald Green</option>
                                        <option value="linear-gradient(135deg, #6f42c1 0%, #4c1d95 100%)">Royal Purple</option>
                                        <option value="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)">Dark Modern</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 8. Accordion / FAQ Block */}
                              {sec.type === 'accordion' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Accordion Header Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="Frequently Asked Questions"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                    />
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(sec.items || []).map((item, itemIdx) => (
                                      <div key={itemIdx} style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                        <div className="flex justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Item #{itemIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const items = sec.items.filter((_, i) => i !== itemIdx);
                                              updateSection(secIndex, { items });
                                            }}
                                            className="btn btn-danger btn-xs"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="Question / Header"
                                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', marginBottom: '0.3rem' }}
                                          value={item.header || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[itemIdx] = { ...items[itemIdx], header: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                        <textarea
                                          className="form-textarea"
                                          rows={2}
                                          placeholder="Answer details..."
                                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                                          value={item.content || ''}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[itemIdx] = { ...items[itemIdx], content: e.target.value };
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = [...(sec.items || []), { header: 'New Question', content: 'Answer text' }];
                                        updateSection(secIndex, { items });
                                      }}
                                      className="btn btn-secondary btn-xs"
                                    >
                                      + Add FAQ Item
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 9. Bullet / Numbered List Block */}
                              {sec.type === 'list' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>List Title</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Key Highlights"
                                        value={sec.title || ''}
                                        onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                      />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>List Style</label>
                                      <select
                                        className="form-select"
                                        value={sec.listType || 'unordered'}
                                        onChange={(e) => updateSection(secIndex, { listType: e.target.value })}
                                      >
                                        <option value="unordered">Bullet List (•)</option>
                                        <option value="ordered">Numbered List (1, 2, 3)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {(sec.items || []).map((item, itemIdx) => (
                                      <div key={itemIdx} className="flex items-center gap-2">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                                          {sec.listType === 'ordered' ? `${itemIdx + 1}.` : '•'}
                                        </span>
                                        <input
                                          type="text"
                                          className="form-input"
                                          placeholder="List item point..."
                                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', flex: 1 }}
                                          value={item}
                                          onChange={(e) => {
                                            const items = [...sec.items];
                                            items[itemIdx] = e.target.value;
                                            updateSection(secIndex, { items });
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = sec.items.filter((_, i) => i !== itemIdx);
                                            updateSection(secIndex, { items });
                                          }}
                                          className="btn btn-danger btn-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = [...(sec.items || []), 'New list point'];
                                        updateSection(secIndex, { items });
                                      }}
                                      className="btn btn-secondary btn-xs"
                                      style={{ alignSelf: 'flex-start' }}
                                    >
                                      + Add Bullet Item
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 10. Carousel Slider Block */}
                              {sec.type === 'carousel' && (
                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Linked Carousel Playlist</label>
                                  <select
                                    className="form-select"
                                    value={sec.carouselId || ''}
                                    onChange={(e) => updateSection(secIndex, { carouselId: e.target.value })}
                                  >
                                    <option value="">Select Slider Playlist...</option>
                                    {carousels.map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* 11. News Feed Block */}
                              {sec.type === 'news_feed' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="Latest News"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(secIndex, { title: e.target.value })}
                                    />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Post Limit</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={12}
                                      className="form-input"
                                      value={sec.limit || 3}
                                      onChange={(e) => updateSection(secIndex, { limit: parseInt(e.target.value) || 3 })}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* 12. About Us Intro Block */}
                              {sec.type === 'about_intro' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                  <div style={{ background: 'rgba(0,123,255,0.06)', border: '1px solid rgba(0,123,255,0.15)', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                                    ✨ About Us Intro — Fill in each field below. No code required.
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Main Headline</label>
                                      <input type="text" className="form-input" placeholder="e.g. About JONIKWIRIA" value={sec.headline || ''} onChange={(e) => updateSection(secIndex, { headline: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Tagline (Gradient text below headline)</label>
                                      <input type="text" className="form-input" placeholder="e.g. Building People. Building Technology." value={sec.tagline || ''} onChange={(e) => updateSection(secIndex, { tagline: e.target.value })} />
                                    </div>
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Paragraph 1 (Bold / Introduction)</label>
                                    <textarea className="form-textarea" rows={2} placeholder="Bold intro paragraph..." value={sec.para1 || ''} onChange={(e) => updateSection(secIndex, { para1: e.target.value })} />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Paragraph 2</label>
                                    <textarea className="form-textarea" rows={2} placeholder="Second paragraph..." value={sec.para2 || ''} onChange={(e) => updateSection(secIndex, { para2: e.target.value })} />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Paragraph 3 (Optional)</label>
                                    <textarea className="form-textarea" rows={2} placeholder="Third paragraph (optional)..." value={sec.para3 || ''} onChange={(e) => updateSection(secIndex, { para3: e.target.value })} />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                                      <input type="text" className="form-input" placeholder="Learn More" value={sec.btnText || ''} onChange={(e) => updateSection(secIndex, { btnText: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Link</label>
                                      <input type="text" className="form-input" placeholder="/p/about-us" value={sec.btnUrl || ''} onChange={(e) => updateSection(secIndex, { btnUrl: e.target.value })} />
                                    </div>
                                  </div>

                                  {/* Feature Highlight Cards */}
                                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem 0' }}>Right-side Feature Highlight Cards</p>
                                    {(sec.features || []).map((feat, fi) => (
                                      <div key={fi} style={{ background: 'var(--bg-app)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                          <span style={{ fontSize: '0.73rem', fontWeight: 800 }}>Feature Card #{fi + 1}</span>
                                          <button type="button" className="btn btn-danger btn-xs" onClick={() => { const features = (sec.features || []).filter((_, i) => i !== fi); updateSection(secIndex, { features }); }}>Remove</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                          <input type="text" className="form-input" placeholder="Card Title" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} value={feat.title || ''} onChange={(e) => { const features = [...(sec.features || [])]; features[fi] = { ...features[fi], title: e.target.value }; updateSection(secIndex, { features }); }} />
                                          <select className="form-select" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} value={feat.icon || 'code'} onChange={(e) => { const features = [...(sec.features || [])]; features[fi] = { ...features[fi], icon: e.target.value }; updateSection(secIndex, { features }); }}>
                                            <option value="code">💻 Code</option>
                                            <option value="cpu">🔧 CPU / Hardware</option>
                                            <option value="rocket">🚀 Rocket</option>
                                            <option value="lightbulb">💡 Lightbulb</option>
                                            <option value="award">🏆 Award</option>
                                            <option value="book">📖 Book</option>
                                            <option value="shield">🛡️ Shield</option>
                                            <option value="chart">📊 Chart</option>
                                            <option value="globe">🌐 Globe</option>
                                            <option value="users">👥 Users</option>
                                            <option value="star">⭐ Star</option>
                                            <option value="sparkles">✨ Sparkles</option>
                                          </select>
                                        </div>
                                        <textarea className="form-textarea" rows={1} placeholder="Card description" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} value={feat.desc || ''} onChange={(e) => { const features = [...(sec.features || [])]; features[fi] = { ...features[fi], desc: e.target.value }; updateSection(secIndex, { features }); }} />
                                      </div>
                                    ))}
                                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => { const features = [...(sec.features || []), { title: 'New Feature', desc: 'Feature description', icon: 'star', color: (sec.features||[]).length % 6 }]; updateSection(secIndex, { features }); }}>+ Add Feature Card</button>
                                  </div>
                                </div>
                              )}

                              {/* 13. Core Values Grid Block */}
                              {sec.type === 'values_grid' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                  <div style={{ background: 'rgba(0,123,255,0.06)', border: '1px solid rgba(0,123,255,0.15)', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                                    ⭐ Core Values Grid — Add as many values as you need. No code required.
                                  </div>

                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title</label>
                                    <input type="text" className="form-input" placeholder="Our Core Values" value={sec.title || ''} onChange={(e) => updateSection(secIndex, { title: e.target.value })} />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Subtitle</label>
                                    <textarea className="form-textarea" rows={2} placeholder="A short sentence describing your values..." value={sec.subtitle || ''} onChange={(e) => updateSection(secIndex, { subtitle: e.target.value })} />
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(sec.values || []).map((val, vi) => (
                                      <div key={vi} style={{ background: 'var(--bg-app)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                          <span style={{ fontSize: '0.73rem', fontWeight: 800 }}>Value #{vi + 1}</span>
                                          <button type="button" className="btn btn-danger btn-xs" onClick={() => { const values = (sec.values || []).filter((_, i) => i !== vi); updateSection(secIndex, { values }); }}>Remove</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                          <input type="text" className="form-input" placeholder="Value Name (e.g. Integrity)" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} value={val.title || ''} onChange={(e) => { const values = [...(sec.values || [])]; values[vi] = { ...values[vi], title: e.target.value }; updateSection(secIndex, { values }); }} />
                                          <select className="form-select" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} value={val.icon || 'star'} onChange={(e) => { const values = [...(sec.values || [])]; values[vi] = { ...values[vi], icon: e.target.value }; updateSection(secIndex, { values }); }}>
                                            <option value="lightbulb">💡 Lightbulb (Innovation)</option>
                                            <option value="award">🏆 Award (Excellence)</option>
                                            <option value="wrench">🔧 Wrench (Practicality)</option>
                                            <option value="shield">🛡️ Shield (Integrity)</option>
                                            <option value="book">📖 Book (Learning)</option>
                                            <option value="rocket">🚀 Rocket (Impact)</option>
                                            <option value="star">⭐ Star</option>
                                            <option value="zap">⚡ Zap (Speed)</option>
                                            <option value="globe">🌐 Globe (Global)</option>
                                            <option value="heart">❤️ Heart (Care)</option>
                                            <option value="users">👥 Users (Community)</option>
                                            <option value="sparkles">✨ Sparkles (Magic)</option>
                                            <option value="trending">📈 Trending (Growth)</option>
                                          </select>
                                        </div>
                                        <textarea className="form-textarea" rows={2} placeholder="Describe this value in 1-2 sentences..." style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }} value={val.desc || ''} onChange={(e) => { const values = [...(sec.values || [])]; values[vi] = { ...values[vi], desc: e.target.value }; updateSection(secIndex, { values }); }} />
                                      </div>
                                    ))}
                                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => { const values = [...(sec.values || []), { title: 'New Value', desc: 'Describe this value...', icon: 'star' }]; updateSection(secIndex, { values }); }}>+ Add Value</button>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PAGE SETTINGS & SEO */}
              {activeTab === 'settings' && (
                <div style={{ padding: 'clamp(1rem, 2.5vw, 2rem)', overflowY: 'auto', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    Page Configurations & SEO
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Page Title</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Page URL Slug</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. artificial-intelligence"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Page Type</label>
                        <select
                          className="form-select"
                          value={formData.pageType}
                          onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                        >
                          <option value="standard">Standard Page</option>
                          <option value="news">News Article</option>
                          <option value="event">Event Page</option>
                          <option value="course">Course Details</option>
                          <option value="custom">Custom Page Type...</option>
                        </select>
                      </div>
                    </div>

                    {formData.pageType === 'custom' && (
                      <div className="form-group">
                        <label className="form-label">Custom Page Type Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. training, solution"
                          value={formData.customPageType}
                          onChange={(e) => setFormData({ ...formData, customPageType: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="admin-form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Publishing Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="draft">Draft (Private)</option>
                          <option value="pending_approval">Pending Approval</option>
                          <option value="published">Published Live</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Meta Description (SEO)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Brief description for Google Search"
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Header Banner Configuration */}
                    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-app)', borderRadius: '10px' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Image size={16} color="var(--primary)" />
                          <span>Page Header Banner & Background Image</span>
                        </h4>
                        {formData.bannerImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, bannerImageUrl: '' }))}
                            className="btn btn-secondary btn-xs"
                            style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                          >
                            Clear Image
                          </button>
                        )}
                      </div>

                      <div className="admin-aside-grid" style={{ alignItems: 'center', marginBottom: '0.75rem' }}>
                        {formData.bannerImageUrl && (
                          <div style={{ width: '100%', maxWidth: '140px', height: '75px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', background: '#0b132b' }}>
                            <img
                              src={getFullMediaUrl(formData.bannerImageUrl)}
                              alt="Banner Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', minWidth: 0, width: '100%' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Banner Image URL (/media/general/... or https://...)"
                            value={formData.bannerImageUrl || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                            style={{ flex: '1 1 200px', fontSize: '0.85rem', minWidth: 0 }}
                          />
                          <button
                            type="button"
                            onClick={() => openMediaFor({ type: 'pageBanner' })}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', fontWeight: 700 }}
                          >
                            <Image size={14} />
                            <span>Select / Upload</span>
                          </button>
                        </div>
                      </div>

                      <div className="admin-form-grid-2" style={{ gap: '0.75rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Banner Title Override (optional, defaults to Page Title)"
                          value={formData.bannerTitle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, bannerTitle: e.target.value }))}
                          style={{ fontSize: '0.8rem' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Banner Subtitle Override (optional)"
                          value={formData.bannerSubtitle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    {/* Discussion & Comments */}
                    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-app)', borderRadius: '10px' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={16} color="var(--primary)" />
                        <span>Interactive Discussion & Comments</span>
                      </h4>
                      <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input
                            type="checkbox"
                            checked={formData.chatSettings?.enabled || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              chatSettings: { ...formData.chatSettings, enabled: e.target.checked }
                            })}
                          />
                          <span>Allow Visitors to Comment</span>
                        </label>
                        {formData.chatSettings?.enabled && (
                          <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={formData.chatSettings?.allowReplies || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                chatSettings: { ...formData.chatSettings, allowReplies: e.target.checked }
                              })}
                            />
                            <span>Allow Nested Replies</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.showInMenu}
                          onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                        />
                        <span>Show In Navigation Menu</span>
                      </label>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.isHomepage}
                          onChange={(e) => setFormData({ ...formData, isHomepage: e.target.checked })}
                        />
                        <span>Set as Site Homepage</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total Blocks: <strong>{formData.sections.length}</strong>
                </span>

                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1.25rem', fontWeight: 800 }}>
                    {editingPage ? 'Update Page' : 'Save & Publish Page'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE PREVIEW MODAL ────────────────────────────────────── */}
      {previewOpen && previewPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '0.5rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '1100px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
            <div className="admin-card-header-responsive" style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2">
                <Eye size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Preview: {previewPage.title}</h3>
                <span className="badge badge-warning" style={{ fontSize: '0.75rem', fontWeight: 800 }}>PREVIEW</span>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="btn btn-secondary btn-sm">
                Close Preview
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: 'clamp(0.75rem, 2vw, 2rem)', background: 'var(--bg-app)' }}>
              <div className="card" style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(1rem, 2.5vw, 2.5rem)', borderRadius: '16px', background: 'var(--bg-surface)' }}>
                {previewPage.bannerImageUrl ? (
                  <div style={{
                    marginBottom: '2.5rem',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, rgba(7, 13, 29, 0.82) 0%, rgba(12, 25, 56, 0.88) 100%), url(${getFullMediaUrl(previewPage.bannerImageUrl)}) center/cover no-repeat`,
                    color: '#fff',
                    padding: '3.5rem 2rem'
                  }}>
                    <span className="badge badge-primary" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>{previewPage.pageType || 'Page'}</span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.75rem 0', color: '#fff' }}>{previewPage.bannerTitle || previewPage.title}</h1>
                    {(previewPage.bannerSubtitle || previewPage.metaDescription) && (
                      <p style={{ opacity: 0.9, fontSize: '1.1rem', margin: 0, maxWidth: '700px', lineHeight: 1.6 }}>
                        {previewPage.bannerSubtitle || previewPage.metaDescription}
                      </p>
                    )}
                  </div>
                ) : (
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-main)' }}>{previewPage.title}</h1>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  {(previewPage.sections || []).map((sec, idx) => {
                    if (sec.type === 'text') {
                      return <div key={idx} dangerouslySetInnerHTML={{ __html: sec.content }} style={{ lineHeight: 1.8, fontSize: '1.05rem' }} />;
                    }
                    if (sec.type === 'video') {
                      return (
                        <div key={idx}>
                          {sec.title && <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>{sec.title}</h3>}
                          <div style={{ background: '#000', borderRadius: '12px', padding: '2.5rem', color: '#fff', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                            <Play size={36} style={{ margin: '0 auto 0.5rem auto', color: 'var(--primary)' }} />
                            <div style={{ fontWeight: 700 }}>Video: {sec.videoUrl || 'No video link'}</div>
                            {sec.caption && <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>{sec.caption}</p>}
                          </div>
                        </div>
                      );
                    }
                    if (sec.type === 'hero') {
                      const bgImg = getFullMediaUrl(sec.bgImage);
                      return (
                        <div key={idx} style={{ padding: '3.5rem 2rem', borderRadius: '16px', background: bgImg ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgImg}) center/cover` : 'linear-gradient(135deg, #0052cc 0%, #007bff 100%)', color: '#fff', textAlign: sec.align || 'center' }}>
                          {sec.badge && <span className="badge" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.2)', color: '#fff', textTransform: 'uppercase' }}>{sec.badge}</span>}
                          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>{sec.title}</h2>
                          <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '600px', margin: sec.align === 'left' ? '0 0 1.5rem 0' : '0 auto 1.5rem auto' }}>{sec.subtitle}</p>
                          {sec.btnText && <button type="button" className="btn btn-primary" style={{ background: '#fff', color: '#0052cc', fontWeight: 800 }}>{sec.btnText}</button>}
                        </div>
                      );
                    }
                    if (sec.type === 'split') {
                      const mediaRight = sec.layout === 'media-right';
                      const mediaImg = getFullMediaUrl(sec.image);
                      return (
                        <div key={idx} className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ order: mediaRight ? 1 : 2 }}>
                              {sec.badge && <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{sec.badge}</span>}
                              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>{sec.title}</h3>
                              <div dangerouslySetInnerHTML={{ __html: sec.content }} style={{ lineHeight: 1.7, color: 'var(--text-muted)' }} />
                              {sec.btnText && <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>{sec.btnText}</button>}
                            </div>
                            <div style={{ order: mediaRight ? 2 : 1 }}>
                              {mediaImg ? (
                                <img src={mediaImg} alt="Split Preview" style={{ width: '100%', borderRadius: '10px', maxHeight: '250px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ height: '180px', background: 'var(--bg-app)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Image Container</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (sec.type === 'cards') {
                      return (
                        <div key={idx}>
                          {sec.title && <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>{sec.title}</h3>}
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sec.columns || 3}, 1fr)`, gap: '1rem' }}>
                            {(sec.items || []).map((c, cIdx) => (
                              <div key={cIdx} className="card flex flex-col" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
                                {c.image && <img src={getFullMediaUrl(c.image)} alt={c.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }} />}
                                <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                                  <h4 style={{ fontWeight: 700, margin: 0, fontSize: '1.05rem' }}>{c.title}</h4>
                                  {c.badge && <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{c.badge}</span>}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{c.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (sec.type === 'stats') {
                      return (
                        <div key={idx}>
                          {sec.title && <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>{sec.title}</h3>}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                            {(sec.items || []).map((s, sIdx) => (
                              <div key={sIdx} className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{s.number}</div>
                                <div style={{ fontWeight: 700 }}>{s.label}</div>
                                {s.subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.subtext}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (sec.type === 'cta') {
                      return (
                        <div key={idx} style={{ padding: '2.5rem 1.5rem', borderRadius: '14px', background: sec.gradient || 'linear-gradient(135deg, #0052cc 0%, #007bff 100%)', color: '#fff', textAlign: 'center' }}>
                          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>{sec.title}</h3>
                          <p style={{ opacity: 0.9, fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto 1.25rem auto' }}>{sec.subtitle}</p>
                          {sec.btnText && <button type="button" className="btn" style={{ background: '#fff', color: '#0052cc', fontWeight: 800 }}>{sec.btnText}</button>}
                        </div>
                      );
                    }
                    if (sec.type === 'accordion') {
                      return (
                        <div key={idx}>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>{sec.title}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(sec.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="card" style={{ padding: '0.85rem 1.2rem', border: '1px solid var(--border)' }}>
                                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.header}</strong>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>{item.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (sec.type === 'list') {
                      return (
                        <div key={idx}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>{sec.title}</h3>
                          {sec.listType === 'ordered' ? (
                            <ol style={{ paddingLeft: '1.5rem' }}>
                              {(sec.items || []).map((li, lIdx) => <li key={lIdx} style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>{li}</li>)}
                            </ol>
                          ) : (
                            <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                              {(sec.items || []).map((li, lIdx) => <li key={lIdx} style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>{li}</li>)}
                            </ul>
                          )}
                        </div>
                      );
                    }
                    if (sec.type === 'carousel') {
                      return (
                        <div key={idx} className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
                          <Tv size={28} style={{ margin: '0 auto 0.5rem auto', color: 'var(--primary)' }} />
                          <div style={{ fontWeight: 700 }}>Carousel Slider (ID: {sec.carouselId || 'Default'})</div>
                        </div>
                      );
                    }
                    if (sec.type === 'news_feed') {
                      return (
                        <div key={idx} className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
                          <Radio size={28} style={{ margin: '0 auto 0.5rem auto', color: 'var(--primary)' }} />
                          <div style={{ fontWeight: 700 }}>News Feed Preview ({sec.limit || 3} recent articles)</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Selector Modal Integration */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => { setMediaModalOpen(false); setActiveMediaTarget(null); }}
        onSelect={handleSelectMedia}
      />

    </div>
  );
};

export default PageManager;
