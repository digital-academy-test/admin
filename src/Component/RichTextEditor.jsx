// src/components/RichTextEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo
} from 'react-icons/fa'
import './RichTextEditor.css'

const RichTextEditor = ({ value, onChange, placeholder = "Start typing...", height = "200px" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // ... rest of your code remains the same
  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Text Formatting */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            type="button"
            title="Bold (Ctrl+B)"
          >
            <FaBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            type="button"
            title="Italic (Ctrl+I)"
          >
            <FaItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            type="button"
            title="Underline (Ctrl+U)"
          >
            <FaUnderline />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            type="button"
            title="Strikethrough"
          >
            <FaStrikethrough />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Headings */}
        <div className="toolbar-group">
          <select
            onChange={(e) => {
              const level = e.target.value;
              if (level === 'p') {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
              }
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' :
              'p'
            }
            className="heading-select"
          >
            <option value="p">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </div>

        <div className="toolbar-divider" />

        {/* Lists */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type="button"
            title="Bullet List"
          >
            <FaListUl />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            type="button"
            title="Numbered List"
          >
            <FaListOl />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Alignment */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            type="button"
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            type="button"
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            type="button"
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
            type="button"
            title="Justify"
          >
            <FaAlignJustify />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Superscript & Subscript */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'is-active' : ''}
            type="button"
            title="Superscript (x²)"
          >
            x²
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'is-active' : ''}
            type="button"
            title="Subscript (H₂O)"
          >
            x₂
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Link & Image */}
        <div className="toolbar-group">
          <button
            onClick={addLink}
            className={editor.isActive('link') ? 'is-active' : ''}
            type="button"
            title="Insert Link"
          >
            <FaLink />
          </button>
          <button
            onClick={addImage}
            type="button"
            title="Insert Image"
          >
            <FaImage />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Undo & Redo */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            type="button"
            title="Undo (Ctrl+Z)"
          >
            <FaUndo />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            type="button"
            title="Redo (Ctrl+Y)"
          >
            <FaRedo />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        style={{ minHeight: height }} 
        placeholder={placeholder}
      />
    </div>
  )
}

export default RichTextEditor