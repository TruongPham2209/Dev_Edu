"use client";

import { Box, Tab, Tabs, Typography } from "@mui/material";
// import { useAuth } from "@/lib/use-auth";
import { EmptyState } from "@/components/common/empty-state";
import { AuthUser } from "@/lib/auth-storage";
import { useState } from "react";
import { PostedPostsTab } from "./components/posted-posts-tab";
import { ProfileHeader } from "./components/profile-header";
import { SavedPostsTab } from "./components/saved-posts-tab";

const MOCK_USER: AuthUser = {
  id: "mock-user-123",
  username: "dev_user",
  fullName: "Học viên ưu tú",
  role: "STUDENT",
  email: "student@devedu.vn",
  avatarUrl: "https://i.pravatar.cc/150?u=dev_user",
};

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);
  const [activeTab, setActiveTab] = useState(0);

  if (!user) {
    return <EmptyState title="Hãy đăng nhập để xem hồ sơ" />;
  }

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", width: "100%", pb: 8 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mb: 3, display: { xs: "none", md: "block" } }}
      >
        Hồ sơ cá nhân
      </Typography>

      <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          position: "sticky",
          top: 64,
          bgcolor: "background.default",
          zIndex: 10,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minWidth: 120,
            },
          }}
        >
          <Tab label="Bài viết của tôi" />
          <Tab label="Bài viết đã lưu" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 0 && <PostedPostsTab />}
        {activeTab === 1 && <SavedPostsTab />}
      </Box>
    </Box>
  );
}
