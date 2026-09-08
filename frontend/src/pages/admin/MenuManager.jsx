import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  Menu as MenuIcon, Plus, Edit2, Trash2, Home, ChevronRight, RefreshCw, 
  ArrowUp, ArrowDown, ChevronDown, PlusCircle, Check, Trash, Layout, Layers, Link as LinkIcon
} from 'lucide-react';
import api from '../../services/api';

const MenuManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  // Data States
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  // Modals / Form States for Menu Containers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: 'header',
    status: 'active'
  });

  // Menu Items Editor States
  const [menuItems, setMenuItems] = useState([]);
  const [activeItemForm, setActiveItemForm] = useState(null); // Node reference being edited
  const [itemFormData, setItemFormData] = useState({
    title: '',
    url: '',
    type: 'custom', // 'custom' or 'page'
    pageId: '',
    isMegaMenu: false,
    megaColumns: [] // array of columns for mega menu
  });

  const canCreate = hasPermission('menus', 'create');
  const canUpdate = hasPermission('menus', 'update');
  const canDelete = hasPermission('menus', 'delete');

  const fetchMenus = () => {
    setLoading(true);
    api.get('/menus')
      .then((res) => {
        if (res.data.success) {
          const fetched = res.data.menus || [];
          setMenus(fetched);
          // Auto select first menu if none selected
          if (fetched.length > 0 && !selectedMenu) {
            handleSelectMenu(fetched[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchPages = () => {
    api.get('/pages')
      .then((res) => {
        if (res.data.success) setPages(res.data.pages || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMenus();
    fetchPages();
  }, []);

  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setMenuItems(menu.items || []);
    setActiveItemForm(null);
  };

  const handleOpenModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name || '',
        location: menu.location || 'header',
        status: menu.status || 'active'
      });
    } else {
      setEditingMenu(null);
      setFormData({
        name: '',
        location: 'header',
        status: 'active'
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, formData);
        showSuccess('Menu updated successfully!');
      } else {
        await api.post('/menus', formData);
        showSuccess('Menu created successfully!');
      }
      setModalOpen(false);
      fetchMenus();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save menu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this menu container?')) {
      try {
        await api.delete(`/menus/${id}`);
        showSuccess('Menu deleted successfully.');
        if (selectedMenu?.id === id) setSelectedMenu(null);
        fetchMenus();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete menu');
      }
    }
  };

  // --- Menu Item Tree Logic ---
  const saveMenuItemsToDB = async (itemsList) => {
    if (!selectedMenu) return;
    try {
      await api.put(`/menus/${selectedMenu.id}`, {
        name: selectedMenu.name,
        location: selectedMenu.location,
        status: selectedMenu.status,
        items: itemsList
      });
      // Update local state and reference
      setSelectedMenu(prev => ({ ...prev, items: itemsList }));
      setMenuItems(itemsList);
      showSuccess('Menu items updated successfully.');
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to sync menu items');
    }
  };

  const handleAddTopLevelItem = () => {
    const newItem = {
      id: 'item_' + Date.now(),
      title: 'New Menu Link',
      url: '/',
      type: 'custom',
      isMegaMenu: false,
      children: []
    };
    const updated = [...menuItems, newItem];
    saveMenuItemsToDB(updated);
    handleEditItem(newItem);
  };

  const handleAddChildItem = (parentId) => {
    const newItem = {
      id: 'item_' + Date.now(),
      title: 'Sub Link',
      url: '/',
      type: 'custom',
      isMegaMenu: false,
      children: []
    };

    const addChildRecursive = (list) => {
      return list.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...(item.children || []), newItem] };
        } else if (item.children?.length > 0) {
          return { ...item, children: addChildRecursive(item.children) };
        }
        return item;
      });
    };

    const updated = addChildRecursive(menuItems);
    saveMenuItemsToDB(updated);
    handleEditItem(newItem);
  };

  const handleEditItem = (item) => {
    setActiveItemForm(item.id);
    setItemFormData({
      title: item.title,
      url: item.url,
      type: item.type || 'custom',
      pageId: item.pageId || '',
      isMegaMenu: !!item.isMegaMenu,
      megaColumns: item.megaColumns || []
    });
  };

  const handleSaveItemForm = (itemId) => {
    let resolvedUrl = itemFormData.url;
    if (itemFormData.type === 'page' && itemFormData.pageId) {
      const selectedPage = pages.find(p => p.id === parseInt(itemFormData.pageId));
      if (selectedPage) resolvedUrl = `/p/${selectedPage.slug}`;
    }

    const updateRecursive = (list) => {
      return list.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            title: itemFormData.title,
            url: resolvedUrl,
            type: itemFormData.type,
            pageId: itemFormData.pageId,
            isMegaMenu: itemFormData.isMegaMenu,
            megaColumns: itemFormData.megaColumns
          };
        } else if (item.children?.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    const updated = updateRecursive(menuItems);
    saveMenuItemsToDB(updated);
    setActiveItemForm(null);
  };

  const handleDeleteItem = (itemId) => {
    if (!window.confirm('Remove this link and all its nested submenus?')) return;
    
    const deleteRecursive = (list) => {
      return list.filter(item => item.id !== itemId).map(item => {
        if (item.children?.length > 0) {
          return { ...item, children: deleteRecursive(item.children) };
        }
        return item;
      });
    };

    const updated = deleteRecursive(menuItems);
    saveMenuItemsToDB(updated);
    setActiveItemForm(null);
  };

  const handleMoveItem = (itemId, direction) => {
    const moveInList = (list) => {
      const index = list.findIndex(item => item.id === itemId);
      if (index !== -1) {
        const newList = [...list];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newList.length) {
          const temp = newList[index];
          newList[index] = newList[targetIndex];
          newList[targetIndex] = temp;
        }
        return newList;
      }
      return list.map(item => {
        if (item.children?.length > 0) {
          return { ...item, children: moveInList(item.children) };
        }
        return item;
      });
    };

    const updated = moveInList(menuItems);
    saveMenuItemsToDB(updated);
  };

  // --- Mega Menu Column Builders ---
  const handleAddMegaColumn = () => {
    const newCol = {
      id: 'col_' + Date.now(),
      title: 'Column Title',
      links: []
    };
    setItemFormData(prev => ({
      ...prev,
      megaColumns: [...(prev.megaColumns || []), newCol]
    }));
  };

  const handleRemoveMegaColumn = (colId) => {
    setItemFormData(prev => ({
      ...prev,
      megaColumns: prev.megaColumns.filter(c => c.id !== colId)
    }));
  };

  const handleAddMegaLink = (colId) => {
    const newLink = {
      id: 'link_' + Date.now(),
      title: 'Column Sublink',
      url: '/'
    };
    setItemFormData(prev => ({
      ...prev,
      megaColumns: prev.megaColumns.map(col => {
        if (col.id === colId) {
          return { ...col, links: [...(col.links || []), newLink] };
        }
        return col;
      })
    }));
  };

  const handleUpdateMegaLink = (colId, linkId, key, value) => {
    setItemFormData(prev => ({
      ...prev,
      megaColumns: prev.megaColumns.map(col => {
        if (col.id === colId) {
          return {
            ...col,
            links: col.links.map(lnk => lnk.id === linkId ? { ...lnk, [key]: value } : lnk)
          };
        }
        return col;
      })
    }));
  };

  const handleRemoveMegaLink = (colId, linkId) => {
    setItemFormData(prev => ({
      ...prev,
      megaColumns: prev.megaColumns.map(col => {
        if (col.id === colId) {
          return { ...col, links: col.links.filter(lnk => lnk.id !== linkId) };
        }
        return col;
      })
    }));
  };

  // Render tree node recursive component
  const renderItemNode = (item, level = 0) => {
    const isEditing = activeItemForm === item.id;
    return (
      <div key={item.id} style={{ marginLeft: `${Math.min(level * 16, 40)}px`, marginBottom: '0.5rem' }}>
        <div style={{
          background: isEditing ? 'var(--primary-light)' : 'var(--bg-surface)',
          borderLeft: `4px solid ${isEditing ? 'var(--primary)' : 'var(--secondary)'}`,
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.title}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {item.url}
            </span>
            {item.isMegaMenu && (
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Mega Menu</span>
            )}
          </div>

          <div className="table-action-btn-group" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
            <button type="button" onClick={() => handleMoveItem(item.id, 'up')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem', minHeight: 'auto' }} title="Move Up">
              <ArrowUp size={12} />
            </button>
            <button type="button" onClick={() => handleMoveItem(item.id, 'down')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem', minHeight: 'auto' }} title="Move Down">
              <ArrowDown size={12} />
            </button>
            {level === 0 && !item.isMegaMenu && (
              <button type="button" onClick={() => handleAddChildItem(item.id)} className="btn btn-info btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', minHeight: 'auto' }}>
                <PlusCircle size={12} /> Add Sub
              </button>
            )}
            <button type="button" onClick={() => handleEditItem(item)} className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', minHeight: 'auto' }}>
              Edit
            </button>
            <button type="button" onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem', minHeight: 'auto' }}>
              <Trash size={12} />
            </button>
          </div>
        </div>

        {/* Edit Form Drawer Inside Node */}
        {isEditing && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            padding: '1rem',
            margin: '0 0.25rem 0.75rem 0.25rem',
            borderRadius: '0 0 6px 6px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }} className="animate-fade-in">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)' }}>Link Settings</h4>
            
            <div className="flex flex-col gap-3">
              <div className="admin-form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Link Text / Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Link Type</label>
                  <select
                    className="form-select"
                    value={itemFormData.type}
                    onChange={(e) => setItemFormData({ ...itemFormData, type: e.target.value })}
                  >
                    <option value="custom">Custom URL / Hash Link</option>
                    <option value="page">Dynamic Standard Page</option>
                  </select>
                </div>
              </div>

              {itemFormData.type === 'page' ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Page</label>
                  <select
                    className="form-select"
                    value={itemFormData.pageId}
                    onChange={(e) => setItemFormData({ ...itemFormData, pageId: e.target.value })}
                  >
                    <option value="">-- Choose Page --</option>
                    {pages.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (/p/{p.slug})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>URL Path</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="/courses or https://external-link.com"
                    value={itemFormData.url}
                    onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
                  />
                </div>
              )}

              {/* Mega Menu Toggle - Only available for top level */}
              {level === 0 && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemFormData.isMegaMenu}
                      onChange={(e) => setItemFormData({ ...itemFormData, isMegaMenu: e.target.checked })}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Convert to Columns Mega Menu Layout</span>
                  </label>
                  
                  {itemFormData.isMegaMenu && (
                    <div style={{ marginTop: '1rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: '6px' }} className="animate-fade-in">
                      <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Mega Menu Columns</span>
                        <button type="button" onClick={handleAddMegaColumn} className="btn btn-primary btn-sm" style={{ minHeight: '28px', fontSize: '0.75rem' }}>
                          + Add Column
                        </button>
                      </div>

                      {itemFormData.megaColumns.length === 0 ? (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No columns configured yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          {itemFormData.megaColumns.map((col) => (
                            <div key={col.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem' }}>
                              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: '26px', fontWeight: 700 }}
                                  value={col.title}
                                  onChange={(e) => {
                                    setItemFormData(prev => ({
                                      ...prev,
                                      megaColumns: prev.megaColumns.map(c => c.id === col.id ? { ...c, title: e.target.value } : c)
                                    }));
                                  }}
                                />
                                <button type="button" onClick={() => handleRemoveMegaColumn(col.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                  <Trash size={12} />
                                </button>
                              </div>

                              {/* Column links list */}
                              <div className="flex flex-col gap-2">
                                {col.links?.map(lnk => (
                                  <div key={lnk.id} className="flex gap-1 items-center">
                                    <input
                                      type="text"
                                      placeholder="Label"
                                      className="form-input"
                                      style={{ padding: '0.15rem 0.3rem', fontSize: '0.7rem', height: '24px' }}
                                      value={lnk.title}
                                      onChange={(e) => handleUpdateMegaLink(col.id, lnk.id, 'title', e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      placeholder="URL"
                                      className="form-input"
                                      style={{ padding: '0.15rem 0.3rem', fontSize: '0.7rem', height: '24px' }}
                                      value={lnk.url}
                                      onChange={(e) => handleUpdateMegaLink(col.id, lnk.id, 'url', e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveMegaLink(col.id, lnk.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                      <Trash size={10} />
                                    </button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => handleAddMegaLink(col.id)} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textAlign: 'left', fontWeight: 700 }}>
                                  + Add Link
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setActiveItemForm(null)} className="btn btn-secondary btn-sm" style={{ minHeight: '28px', fontSize: '0.75rem' }}>
                  Cancel
                </button>
                <button type="button" onClick={() => handleSaveItemForm(item.id)} className="btn btn-primary btn-sm" style={{ minHeight: '28px', fontSize: '0.75rem' }}>
                  <Check size={12} /> Save Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render child nodes recursively */}
        {item.children?.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            {item.children.map(child => renderItemNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="content-header">
        <h1>Navigation & Menu Management <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Mega Menus & Placements</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Menus</span>
        </div>
      </div>

      <div className="main-content">
        <div className="admin-aside-grid">
          
          {/* Left Column: Menu Containers */}
          <div className="card card-primary card-outline" style={{ minWidth: 0, maxWidth: '100%' }}>
            <div className="card-header admin-card-header-responsive" style={{ padding: '0.75rem 1rem' }}>
              <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Menu Placements</h3>
              {canCreate && (
                <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm" style={{ minHeight: '28px', padding: '0 0.5rem' }}>
                  + New
                </button>
              )}
            </div>

            <div className="card-body" style={{ padding: '0.5rem' }}>
              <div className="flex flex-col gap-1">
                {menus.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMenu(m)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedMenu?.id === m.id ? 'var(--primary-light)' : 'transparent',
                      border: `1px solid ${selectedMenu?.id === m.id ? 'var(--primary)' : 'transparent'}`,
                      transition: 'var(--transition)'
                    }}
                    className="flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedMenu?.id === m.id ? 'var(--primary)' : 'var(--text-main)' }}>{m.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location: {m.location}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {canUpdate && (
                        <button type="button" onClick={() => handleOpenModal(m)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Edit2 size={12} />
                        </button>
                      )}
                      {canDelete && (
                        <button type="button" onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Menu Designer & Interactive Preview */}
          {selectedMenu ? (
            <div className="flex flex-col gap-6" style={{ minWidth: 0, maxWidth: '100%' }}>
              
              {/* Live Interactive Navigation Preview */}
              <div className="card card-info card-outline" style={{ borderTopWidth: '3px' }}>
                <div className="card-header">
                  <h3 className="card-title flex items-center gap-2" style={{ color: 'var(--info)', fontSize: '0.9rem' }}>
                    <Layout size={16} />
                    <span>Real-time Interactive Nav Preview (Location: {selectedMenu.location.toUpperCase()})</span>
                  </h3>
                </div>

                <div className="card-body" style={{ background: '#f8fafc', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '4px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {/* Mock Navbar Container */}
                  <div style={{
                    minWidth: '460px',
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-md)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    padding: '0 1.5rem',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    {/* Brand */}
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={16} color="var(--primary)" />
                      <span>Academy Portal</span>
                    </div>

                    {/* Previewed Menu Items */}
                    <div className="flex items-center gap-6" style={{ flex: 1, paddingLeft: '2rem' }}>
                      {menuItems.map(item => (
                        <div key={item.id} className="menu-preview-item" style={{ position: 'relative', cursor: 'pointer', padding: '1rem 0' }}>
                          <span className="flex items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.title}
                            {((item.children?.length > 0) || item.isMegaMenu) && <ChevronDown size={12} />}
                          </span>

                          {/* Hover Dropdown standard */}
                          {!item.isMegaMenu && item.children?.length > 0 && (
                            <div className="menu-preview-dropdown" style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              background: '#ffffff',
                              boxShadow: 'var(--shadow-lg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              minWidth: '180px',
                              zIndex: 10,
                              padding: '0.5rem 0',
                              display: 'none'
                            }}>
                              {item.children.map(child => (
                                <span key={child.id} style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)' }} className="hover-bg-app">
                                  {child.title}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Hover Mega Menu layout */}
                          {item.isMegaMenu && item.megaColumns?.length > 0 && (
                            <div className="menu-preview-megamenu" style={{
                              position: 'absolute',
                              top: '100%',
                              left: '-100px',
                              background: '#ffffff',
                              boxShadow: 'var(--shadow-xl)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              width: 'min(90vw, 420px)',
                              zIndex: 10,
                              padding: '1.25rem',
                              display: 'none'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.megaColumns.length}, 1fr)`, gap: '1rem' }}>
                                {item.megaColumns.map(col => (
                                  <div key={col.id}>
                                    <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                                      {col.title}
                                    </h5>
                                    <div className="flex flex-col gap-1">
                                      {col.links?.map(lnk => (
                                        <span key={lnk.id} style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>
                                          {lnk.title}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dropdown hover effects style injector */}
                  <style dangerouslySetInnerHTML={{__html: `
                    .menu-preview-item:hover .menu-preview-dropdown { display: block !important; }
                    .menu-preview-item:hover .menu-preview-megamenu { display: block !important; }
                    .hover-bg-app:hover { background-color: var(--bg-app); }
                  `}} />
                </div>
              </div>

              {/* Menu Item Tree Editor */}
              <div className="card card-primary">
                <div className="card-header admin-card-header-responsive" style={{ padding: '0.75rem 1.25rem' }}>
                  <h3 className="card-title">Menu Builder Structure - {selectedMenu.name}</h3>
                  <button type="button" onClick={handleAddTopLevelItem} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', minHeight: 'auto', background: 'rgba(255,255,255,0.15)', borderColor: 'transparent', color: '#ffffff' }}>
                    + Add Menu Link
                  </button>
                </div>

                <div className="card-body flex flex-col gap-3">
                  {menuItems.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                      No links added to this menu container. Click "+ Add Menu Link" to begin.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {menuItems.map(item => renderItemNode(item, 0))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a Menu Placement from the left sidebar to start designing.
            </div>
          )}

        </div>
      </div>

      {/* Menu Container Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editingMenu ? 'Edit Menu Placement' : 'Create Menu Placement'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Menu Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location / Placement</label>
                <select
                  className="form-select"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="header">Header (Top Navbar)</option>
                  <option value="footer">Footer</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="mobile">Mobile Drawer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
