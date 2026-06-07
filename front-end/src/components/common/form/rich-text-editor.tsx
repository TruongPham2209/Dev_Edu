"use client";

import { getPreSignedUploadUrl } from "@/lib/api/files";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
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
}: RichTextEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
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
    borderRadius: 1.5,
    p: 1,
    transition: "all 0.15s ease-in-out",
    bgcolor: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
    color: active ? "primary.main" : "text.secondary",
    border: "1px solid",
    borderColor: active ? "rgba(37, 99, 235, 0.2)" : "transparent",
    "&:hover": {
      bgcolor: active ? "rgba(37, 99, 235, 0.12)" : "action.hover",
      color: active ? "primary.dark" : "text.primary",
    },
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          p: 1,
          bgcolor: "grey.50",
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
              <Bold size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={getButtonSx(editor.isActive("italic"))}
            >
              <Italic size={18} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 20, bgcolor: "divider", mx: 0.5 }} />

          <Tooltip title="Heading 1" arrow placement="top">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              sx={getButtonSx(editor.isActive("heading", { level: 1 }))}
            >
              <Heading1 size={18} />
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
              <Heading2 size={18} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 20, bgcolor: "divider", mx: 0.5 }} />

          <Tooltip title="Bullet List" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={getButtonSx(editor.isActive("bulletList"))}
            >
              <List size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Numbered List" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              sx={getButtonSx(editor.isActive("orderedList"))}
            >
              <ListOrdered size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Quote" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              sx={getButtonSx(editor.isActive("blockquote"))}
            >
              <Quote size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Code Block" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              sx={getButtonSx(editor.isActive("codeBlock"))}
            >
              <Code size={18} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: "1px", height: 20, bgcolor: "divider", mx: 0.5 }} />

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
              <LinkIcon size={18} />
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
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ImageIcon size={18} />
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
          p: 3,
          "& .ProseMirror": {
            minHeight,
            outline: "none",
            fontSize: "1rem",
            lineHeight: 1.7,
            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: "text.primary",
            "& p": { margin: "0 0 1em 0" },
            "& h1, & h2, & h3": {
              marginTop: "1.6em",
              marginBottom: "0.8em",
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.01em",
            },
            "& h1": { fontSize: "1.8rem" },
            "& h2": { fontSize: "1.4rem" },
            "& ul": { paddingLeft: "1.8em", listStyleType: "disc", mb: "1em" },
            "& ol": {
              paddingLeft: "1.8em",
              listStyleType: "decimal",
              mb: "1em",
            },
            "& li": { mb: "0.4em" },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: "primary.main",
              pl: 3,
              py: 1,
              ml: 0,
              my: "1.5em",
              bgcolor: "rgba(37, 99, 235, 0.02)",
              color: "text.secondary",
              fontStyle: "italic",
              borderRadius: "0 8px 8px 0",
            },
            "& pre": {
              background: "#0f172a",
              color: "#f8fafc",
              p: 2,
              borderRadius: 2,
              overflowX: "auto",
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              fontSize: "0.9rem",
              border: "1px solid",
              borderColor: "grey.800",
              my: "1.5em",
            },
            "& code": {
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              background: "rgba(225, 29, 72, 0.06)",
              color: "#e11d48",
              px: 1,
              py: 0.3,
              borderRadius: 1,
              fontSize: "0.85em",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
              my: 3,
              boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
              border: "1px solid",
              borderColor: "divider",
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
    </Paper>
  );
};
