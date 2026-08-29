import { FileCode, FileImage, FileText, Video } from "lucide-react";
import React from "react";

export function getFileIcon(
  fileName?: string,
  iconSize: number = 22,
): React.ReactNode {
  if (!fileName) return <FileText size={22} />;
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText size={iconSize} style={{ color: "#ef4444" }} />;
    case "xls":
    case "xlsx":
      return <FileText size={iconSize} style={{ color: "#10b981" }} />;
    case "ppt":
    case "pptx":
      return <FileText size={iconSize} style={{ color: "#f59e0b" }} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FileCode size={iconSize} style={{ color: "#d97706" }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return <FileImage size={iconSize} style={{ color: "#16a34a" }} />;
    case "mp4":
    case "webm":
    case "mkv":
      return <Video size={iconSize} style={{ color: "#ec4899" }} />;
    case "doc":
    case "docx":
    case "odt":
      return <FileText size={iconSize} style={{ color: "#2563eb" }} />;
    default:
      return <FileText size={iconSize} style={{ color: "#64748b" }} />;
  }
}

export function getFileNameFromKey(key: string): string {
  if (!key) return "Attached File";
  return key.split("/").pop() || key;
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "0 B";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const PDFS = ["application/pdf"];

const WORDS = [
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-word.document.macroEnabled.12", // .docm
];

const EXCELS = [
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
];

const POWERPOINTS = [
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12", // .pptm
];

const IMAGES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "image/x-icon", // .ico
];

const VIDEOS = [
  "video/mp4",
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
  "video/webm",
  "video/quicktime", // .mov
  "video/x-ms-wmv", // .wmv
  "video/mpeg",
];


const ARCHIVES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "application/gzip",
  "application/x-tar",
];

const TEXTS = [
  "text/plain",
  "text/csv",
  "text/html",
  "application/json",
  "application/xml",
  "text/xml",
];

export function isValidFileType(
  contentType: string,
  type: "image" | "video" | "document",
): boolean {
  switch (type) {
    case "document":
      return (
        PDFS.includes(contentType) ||
        WORDS.includes(contentType) ||
        EXCELS.includes(contentType) ||
        POWERPOINTS.includes(contentType) ||
        TEXTS.includes(contentType) ||
        ARCHIVES.includes(contentType)
      );
    case "image":
      return IMAGES.includes(contentType);
    case "video":
      return VIDEOS.includes(contentType);
    default:
      return false;
  }
}

export function getFileAcceptString(
  type: "image" | "video" | "document",
): string {
  switch (type) {
    case "document":
      return [...PDFS, ...WORDS, ...EXCELS, ...POWERPOINTS, ...TEXTS, ...ARCHIVES].join(",");
    case "image":
      return IMAGES.join(",");
    case "video":
      return VIDEOS.join(",");
    default:
      return "*";
  }
}
