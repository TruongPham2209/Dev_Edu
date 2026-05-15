import { Backdrop, CircularProgress } from "@mui/material";

export function LoadingOverlay({ open }: { open: boolean }) {
  return (
    <Backdrop open={open} sx={{ color: "#fff", zIndex: 1300 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
