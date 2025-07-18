import { Backdrop, CircularProgress } from "@mui/material";

export function LoadingOverlay({ open }: { open: boolean }) {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
