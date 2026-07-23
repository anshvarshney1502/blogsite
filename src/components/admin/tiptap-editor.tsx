"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Code2,
  Link as LinkIcon, Image as ImageIcon, List, ListOrdered,
  Quote, Table as TableIcon, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Undo, Redo,
  Minus
} from "lucide-react";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onSave?: () => void;
}

// Slash command detection hook
function useSlashCommand(editor: ReturnType<typeof useEditor>) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0 });
  const [query, setQuery] = React.useState("");

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const { selection } = editor.state;
      const node = selection.$from.nodeBefore;
      const text = node?.textContent || "";

      if (text === "/") {
        setShowMenu(true);
        setQuery("");
        const coords = editor.view.coordsAtPos(selection.from);
        setMenuPos({ top: coords.bottom + 8, left: coords.left });
      } else if (text.startsWith("/")) {
        setQuery(text.slice(1).toLowerCase());
        setShowMenu(true);
        const coords = editor.view.coordsAtPos(selection.from);
        setMenuPos({ top: coords.bottom + 8, left: coords.left });
      } else {
        setShowMenu(false);
      }
    };

    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor]);

  return { showMenu, setShowMenu, menuPos, query };
}

const SLASH_COMMANDS = [
  { label: "Heading 1", shortcut: "h1", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "Heading 2", shortcut: "h2", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "Heading 3", shortcut: "h3", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "Bullet List", shortcut: "ul", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBulletList().run() },
  { label: "Numbered List", shortcut: "ol", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleOrderedList().run() },
  { label: "Blockquote", shortcut: "quote", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBlockquote().run() },
  { label: "Code Block", shortcut: "code", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleCodeBlock().run() },
  { label: "Divider", shortcut: "hr", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().setHorizontalRule().run() },
  { label: "Table (3×3)", shortcut: "table", action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { label: "Insert Image URL", shortcut: "img", action: (e: ReturnType<typeof useEditor>) => {
    const url = window.prompt("Image URL:");
    if (url) e?.chain().focus().setImage({ src: url }).run();
  }},
];

export default function TipTapEditor({ content, onChange, onSave }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Start writing… or type / for commands" }),
      CharacterCount,
      Highlight.configure({ multicolor: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[500px] py-4 px-2",
      },
    },
  });

  // Keyboard shortcut: ⌘S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave]);

  // Sync external content changes (e.g. on initial load)
  const prevContent = useRef(content);
  useEffect(() => {
    if (editor && content !== prevContent.current && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      prevContent.current = content;
    }
  }, [editor, content]);

  const { showMenu: showSlash, setShowMenu: setShowSlash, menuPos: slashPos, query: slashQuery } = useSlashCommand(editor);

  const filteredCommands = SLASH_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(slashQuery) || c.shortcut.includes(slashQuery)
  );

  const insertLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("Image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const charCount = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted-light/20 overflow-x-auto">
        {/* Undo/Redo */}
        <ToolbarGroup>
          <ToolBtn title="Undo (⌘Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Redo (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Headings */}
        <ToolbarGroup>
          <ToolBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Inline Formatting */}
        <ToolbarGroup>
          <ToolBtn title="Bold (⌘B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Italic (⌘I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Underline (⌘U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
            <Highlighter className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Lists & Structure */}
        <ToolbarGroup>
          <ToolBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <Code2 className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Alignment */}
        <ToolbarGroup>
          <ToolBtn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Media & Links */}
        <ToolbarGroup>
          <ToolBtn title="Insert Link" active={editor.isActive("link")} onClick={insertLink}>
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Insert Image" onClick={insertImage}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon className="h-3.5 w-3.5" />
          </ToolBtn>
        </ToolbarGroup>

        {/* Word/Char count */}
        <div className="ml-auto font-mono text-[9px] text-muted flex items-center gap-3 pr-1 shrink-0">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Slash Command Menu */}
      {showSlash && filteredCommands.length > 0 && (
        <div
          className="fixed z-50 w-56 bg-background border border-border rounded-xl shadow-xl overflow-hidden font-mono text-xs"
          style={{ top: slashPos.top, left: slashPos.left }}
        >
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.shortcut}
              onMouseDown={(e) => {
                e.preventDefault();
                // Delete the slash text first
                editor.chain().focus().deleteRange({
                  from: editor.state.selection.from - (slashQuery.length + 1),
                  to: editor.state.selection.from,
                }).run();
                cmd.action(editor);
                setShowSlash(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-muted-light/40 flex items-center justify-between group cursor-pointer"
            >
              <span className="text-foreground">{cmd.label}</span>
              <span className="text-muted text-[9px]">/{cmd.shortcut}</span>
            </button>
          ))}
        </div>
      )}

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-4 tiptap-editor-canvas">
        <EditorContent editor={editor} />
      </div>

      {/* Hint Bar */}
      <div className="px-4 py-2 border-t border-border/40 bg-muted-light/10 flex items-center justify-between font-mono text-[9px] text-muted">
        <span>Type <kbd className="px-1 py-0.5 border border-border rounded text-[8px]">/</kbd> for commands</span>
        <span>⌘S to save</span>
      </div>
    </div>
  );
}

// Sub-components
function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="w-px h-4 bg-border/60 mx-1" />;
}

function ToolBtn({
  children, onClick, title, active, disabled, dark,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        dark
          ? active
            ? "bg-background/20 text-background"
            : "text-background/70 hover:bg-background/20 hover:text-background"
          : active
            ? "bg-accent/15 text-accent"
            : "text-muted hover:bg-muted-light/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
