"use client";

import { ErrorState } from "@/components/common/error-state";
import {
  useCancelOrderMutation,
  useCreatePaymentMutation,
  useOrderDetailQuery,
} from "@/lib/api/enrollments";
import type { PaymentMethod } from "@/lib/type/enum";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Container,
  Fade,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Components
import { CheckoutHeader } from "./checkout-header";
import { CourseCard } from "./course-card";
import { OrderSummary } from "./order-summary";
import { PaymentMethodCard } from "./payment-method-card";

function CheckoutSkeletons() {
  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Skeleton
          variant="rounded"
          height={40}
          width={150}
          sx={{ mb: 2, borderRadius: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={60}
          width="60%"
          sx={{ mb: 4, borderRadius: 2 }}
        />
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Skeleton
              variant="rounded"
              height={40}
              width={200}
              sx={{ mb: 3, borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              height={220}
              sx={{ mb: 6, borderRadius: 4 }}
            />

            <Skeleton
              variant="rounded"
              height={40}
              width={200}
              sx={{ mb: 3, borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              height={100}
              sx={{ mb: 2, borderRadius: 4 }}
            />
            <Skeleton
              variant="rounded"
              height={100}
              sx={{ mb: 2, borderRadius: 4 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Skeleton
              variant="rounded"
              height={400}
              sx={{ borderRadius: 4, mt: { md: 8 } }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("orderId");
  const router = useRouter();

  const { handleError, showSuccess } = useApiWithToast();

  const {
    data,
    isLoading: loading,
    error,
  } = useOrderDetailQuery(id as string, {
    enabled: !!id,
  });

  const { mutate: cancelOrder, isPending: isCanceling } =
    useCancelOrderMutation();
  const { mutate: createPayment, isPending: isCreatingPayment } =
    useCreatePaymentMutation();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("VNPAY");

  if (!id) {
    return (
      <Box sx={{ mt: 10 }}>
        <ErrorState
          title="Failed to load checkout page"
          subtitle="The system could not find the transaction ID in the URL."
          actionLabel="Back to Cart"
          onRetry={() => router.push("/cart")}
        />
      </Box>
    );
  }

  if (loading) {
    return <CheckoutSkeletons />;
  }

  if (error || !data) {
    return (
      <Box sx={{ mt: 10 }}>
        <ErrorState
          title="Failed to load checkout page"
          subtitle="The system could not find the transaction ID in the URL or the order is invalid."
          actionLabel="Back to Cart"
          onRetry={() => router.push("/cart")}
        />
      </Box>
    );
  }

  const isProcessing = isCanceling || isCreatingPayment;

  const handleCancel = () => {
    cancelOrder(id, {
      onSuccess: () => {
        showSuccess("Transaction cancelled successfully");
        router.push("/cart");
      },
      onError: (err) => {
        handleError(err, "Failed to cancel transaction");
      },
    });
  };

  const handleBackToCart = () => {
    router.push("/cart");
  };

  const handleProceed = () => {
    createPayment(
      { orderId: id, paymentMethod: selectedMethod },
      {
        onSuccess: (res) => {
          if (res.paymentUrl) {
            showSuccess("Redirecting to payment gateway...");
            window.location.href = res.paymentUrl;
          } else {
            showSuccess(
              "Enrollment successfull, please check your cart to see details",
            );
            router.push(`/cart`);
          }
        },
        onError: (err) => {
          handleError(err, "Failed to initiate payment");
        },
      },
    );
  };

  const calculateSubtotal = () => {
    return (
      data.items?.reduce(
        (acc, item) => acc + (item.originalPrice || item.discountedPrice || 0),
        0,
      ) || 0
    );
  };

  const subtotal = calculateSubtotal();
  const finalAmount = data.totalAmount;
  const discount = subtotal - finalAmount;

  return (
    <Fade in={!loading} timeout={800}>
      <Box sx={{ pb: { xs: 24, md: 1 }, pt: { xs: 2, md: 0 } }}>
        <CheckoutHeader onBack={handleBackToCart} disabled={isProcessing} />

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Left Column: Items and Payment Methods */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Stack spacing={5}>
              {/* Items Section */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Order Details
                </Typography>
                <Stack spacing={3}>
                  {data.items?.map((item) => (
                    <CourseCard key={item.id} course={item} />
                  ))}
                </Stack>
              </Box>

              {/* Payment Methods Section */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Payment Method
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, fontWeight: 500 }}
                >
                  All transactions are secure and encrypted.
                </Typography>

                <Stack spacing={2}>
                  <PaymentMethodCard
                    method="VNPAY"
                    name="VNPAY"
                    description="Pay via ATM card, Internet Banking, or VNPAY-QR"
                    logoUrl="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                    selected={selectedMethod === "VNPAY"}
                    recommended
                    onSelect={setSelectedMethod}
                  />

                  {/* Disabled Methods */}
                  <PaymentMethodCard
                    method="MOMO"
                    name="MoMo"
                    description="Pay with MoMo E-Wallet"
                    logoUrl="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                    selected={selectedMethod === "MOMO"}
                    disabled
                    onSelect={setSelectedMethod}
                  />

                  <PaymentMethodCard
                    method="ZALOPAY"
                    name="ZaloPay"
                    description="Pay with ZaloPay E-Wallet"
                    logoUrl="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                    selected={selectedMethod === "ZALOPAY"}
                    disabled
                    onSelect={setSelectedMethod}
                  />

                  <PaymentMethodCard
                    method="PAYPAL"
                    name="PayPal"
                    description="Pay with PayPal Account"
                    logoUrl="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    selected={selectedMethod === "PAYPAL"}
                    disabled
                    onSelect={setSelectedMethod}
                  />

                  <PaymentMethodCard
                    method="STRIPE"
                    name="Credit / Debit Card"
                    description="Visa, Mastercard, AMEX"
                    logoUrl="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                    selected={selectedMethod === "STRIPE"}
                    disabled
                    onSelect={setSelectedMethod}
                  />
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column: Order Summary */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              total={finalAmount}
              onProceed={handleProceed}
              onCancel={handleCancel}
              isProcessing={isProcessing}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

export default function CheckoutPage() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 0, md: 2 } }}>
      <Suspense fallback={<CheckoutSkeletons />}>
        <CheckoutContent />
      </Suspense>
    </Container>
  );
}
