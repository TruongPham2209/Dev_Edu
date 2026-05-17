"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { CartHeader } from "./_components/cart-header";
import { CartTabContent } from "./_components/cart-tab-content";
import { PurchaseHistoryTabContent } from "./_components/purchase-history-tab-content";
import { EnrollmentTabContent } from "./_components/enrollment-tab-content";
import { ShoppingCart, PackageOpen, BookOpen } from "lucide-react";
import { Suspense } from "react";

function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("type") || "cart";

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    router.push(`/cart?type=${newValue}`);
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, md: 5 } }}>
      <CartHeader />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 5, position: "sticky", top: 70, zIndex: 10, bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1.05rem",
              minHeight: 60,
              color: "#64748b",
              px: 4,
              "&.Mui-selected": { color: "#0ea5e9" },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#0ea5e9",
              height: 4,
              borderRadius: "4px 4px 0 0",
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ShoppingCart size={20} />
                Giỏ hàng
              </Box>
            }
            value="cart"
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PackageOpen size={20} />
                Lịch sử mua hàng
              </Box>
            }
            value="order"
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BookOpen size={20} />
                Đã đăng ký
              </Box>
            }
            value="enrolled"
          />
        </Tabs>
      </Box>

      <Box>
        {currentTab === "cart" && <CartTabContent />}
        {currentTab === "order" && <PurchaseHistoryTabContent />}
        {currentTab === "enrolled" && <EnrollmentTabContent />}
      </Box>
    </Box>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={<Box sx={{ py: 10, textAlign: "center" }}>Đang tải...</Box>}
    >
      <CartPageContent />
    </Suspense>
  );
}
