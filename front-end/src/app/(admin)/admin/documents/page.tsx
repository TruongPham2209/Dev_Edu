"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SearchInput } from "@/components/common/form/search-input";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { UploadGlobalDocumentDialog } from "@/components/dialog/global-document-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useDeleteGlobalDocumentMutation,
  useGlobalDocumentsQuery,
  useUploadGlobalDocumentMutation,
} from "@/lib/api/documents";
import { useToast } from "@/lib/toast-context";
import type { GlobalDocumentResponse } from "@/lib/type/documents";
import { formatServerDate } from "@/lib/util/date-utils";
import { formatBytes } from "@/lib/util/file-utils";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircle2,
  Clock,
  FileText,
  FolderPlus,
  Library,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function AdminDocumentsPage() {
  const toast = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);

  // Delete confirm state
  const [deletingDoc, setDeletingDoc] = useState<GlobalDocumentResponse | null>(
    null,
  );

  // Queries & Mutations
  const {
    data: documentsData,
    isLoading,
    isError,
    refetch,
  } = useGlobalDocumentsQuery(debouncedSearch);

  const uploadMutation = useUploadGlobalDocumentMutation({
    onSuccess: () => {
      toast.success("Uploaded global document successfully!");
      setUploadOpen(false);
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.message}`);
    },
  });

  const deleteMutation = useDeleteGlobalDocumentMutation({
    onSuccess: () => {
      toast.success("Deleted global document successfully!");
      setDeletingDoc(null);
    },
    onError: (err) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  const documents: GlobalDocumentResponse[] = useMemo(() => {
    if (!documentsData) return [];
    if (Array.isArray(documentsData.contents)) return documentsData.contents;
    return [];
  }, [documentsData]);

  const handleUploadSubmit = async (data: { file: File; title?: string }) => {
    await uploadMutation.mutateAsync(data);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    await deleteMutation.mutateAsync(deletingDoc.id);
  };

  // Status Chip Helper
  const renderStatusChip = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <Chip
            label="Ready"
            size="small"
            color="success"
            variant="outlined"
            icon={<CheckCircle2 size={13} />}
            sx={{ fontWeight: 700, fontSize: "0.725rem" }}
          />
        );
      case "PROCESSING":
        return (
          <Chip
            label="Processing"
            size="small"
            color="warning"
            variant="outlined"
            icon={<Clock size={13} />}
            sx={{ fontWeight: 700, fontSize: "0.725rem" }}
          />
        );
      case "FAILED":
        return (
          <Chip
            label="Failed"
            size="small"
            color="error"
            variant="outlined"
            icon={<XCircle size={13} />}
            sx={{ fontWeight: 700, fontSize: "0.725rem" }}
          />
        );
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  // Table Columns
  const columns: ColumnDef<GlobalDocumentResponse>[] = useMemo(
    () => [
      {
        header: "Document Title",
        render: (doc) => (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {doc.title || doc.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {doc.fileName}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        header: "File Size",
        width: 120,
        render: (doc) => (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {formatBytes(doc.fileSize)}
          </Typography>
        ),
      },
      {
        header: "Status",
        width: 130,
        render: (doc) => renderStatusChip(doc.status),
      },
      {
        header: "Visibility",
        width: 120,
        render: (doc) => (
          <Chip
            label={doc.visibility}
            size="small"
            variant="filled"
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor: "action.hover",
            }}
          />
        ),
      },
      {
        header: "Uploaded By",
        width: 150,
        render: (doc) => (
          <Typography variant="body2" color="text.secondary">
            {doc.createdBy || "System"}
          </Typography>
        ),
      },
      {
        header: "Created At",
        width: 160,
        render: (doc) => (
          <Typography variant="caption" color="text.secondary">
            {formatServerDate(doc.createdAt, "datetime")}
          </Typography>
        ),
      },
      {
        header: "Actions",
        width: 100,
        align: "right",
        render: (doc) => (
          <Tooltip title="Delete Document from Global Library">
            <span>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={13} />}
                onClick={() => setDeletingDoc(doc)}
                sx={{
                  borderRadius: 1.5,
                  fontSize: "0.75rem",
                  px: 1.25,
                  py: 0.3,
                }}
              >
                Delete
              </Button>
            </span>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3} sx={{ width: "100%", overflowX: "hidden" }}>
      {/* Hero / Header Section */}
      <HeroInfo
        title="Global Document Library"
        description="Manage shared textbooks, course syllabi, and reference PDF materials available for automated AI Quiz Generation across courses."
        icon={<Library size={24} className="text-blue-400" />}
        tags={[
          "Upload Global PDF",
          "Shared Knowledge Base",
          "AI Quiz Generation",
        ]}
      />

      {/* Search & Actions Toolbar in the Same Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left Side: Search Input */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 280, md: 360 },
            maxWidth: { xs: "100%", md: 500 },
          }}
        >
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search global documents by file name..."
          />
        </Box>

        {/* Right Side: Total Documents, Refresh, & Upload Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-end", sm: "center" },
            gap: 1.5,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <ButtonAction
            tooltip="Refresh Data"
            onClick={() => refetch()}
            variant="soft"
            color="info"
            icon={<RefreshCw size={20} strokeWidth={2.2} />}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setUploadOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 2.5,
              py: 1,
              height: 48,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            Upload Global PDF
          </Button>
        </Box>
      </Box>

      {/* Data Table / Empty / Error */}
      {isError ? (
        <ErrorState
          title="Failed to load document library"
          subtitle="An error occurred while retrieving global documents from the server."
          onRetry={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={documents}
          loading={isLoading}
          keyExtractor={(item) => item.id}
          emptyState={
            <EmptyState
              title="No Global Documents Found"
              subtitle="Upload PDF documents to the library so instructors can generate quizzes from shared resources."
              icon={<FolderPlus size={22} />}
            />
          }
        />
      )}

      {/* Upload Global Document Dialog Component */}
      <UploadGlobalDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUploadSubmit}
        loading={uploadMutation.isPending}
      />

      {/* Delete Document Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingDoc}
        title={`Delete Document "${deletingDoc?.title || deletingDoc?.fileName}"`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeletingDoc(null)}
        onConfirm={handleConfirmDelete}
        description={
          deletingDoc && (
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete{" "}
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                &quot;{deletingDoc.title || deletingDoc.fileName}&quot;
              </Box>{" "}
              from the Global Library? This action cannot be undone.
            </Typography>
          )
        }
      />
    </Stack>
  );
}