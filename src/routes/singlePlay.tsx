import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { emptyBoard, type Cell } from "../utils/generateData";
import { generateNewBoardData } from "../services/sudokuService";
import { Button, Grid, Stack, Typography } from "@mui/material";
import { Box } from "@mui/material";
import SudokuCell from "../components/SudokuCell";

function RouteComponent() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
  const [difficulty, setDifficulty] = useState<string>("");
  const [solution, setSolution] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [helpCount, setHelpCount] = useState<number>(0);

  const generateNewBoard = async () => {
    const newBoard = await generateNewBoardData();
    setBoard(newBoard.puzzle);
    setDifficulty(newBoard.difficulty);
    localStorage.setItem(
      "board",
      JSON.stringify({
        board: newBoard.puzzle,
        difficulty: newBoard.difficulty,
        solution: newBoard.solution,
        activeBoard: "",
        helpCount: 3,
      })
    );
  };

  const handleChange = (row: number, col: number, value: string) => {
    setIsValid(null);
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? { ...cell, value } : cell))
    );
    setBoard(newBoard);
    localStorage.setItem(
      "board",
      JSON.stringify({
        board: newBoard,
        difficulty: difficulty,
        solution: solution,
        helpCount: helpCount,
      })
    );
  };

  const validateBoard = (): boolean => {
    const isUnique = (arr: string[]) => {
      const nums = arr.filter((v) => v !== "");
      return new Set(nums).size === nums.length;
    };

    // Check for completeness
    for (let row of board) {
      for (let cell of row) {
        if (cell.value === "") return false;
      }
    }

    // Check rows
    for (let i = 0; i < 9; i++) {
      if (!isUnique(board[i].map((cell) => cell.value))) return false;
    }

    // Check columns
    for (let j = 0; j < 9; j++) {
      const col = board.map((row) => row[j].value);
      if (!isUnique(col)) return false;
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const box: string[] = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            box.push(board[boxRow * 3 + i][boxCol * 3 + j].value);
          }
        }
        if (!isUnique(box)) return false;
      }
    }

    return true;
  };

  const handleCheck = () => {
    setIsValid(validateBoard());
  };

  useEffect(() => {
    const storageBoard = localStorage.getItem("board");
    if (storageBoard) {
      const { board, difficulty, solution, helpCount } =
        JSON.parse(storageBoard);
      setBoard(board);
      setDifficulty(difficulty);
      setSolution(solution);
      setHelpCount(helpCount);
    } else {
      generateNewBoard();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-sudoku-board]")) {
        setSelectedCell(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Stack>
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontFamily: "Luckiest Guy",
            letterSpacing: 8,
            bgcolor: "secondary.main",
            color: "white",
            p: 1,
          }}
        >
          Level: {difficulty}
        </Typography>
      </Box>
      <Box data-sudoku-board sx={{ display: "flex", justifyContent: "center" }}>
        <Grid container spacing={0.5} sx={{ maxWidth: 360, margin: "0 auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
            }}
          >
            {board?.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Box key={`${rowIndex}-${colIndex}`}>
                  <SudokuCell
                    value={cell.value}
                    row={rowIndex}
                    col={colIndex}
                    onChange={(row, col, value) =>
                      handleChange(row, col, value)
                    }
                    isPreFilled={cell.isPreFilled}
                    isOwner={true}
                    onSelect={() =>
                      setSelectedCell({
                        row: rowIndex,
                        col: colIndex,
                      })
                    }
                  />
                </Box>
              ))
            )}
          </Box>
        </Grid>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{ width: "fit-content", color: "white" }}
          onClick={() => generateNewBoard()}
        >
          New Game
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{ width: "fit-content" }}
          onClick={() => handleCheck()}
        >
          Check
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          disabled={helpCount === 0 || !selectedCell}
          onClick={() => {
            if (selectedCell && helpCount > 0) {
              handleChange(
                selectedCell.row,
                selectedCell.col,
                solution[selectedCell.row][selectedCell.col].toString()
              );
              setHelpCount(helpCount - 1);
            }
          }}
        >
          Help ({helpCount})
        </Button>
      </Box>
      {isValid !== null && (
        <Typography
          variant="subtitle2"
          sx={{ mt: 2 }}
          color={isValid ? "green" : "error"}
        >
          {isValid ? "✅ Correct! Well done!" : "❌ Incorrect, try again!"}
        </Typography>
      )}
    </Stack>
  );
}

export const Route = createFileRoute("/singlePlay")({
  component: RouteComponent,
});
