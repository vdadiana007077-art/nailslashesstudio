"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Code, Quote, Minus, Undo, Redo,
  Maximize2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'İçerik yazın...' }: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-gray-800',
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Bağlantı URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Görsel URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolButton = ({ onClick, isActive, children, title }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
        isActive 
          ? 'bg-gray-800 text-white shadow-sm' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden bg-white ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Text Formatting */}
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Kalın">
          <Bold size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="İtalik">
          <Italic size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Altı Çizili">
          <UnderlineIcon size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Üstü Çizili">
          <Strikethrough size={15} />
        </ToolButton>

        <Divider />

        {/* Headings */}
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1">
          <Heading1 size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
          <Heading2 size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3">
          <Heading3 size={15} />
        </ToolButton>

        <Divider />

        {/* Alignment */}
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Sola Hizala">
          <AlignLeft size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Ortala">
          <AlignCenter size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Sağa Hizala">
          <AlignRight size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="İki Yana Yasla">
          <AlignJustify size={15} />
        </ToolButton>

        <Divider />

        {/* Lists */}
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Madde İşareti">
          <List size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numaralı Liste">
          <ListOrdered size={15} />
        </ToolButton>

        <Divider />

        {/* Links & Media */}
        <ToolButton onClick={addLink} isActive={editor.isActive('link')} title="Bağlantı Ekle">
          <LinkIcon size={15} />
        </ToolButton>
        <ToolButton onClick={addImage} title="Görsel Ekle">
          <ImageIcon size={15} />
        </ToolButton>

        <Divider />

        {/* Extras */}
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Alıntı">
          <Quote size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Kod Bloğu">
          <Code size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Yatay Çizgi">
          <Minus size={15} />
        </ToolButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Geri Al">
          <Undo size={15} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Yinele">
          <Redo size={15} />
        </ToolButton>

        {/* Fullscreen */}
        <div className="ml-auto">
          <ToolButton onClick={() => setIsFullscreen(!isFullscreen)} title="Tam Ekran">
            <Maximize2 size={15} />
          </ToolButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 -z-10" onClick={() => setIsFullscreen(false)} />
      )}
    </div>
  );
}
