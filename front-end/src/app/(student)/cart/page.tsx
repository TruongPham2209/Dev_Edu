"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { Box, Typography, alpha } from "@mui/material";
import { PackageOpen, ShoppingCart } from "lucide-react";
import { Suspense, useState } from "react";
import { CartTabContent } from "./cart-tab";
import { PurchaseHistoryTabContent } from "./purchase-history-tab";

function CartPageContent() {
  const [currentTab, setCurrentTab] = useState("cart");

  const handleTabChange = (newValue: string) => {
    setCurrentTab(newValue);
  };

  const CART_TABS = [
    { value: "cart", label: "Cart", icon: <ShoppingCart size={20} /> },
    { value: "order", label: "Order History", icon: <PackageOpen size={20} /> },
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, sm: 4 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.18 : 0.08,
              ),
            color: "primary.main",
            borderRadius: 2,
            display: "flex",
            flexShrink: 0,
          }}
        >
          <ShoppingCart size={24} color="currentColor" />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.125rem" },
          }}
        >
          Purchases & Cart
        </Typography>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: { xs: 3, sm: 4, md: 5 },
          position: "sticky",
          top: { xs: 56, sm: 64, md: 70 },
          zIndex: 10,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.9),
          backdropFilter: "blur(8px)",
          overflowX: "auto",
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
