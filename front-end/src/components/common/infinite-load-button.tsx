import { Box, Button, CircularProgress } from "@mui/material";

export function InfiniteLoadButton({
  loading,
  hasMore,
  onLoadMore,
}: {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  if (!hasMore) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
      <Button
        onClick={onLoadMore}
        variant="outlined"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} /> : undefined}
      >
        {loading ? "Loading" : "Load more"}
      </Button>
    </Box>
  );
}
