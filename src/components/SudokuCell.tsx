import React from "react";

type SudokuCellProps = {
  value: string;
  row: number;
  col: number;
  onChange: (row: number, col: number, value: string) => void;
  onSelect?: () => void;
  isPreFilled: boolean;
  isOwner: boolean;
};

const SudokuCell = React.memo(
  ({
    value,
    row,
    col,
    onChange,
    isPreFilled,
    isOwner,
    onSelect,
  }: SudokuCellProps) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^[1-9]?$/.test(val)) {
        onChange(row, col, val);
      }
    };

    const thickRight = (col + 1) % 3 === 0 && col !== 8;
    const thickBottom = (row + 1) % 3 === 0 && row !== 8;

    return (
      <input
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
      />
    );
  }
);

export default SudokuCell;
