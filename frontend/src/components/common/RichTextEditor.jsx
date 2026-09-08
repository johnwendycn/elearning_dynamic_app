import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3, Pilcrow, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Link as LinkIcon, Unlink, Palette, RotateCcw, RotateCw, RemoveFormatting, Code
} from 'lucide-react';

const COLORS = [
  '#000000', '#374151', '#6b7280', '#007bff', '#2563eb', '#3b82f6', 
  '#10b981', '#059669', '#f59e0b', '#d97706', '#ef4444', '#dc2626', 
  '#8b5cf6', '#6d28d9', '#ec4899', '#db2777'
];

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write your rich text content here...' }) => {
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRef = useRef(null);

  // Sync value from props when external change occurs
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    if (onChange) {
      onChange(html);
    }
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 10);
  };

  const exec = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    restoreSelection();
    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/') && !finalUrl.startsWith('#')) {
      finalUrl = 'https://' + finalUrl;
    }
    exec('createLink', finalUrl);
    setLinkUrl('');
    setLinkInputOpen(false);
  };

  return (
    <div className="rich-text-editor-container" style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
      {/* Toolbar */}
      <div 
        className="rich-text-toolbar" 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: '4px', 
          padding: '6px 8px', 
          background: 'var(--bg-app)', 
          borderBottom: '1px solid var(--border)',
          userSelect: 'none'
        }}
      >
        {/* Headings */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<h1>')} 
          className="btn-toolbar" 
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<h2>')} 
          className="btn-toolbar" 
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<h3>')} 
          className="btn-toolbar" 
          title="Heading 3"
        >
          <Heading3 size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<p>')} 
          className="btn-toolbar" 
          title="Paragraph"
        >
          <Pilcrow size={15} />
        </button>

        <span className="toolbar-divider" />

        {/* Text Formats */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')} 
          className="btn-toolbar" 
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('italic')} 
          className="btn-toolbar" 
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')} 
          className="btn-toolbar" 
          title="Underline"
        >
          <Underline size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('strikeThrough')} 
          className="btn-toolbar" 
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </button>

        <span className="toolbar-divider" />

        {/* Alignment */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('justifyLeft')} 
          className="btn-toolbar" 
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('justifyCenter')} 
          className="btn-toolbar" 
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('justifyRight')} 
          className="btn-toolbar" 
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('justifyFull')} 
          className="btn-toolbar" 
          title="Justify"
        >
          <AlignJustify size={15} />
        </button>

        <span className="toolbar-divider" />

        {/* Lists */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('insertUnorderedList')} 
          className="btn-toolbar" 
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('insertOrderedList')} 
          className="btn-toolbar" 
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<blockquote>')} 
          className="btn-toolbar" 
          title="Quote Block"
        >
          <Quote size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('formatBlock', '<pre>')} 
          className="btn-toolbar" 
          title="Code Block"
        >
          <Code size={15} />
        </button>

        <span className="toolbar-divider" />

        {/* Color picker toggle */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className="btn-toolbar" 
            title="Text Color"
          >
            <Palette size={15} />
          </button>
          {showColorPicker && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 100,
                marginTop: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px',
                boxShadow: 'var(--shadow-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px'
              }}
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exec('foreColor', c);
                    setShowColorPicker(false);
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: c,
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Link Button */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            onMouseDown={(e) => {
              saveSelection();
            }}
            onClick={() => {
              setLinkInputOpen(!linkInputOpen);
            }} 
            className="btn-toolbar" 
            title="Insert Link"
          >
            <LinkIcon size={15} />
          </button>
          {linkInputOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 100,
                marginTop: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                gap: '6px',
                width: '260px'
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', flex: 1 }}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
              <button 
                type="button" 
                onClick={handleInsertLink} 
                className="btn btn-primary btn-xs"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('unlink')} 
          className="btn-toolbar" 
          title="Remove Link"
        >
          <Unlink size={15} />
        </button>

        <span className="toolbar-divider" />

        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('removeFormat')} 
          className="btn-toolbar" 
          title="Clear Formatting"
        >
          <RemoveFormatting size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('undo')} 
          className="btn-toolbar" 
          title="Undo"
        >
          <RotateCcw size={15} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('redo')} 
          className="btn-toolbar" 
          title="Redo"
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* Editable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="rich-text-content"
        style={{
          minHeight: '140px',
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '12px 14px',
          outline: 'none',
          lineHeight: '1.7',
          color: 'var(--text-main)',
          fontSize: '0.95rem'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        .btn-toolbar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-toolbar:hover {
          background: var(--bg-surface);
          border-color: var(--border);
          color: var(--primary);
        }
        .toolbar-divider {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: var(--border);
          margin: 0 3px;
        }
        .rich-text-content:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          display: block;
        }
        .rich-text-content h1 { font-size: 1.6rem; font-weight: 800; margin: 0.5rem 0; color: var(--text-main); }
        .rich-text-content h2 { font-size: 1.35rem; font-weight: 700; margin: 0.4rem 0; color: var(--text-main); }
        .rich-text-content h3 { font-size: 1.15rem; font-weight: 700; margin: 0.3rem 0; color: var(--text-main); }
        .rich-text-content p { margin: 0.4rem 0; }
        .rich-text-content ul, .rich-text-content ol { padding-left: 1.4rem; margin: 0.4rem 0; }
        .rich-text-content blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          color: var(--text-muted);
          font-style: italic;
        }
        .rich-text-content pre {
          background: var(--bg-app);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-family: monospace;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .rich-text-content a {
          color: var(--primary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
