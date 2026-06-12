"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { Box, Typography } from "@mui/material";
import { BookOpen, PackageOpen, ShoppingCart } from "lucide-react";
import { Suspense, useState } from "react";
import { CartTabContent } from "./cart-tab";
import { EnrollmentTabContent } from "./enrollment-tab";
import { PurchaseHistoryTabContent } from "./purchase-history-tab";

function CartPageContent() {
  const [currentTab, setCurrentTab] = useState("cart");

  const handleTabChange = (newValue: string) => {
    setCurrentTab(newValue);
  };

  const CART_TABS = [
    { value: "cart", label: "Cart", icon: <ShoppingCart size={20} /> },
    { value: "order", label: "Order History", icon: <PackageOpen size={20} /> },
    { value: "enrolled", label: "Enrolled", icon: <BookOpen size={20} /> },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, lg: 4 },
        py: { xs: 3, md: 5 },
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{ p: 1.5, bgcolor: "#e0f2fe", borderRadius: 2, display: "flex" }}
        >
          <ShoppingCart size={28} color="#0284c7" />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Your learning space
        </Typography>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 5,
          position: "sticky",
          top: 70,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <AnimatedTabs
          tabs={CART_TABS}
          value={currentTab}
          onChange={handleTabChange}
          colorTheme="primary"
        />
      </Box>

      <Box sx={{ display: currentTab === "cart" ? "block" : "none" }}>
        <CartTabContent />
      </Box>
      <Box sx={{ display: currentTab === "order" ? "block" : "none" }}>
        <PurchaseHistoryTabContent />
      </Box>
      <Box sx={{ display: currentTab === "enrolled" ? "block" : "none" }}>
        <EnrollmentTabContent />
      </Box>
    </Box>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={<Box sx={{ py: 10, textAlign: "center" }}>Loading...</Box>}
    >
      <CartPageContent />
    </Suspense>
  );
}
