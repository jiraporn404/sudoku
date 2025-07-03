import * as React from "react";
import { Outlet, createRootRoute, useNavigate } from "@tanstack/react-router";
import { Box, Typography } from "@mui/material";
import { version } from "../../package.json";

function RootComponent() {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            cursor: "pointer",
            pt: 2,
          }}
          onClick={() => navigate({ to: "/", replace: true })}
        >
          S U D O K U
        </Typography>
        <Outlet />
        <Box
          sx={{
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
          <Typography fontSize={10} align="center" color="text.secondary">
            Copyright 2025 Sudoku. All rights reserved. | v{version} | Developed
            by jiraporn404
          </Typography>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
