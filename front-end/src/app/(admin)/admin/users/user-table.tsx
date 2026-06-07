"use client";

import { ColumnDef, DataTable } from "@/components/common/data-table";
import { ImagePreview } from "@/components/common/image-preview";
import { UserResponse } from "@/lib/type/users";
import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { BookOpen, FileText, Shield, User, UserCheck } from "lucide-react";
import { useState } from "react";

interface UserTableProps {
  users: UserResponse[];
  loading?: boolean;
  errorState?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function UserTable({
  users,
  loading = false,
  errorState,
  emptyState,
}: UserTableProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getRoleChip = (role: string) => {
    let icon = <User size={14} />;
    let label = "Student";
    let color = "#3b82f6";
    let bg = "rgba(59, 130, 246, 0.08)";
    let border = "1px solid rgba(59, 130, 246, 0.16)";

    if (role === "LECTURER") {
      icon = <UserCheck size={14} />;
      label = "Lecturer";
      color = "#f59e0b";
      bg = "rgba(245, 158, 11, 0.08)";
      border = "1px solid rgba(245, 158, 11, 0.16)";
    } else if (role === "ADMIN") {
      icon = <Shield size={14} />;
      label = "Administrator";
      color = "#ef4444";
      bg = "rgba(239, 68, 68, 0.08)";
      border = "1px solid rgba(239, 68, 68, 0.16)";
    }

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          fontSize: "0.75rem",
          fontWeight: 700,
          color,
          bgcolor: bg,
          border,
        }}
      >
        {icon}
        <span>{label}</span>
      </Box>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (
      parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)
    ).toUpperCase();
  };

  const columns: ColumnDef<UserResponse>[] = [
    {
      header: "Full name",
      width: 320,
      renderSkeleton: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={120} height={20} />
        </Box>
      ),
      render: (user) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user.avatarUrl}
            onClick={() => {
              if (user.avatarUrl) {
                setPreviewImage(user.avatarUrl);
              }
            }}
            sx={{
              width: 40,
              height: 40,
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: user.avatarUrl ? "pointer" : "default",
              bgcolor:
                user.role === "ADMIN"
                  ? "error.light"
                  : user.role === "LECTURER"
                    ? "warning.light"
                    : "primary.light",
              color:
                user.role === "ADMIN"
                  ? "error.main"
                  : user.role === "LECTURER"
                    ? "warning.main"
                    : "primary.main",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {getInitials(user.fullName)}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {user.fullName}
          </Typography>
        </Box>
      ),
    },
    {
      header: "Username",
      width: 180,
      skeletonVariant: "text",
      render: (user) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {user.username}
        </Typography>
      ),
    },
    {
      header: "Email",
      width: 250,
      skeletonVariant: "text",
      render: (user) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {user.email}
        </Typography>
      ),
    },
    {
      header: "Role",
      width: 140,
      skeletonVariant: "rounded",
      render: (user) => getRoleChip(user.role),
    },
    {
      header: "Activity",
      width: 260,
      renderSkeleton: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>
      ),
      render: (user) =>
        user.role === "STUDENT" ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.secondary",
            }}
          >
            <BookOpen size={16} style={{ color: "#3b82f6" }} />
            <Typography variant="body2" sx={{ fontWeight: 550 }}>
              Has joined {user.courseCount || 0} courses
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.secondary",
            }}
          >
            <FileText size={16} style={{ color: "#f59e0b" }} />
            <Typography variant="body2" sx={{ fontWeight: 550 }}>
              Has posted {user.postedPosts || 0} posts
            </Typography>
          </Box>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        mode="infinite"
        skeletonRowCount={5}
        keyExtractor={(user) => user.id}
        errorState={errorState}
        emptyState={emptyState}
      />
      <ImagePreview
        open={!!previewImage}
        src={previewImage}
        onClose={() => setPreviewImage(null)}
        alt="User Avatar Preview"
      />
    </>
  );
}
