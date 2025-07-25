import { Box, useMediaQuery, useTheme, type SxProps } from "@mui/material";
import React from "react";

type SudokuCellProps = {
  value: string;
  row: number;
  col: number;
  // onChange: (row: number, col: number, value: string) => void;
  onSelect?: () => void;
  isPreFilled: boolean;
  isOwner: boolean;
  noteNumbers?: string[];
  selectedCell?: { row: number; col: number };
  sx?: SxProps;
};

const SudokuCell = React.memo(
  ({
    value,
    row,
    col,
    isPreFilled,
    isOwner,
    onSelect,
    noteNumbers,
    selectedCell,
    sx,
  }: SudokuCellProps) => {
    // const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const val = e.target.value;
    //   if (/^[1-9]?$/.test(val)) {
    //     onChange(row, col, val);
    //   }
    // };
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up("md"));
    const lg = useMediaQuery(theme.breakpoints.up("lg"));
    const thickRight = (col + 1) % 3 === 0 && col !== 8;
    const thickBottom = (row + 1) % 3 === 0 && row !== 8;

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Box
          onClick={() => {
            if (!isPreFilled && isOwner) {
              onSelect?.();
            }
          }}
          sx={{
            width: isOwner ? (lg ? 50 : md ? 40 : 30) : 30,
            height: isOwner ? (lg ? 50 : md ? 40 : 30) : 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            aspectRatio: "1",
            textAlign: "center",
            fontWeight: 500,
            fontSize: isOwner
              ? "clamp(16px, 2.5vw, 20px)"
              : "clamp(12px, 2.5vw, 16px)",
            border: "1px solid #ccc",
            borderRight: thickRight ? "2px solid #000" : "1px solid #ccc",
            borderBottom: thickBottom ? "2px solid #000" : "1px solid #ccc",
            outline: "none",
            backgroundColor: isPreFilled
              ? "#f0f0f0"
              : !isOwner && value
                ? "#efe7bc"
                : selectedCell?.col === col && selectedCell?.row === row
                  ? "primary.light"
                  : "transparent",
            color: isPreFilled ? "#000000" : isOwner ? "#000000" : "#efe7bc",
            fontFamily: "Kanit",
            ...sx,
          }}
        >
          {value}
        </Box>
        {/* <input
          type="tel"
          value={value}
          maxLength={1}
          onChange={(e) => {
            if (isPreFilled || !isOwner) {
              e.preventDefault();
              return;
            }
            handleInput(e);
          }}
          onClick={onSelect}
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "1",
            textAlign: "center",
            fontWeight: 500,
            fontSize: isOwner
              ? "clamp(16px, 2.5vw, 18px)"
              : "clamp(12px, 2.5vw, 14px)",
            border: "1px solid #ccc",
            borderRight: thickRight ? "2px solid #000" : "1px solid #ccc",
            borderBottom: thickBottom ? "2px solid #000" : "1px solid #ccc",
            outline: "none",
            backgroundColor: isPreFilled
              ? "#f0f0f0"
              : !isOwner && value
                ? "#efe7bc"
                : "transparent",
            color: isPreFilled ? "#000000" : isOwner ? "#000000" : "#efe7bc",
            fontFamily: "Kanit",
          }}
          // disabled={isPreFilled || !isOwner}
        /> */}
        {noteNumbers && !value && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: "1px",
              padding: "2px",
              fontSize: "8px",
              fontFamily: "Kanit",
              color: isOwner ? "#666" : "#fff",
              pointerEvents: "none",
            }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((number) => (
              <div
                key={number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(6px, 1.5vw, 8px)",
                  minHeight: "0",
                }}
              >
                {noteNumbers?.includes(number) ? number : "\u00A0"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default SudokuCell;
