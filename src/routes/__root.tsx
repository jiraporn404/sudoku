import * as React from "react";
import { Outlet, createRootRoute, useNavigate } from "@tanstack/react-router";
import { Box, Typography } from "@mui/material";
import { version } from "../../package.json";
import { randomColor } from "../utils/random";

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
            textAlign: "center",
            cursor: "pointer",
            pt: 2,
            fontFamily: "Luckiest Guy",
            letterSpacing: 10,
          }}
          onClick={() => navigate({ to: "/", replace: true })}
        >
          <span style={{ color: randomColor() }}>S</span>
          <span style={{ color: randomColor() }}>U</span>
          <span style={{ color: randomColor() }}>D</span>
          <span style={{ color: randomColor() }}>O</span>
          <span style={{ color: randomColor() }}>K</span>
          <span style={{ color: randomColor() }}>U</span>
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
