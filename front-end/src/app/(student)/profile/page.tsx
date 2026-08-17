"use client";

import { Box } from "@mui/material";
// import { useAuth } from "@/lib/use-auth";
import { AnimatedTabs } from "@/components/common/animated-tabs";
import { EmptyState } from "@/components/common/empty-state";
import { useMeQuery } from "@/lib/api/users";
import { AuthUser, updateStoredUser } from "@/lib/auth-storage";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { CircularProgress } from "@mui/material";
import { Bookmark, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { PostedPostsTab } from "./posts-tab";
import { ProfileHeader } from "./profile-header";
import { SavedPostsTab } from "./saved-tab";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<"posted" | "saved">("posted");
  const { handleError } = useApiWithToast();

  const { data: userData, isLoading, error } = useMeQuery();

  useEffect(() => {
    if (userData) {
      setUser(userData as unknown as AuthUser);
    }
  }, [userData]);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to fetch profile information.");
    }
  }, [error, handleError]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <EmptyState title="Please login to view your profile." />;
  }

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
    updateStoredUser({ avatarUrl: newAvatarUrl });
  };

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: { xs: 6, sm: 8 },
      }}
    >
      <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: { xs: 2.5, sm: 3 },
          position: "sticky",
          top: { xs: 56, sm: 64, md: 70 },
          bgcolor: "background.default",
          zIndex: 10,
          overflowX: "auto",
        }}
      >
        <AnimatedTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              value: "posted",
              label: "Posted posts",
              icon: <FileText size={18} />,
            },
            {
              value: "saved",
              label: "Saved posts",
              icon: <Bookmark size={18} />,
            },
          ]}
        />
      </Box>

      <Box>
        <Box sx={{ display: activeTab === "posted" ? "block" : "none" }}>
          <PostedPostsTab />
        </Box>
        <Box sx={{ display: activeTab === "saved" ? "block" : "none" }}>
          <SavedPostsTab />
        </Box>
      </Box>
    </Box>
  );
}
