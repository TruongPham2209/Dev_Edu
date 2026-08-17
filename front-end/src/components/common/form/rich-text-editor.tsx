"use client";

import { getPreSignedUploadUrl } from "@/lib/api/files";
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (url: string, objectKey: string) => void;
  placeholder?: string;
  minHeight?: number;
  disableImage?: boolean;
  error?: boolean;
}

const extensions = [
  StarterKit,
  Image.configure({
    HTMLAttributes: {
      class: "editor-image",
    },
  }),
  Link.configure({
    openOnClick: false,
  }),
];

export const RichTextEditor = ({
  value,
  onChange,
  onImageUpload,
  minHeight = 200,
  disableImage = false,
  error = false,
}: RichTextEditorProps) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        setUploading(true);
        const res = await getPreSignedUploadUrl({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          isPublic: true,
        });

        if (res.uploadUrl) {
          await fetch(res.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          const imgUrl = res.downloadUrl || res.publicUrl;
          if (imgUrl) {
            editor.chain().focus().setImage({ src: imgUrl }).run();
            if (onImageUpload && res.objectKey) {
              onImageUpload(imgUrl, res.objectKey);
            }
          }
        }
      } catch (err) {
        console.error("Failed to upload image:", err);
      } finally {
        setUploading(false);
      }
    },
    [editor, onImageUpload],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  if (!editor) {
    return null;
  }

  // Generate uniform styling for premium active and inactive states
  const getButtonSx = (active: boolean) => ({
    borderRadius: "8px",
    p: { xs: 0.6, sm: 0.8 },
    transition: "all 0.15s ease-in-out",
    bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    border: "1px solid",
    borderColor: active
      ? alpha(theme.palette.primary.main, 0.25)
      : "transparent",
    "&:hover": {
      bgcolor: active
        ? alpha(theme.palette.primary.main, 0.18)
        : alpha(theme.palette.text.primary, 0.06),
      color: active ? theme.palette.primary.dark : theme.palette.text.primary,
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: "12px",
        bgcolor: "#ffffff",
        border: `1.5px solid ${
          error ? "#ef4444" : focused ? "#6366f1" : "#e2e8f0"
        }`,
        boxShadow: focused
          ? "0 0 0 4px rgba(99,102,241,0.12)"
          : "0 1px 3px rgba(0,0,0,0.02)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: error ? "#ef4444" : focused ? "#6366f1" : "#cbd5e1",
        },
      }}
    >
      <Box
        sx={{
          borderBottom: "1px solid #e2e8f0",
          p: { xs: 0.75, sm: 1 },
          bgcolor: "#f8fafc",
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}
        >
          <Tooltip title="Bold" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              sx={getButtonSx(editor.isActive("bold"))}
            >
              <Bold size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={getButtonSx(editor.isActive("italic"))}
            >
              <Italic size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 16, bgcolor: "#cbd5e1", mx: 0.5 }} />

          <Tooltip title="Heading 1" arrow placement="top">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              sx={getButtonSx(editor.isActive("heading", { level: 1 }))}
            >
              <Heading1 size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Heading 2" arrow placement="top">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              sx={getButtonSx(editor.isActive("heading", { level: 2 }))}
            >
              <Heading2 size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 16, bgcolor: "#cbd5e1", mx: 0.5 }} />

          <Tooltip title="Bullet List" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={getButtonSx(editor.isActive("bulletList"))}
            >
              <List size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Numbered List" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              sx={getButtonSx(editor.isActive("orderedList"))}
            >
              <ListOrdered size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Quote" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              sx={getButtonSx(editor.isActive("blockquote"))}
            >
              <Quote size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Code Block" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              sx={getButtonSx(editor.isActive("codeBlock"))}
            >
              <Code size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 16, bgcolor: "#cbd5e1", mx: 0.5 }} />

          <Tooltip title="Insert Link" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => {
                const url = window.prompt("URL:");
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              sx={getButtonSx(editor.isActive("link"))}
            >
              <LinkIcon size={16} />
            </IconButton>
          </Tooltip>

          {!disableImage && (
            <Tooltip title="Upload Image" arrow placement="top">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={getButtonSx(false)}
              >
                {uploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ImageIcon size={16} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      {!disableImage && (
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />
      )}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: "#ffffff",
          "& .ProseMirror": {
            minHeight: { xs: Math.min(120, minHeight), sm: minHeight },
            outline: "none",
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            lineHeight: 1.7,
            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: "#0f172a",
            "& p": { margin: "0 0 0.75em 0" },
            "& h1, & h2, & h3": {
              marginTop: "1.2em",
              marginBottom: "0.6em",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            },
            "& h1": { fontSize: "1.6rem" },
            "& h2": { fontSize: "1.3rem" },
            "& ul": {
              paddingLeft: "1.5em",
              listStyleType: "disc",
              mb: "0.75em",
            },
            "& ol": {
              paddingLeft: "1.5em",
              listStyleType: "decimal",
              mb: "0.75em",
            },
            "& li": { mb: "0.3em" },
            "& blockquote": {
              borderLeft: "4px solid #6366f1",
              pl: 2.5,
              py: 0.75,
              ml: 0,
              my: "1em",
              bgcolor: "rgba(99, 102, 241, 0.04)",
              color: "#475569",
              fontStyle: "italic",
              borderRadius: "0 6px 6px 0",
            },
            "& pre": {
              background: "#0f172a",
              color: "#f8fafc",
              p: 2,
              borderRadius: 1.5,
              overflowX: "auto",
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              fontSize: "0.85rem",
              border: "1px solid #1e293b",
              my: "1em",
            },
            "& code": {
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              background: "rgba(225, 29, 72, 0.06)",
              color: "#e11d48",
              px: 0.75,
              py: 0.2,
              borderRadius: 1,
              fontSize: "0.85em",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1.5,
              my: 2,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.005)",
              },
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
