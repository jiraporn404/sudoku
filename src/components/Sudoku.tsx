import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SudokuCell from "./SudokuCell";
import {
  generateNewBoardForRoom,
  getRoomData,
  updateUserAnswer,
} from "../services/sudokuService";
import { emptyBoard, type Cell } from "../utils/generateData";

type Props = {
  roomId: string;
};

const useDebounce = (callback: Function, delay: number) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );
};

export function Sudoku({ roomId }: Props) {
  const [boardA, setBoardA] = useState<Cell[][]>(emptyBoard);
  const [boardB, setBoardB] = useState<Cell[][]>(emptyBoard);
  const [solutionA, setSolutionA] = useState<number[][]>([]);
  const [solutionB, setSolutionB] = useState<number[][]>([]);
  const [isValidA, setIsValidA] = useState<boolean | null>(null);
  const [isValidB, setIsValidB] = useState<boolean | null>(null);
  const [helpCountA, setHelpCountA] = useState<number>(0);
  const [helpCountB, setHelpCountB] = useState<number>(0);
  const [selectedCellA, setSelectedCellA] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedCellB, setSelectedCellB] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [activeBoard, setActiveBoard] = useState<"boardA" | "boardB">(
    (localStorage.getItem("activeBoard") as "boardA" | "boardB") || "boardA"
  );

  const { data, refetch } = useQuery({
    queryKey: ["board"],
    queryFn: async () => {
      const response = await getRoomData(roomId);
      return response;
    },
    enabled: !!roomId,
  });

  // Debounced API call function
  const debouncedUpdateUserAnswer = useDebounce(
    async (
      roomId: string,
      boardType: "boardA" | "boardB",
      row: number,
      col: number,
      value: string
    ) => {
      try {
        await updateUserAnswer(roomId, boardType, row, col, value);
      } catch (error) {
        console.error("Error updating user answer:", error);
      }
    },
    500
  );

  const handleChange = async (
    row: number,
    col: number,
    value: string,
    boardType: "boardA" | "boardB"
  ) => {
    activeBoard === boardType && setIsValidA(null);
    activeBoard === boardType && setIsValidB(null);
    if (/^[1-9]?$/.test(value)) {
      const newBoard =
        boardType === "boardA"
          ? boardA.map((r, i) =>
              r.map((cell, j) =>
                i === row && j === col
                  ? { value: value, isPreFilled: false }
                  : cell
              )
            )
          : boardB.map((r, i) =>
              r.map((cell, j) =>
                i === row && j === col
                  ? { value: value, isPreFilled: false }
                  : cell
              )
            );

      if (boardType === "boardA") {
        setBoardA(newBoard);
      } else {
        setBoardB(newBoard);
      }

      // Debounced API call instead of immediate call
      debouncedUpdateUserAnswer(roomId, boardType, row, col, value);
    }
  };

  // const validateBoard = (boardType: "boardA" | "boardB"): boolean => {
  //   const board = boardType === "boardA" ? boardA : boardB;

  //   const isUnique = (arr: string[]) => {
  //     const nums = arr.filter((v) => v !== "");
  //     return new Set(nums).size === nums.length;
  //   };

  //   // Check for completeness
  //   for (let row of board) {
  //     for (let cell of row) {
  //       if (cell.value === "") return false;
  //     }
  //   }

  //   // Check rows
  //   for (let i = 0; i < 9; i++) {
  //     if (!isUnique(board[i].map((cell) => cell.value))) return false;
  //   }

  //   // Check columns
  //   for (let j = 0; j < 9; j++) {
  //     const col = board.map((row) => row[j].value);
  //     if (!isUnique(col)) return false;
  //   }

  //   // Check 3x3 boxes
  //   for (let boxRow = 0; boxRow < 3; boxRow++) {
  //     for (let boxCol = 0; boxCol < 3; boxCol++) {
  //       const box: string[] = [];
  //       for (let i = 0; i < 3; i++) {
  //         for (let j = 0; j < 3; j++) {
  //           box.push(board[boxRow * 3 + i][boxCol * 3 + j].value);
  //         }
  //       }
  //       if (!isUnique(box)) return false;
  //     }
  //   }

  //   return true;
  // };

  const validateSolution = (boardType: "boardA" | "boardB"): boolean => {
    const board = boardType === "boardA" ? boardA : boardB;
    const solution = boardType === "boardA" ? solutionA : solutionB;

    if (!solution) return false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j].value !== solution[i][j].toString()) {
          return false;
        }
      }
    }

    return true;
  };

  const handleCheck = (boardType: "boardA" | "boardB") => {
    if (boardType === "boardA") {
      setIsValidA(validateSolution(boardType));
    } else {
      setIsValidB(validateSolution(boardType));
    }
  };

  const handleReset = () => {
    generateNewBoardForRoom(roomId);
    refetch();
    setIsValidA(null);
    setIsValidB(null);
  };

  useEffect(() => {
    if (data) {
      setBoardA(data.boardA.userAnswers);
      setBoardB(data.boardB.userAnswers);
      setHelpCountA(data.boardA.helpCount);
      setHelpCountB(data.boardB.helpCount);
      setSolutionA(data.boardA.solution);
      setSolutionB(data.boardB.solution);
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-sudoku-board]")) {
        setSelectedCellA(null);
        setSelectedCellB(null);
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
          Level: {data?.boardA.difficulty}
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="center">
        <Button
          variant="contained"
          color="warning"
          sx={{ mt: 2 }}
          onClick={handleReset}
        >
          New Game
        </Button>{" "}
        <ButtonGroup sx={{ mb: 2 }}>
          <Button
            value="boardA"
            onClick={() => {
              setActiveBoard("boardA");
              localStorage.setItem("activeBoard", "boardA");
            }}
            variant={activeBoard === "boardA" ? "contained" : "outlined"}
            sx={{ color: activeBoard === "boardA" ? "white" : "text.primary" }}
          >
            Board A
          </Button>
          <Button
            value="boardB"
            onClick={() => {
              setActiveBoard("boardB");
              localStorage.setItem("activeBoard", "boardB");
            }}
            variant={activeBoard === "boardB" ? "contained" : "outlined"}
            sx={{ color: activeBoard === "boardB" ? "white" : "text.primary" }}
          >
            Board B
          </Button>
        </ButtonGroup>
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Grid
          container
          spacing={0.5}
          sx={{
            maxWidth: activeBoard === "boardA" ? 360 : 270,
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              border: 2,
              borderColor:
                activeBoard === "boardA" ? "success.main" : "transparent",
            }}
          >
            {boardA?.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Box key={`${rowIndex}-${colIndex}`}>
                  <SudokuCell
                    value={cell.value}
                    row={rowIndex}
                    col={colIndex}
                    onChange={(row, col, value) =>
                      handleChange(row, col, value, "boardA")
                    }
                    isPreFilled={cell.isPreFilled}
                    isOwner={activeBoard === "boardA"}
                    onSelect={() =>
                      setSelectedCellA({
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
      {activeBoard === "boardA" && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            sx={{
              width: "fit-content",
            }}
            onClick={() => handleCheck(activeBoard)}
          >
            Check
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            disabled={helpCountA === 0 || !selectedCellA}
            onClick={() => {
              if (selectedCellA && helpCountA > 0) {
                handleChange(
                  selectedCellA.row,
                  selectedCellA.col,
                  solutionA[selectedCellA.row][selectedCellA.col].toString(),
                  "boardA"
                );
                setHelpCountA(helpCountA - 1);
              }
            }}
          >
            Help ({helpCountA ?? 0})
          </Button>
        </Box>
      )}
      {isValidA !== null && (
        <Typography
          variant="subtitle2"
          sx={{ mt: 2 }}
          color={isValidA ? "green" : "error"}
        >
          {isValidA ? "✅ Correct! Well done!" : "❌ Incorrect, try again!"}
        </Typography>
      )}
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Grid
          container
          spacing={0.5}
          sx={{
            maxWidth: activeBoard === "boardB" ? 360 : 270,
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              border: 2,
              borderColor:
                activeBoard === "boardB" ? "success.main" : "transparent",
            }}
          >
            {boardB?.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Box key={`${rowIndex}-${colIndex}`}>
                  <SudokuCell
                    value={cell.value}
                    row={rowIndex}
                    col={colIndex}
                    onChange={(row, col, value) =>
                      handleChange(row, col, value, "boardB")
                    }
                    isPreFilled={cell.isPreFilled}
                    isOwner={activeBoard === "boardB"}
                    onSelect={() =>
                      setSelectedCellB({
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
      {activeBoard === "boardB" && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            sx={{ width: "fit-content" }}
            onClick={() => handleCheck(activeBoard)}
          >
            Check
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            disabled={helpCountB === 0 || !selectedCellB}
            onClick={() => {
              if (selectedCellB && helpCountB > 0) {
                handleChange(
                  selectedCellB.row,
                  selectedCellB.col,
                  solutionB[selectedCellB.row][selectedCellB.col].toString(),
                  "boardB"
                );
                setHelpCountB(helpCountB - 1);
              }
            }}
          >
            Help ({helpCountA ?? 0})
          </Button>
        </Box>
      )}

      {isValidB !== null && (
        <Typography
          variant="subtitle2"
          sx={{ mt: 2 }}
          color={isValidB ? "green" : "error"}
        >
          {isValidB ? "✅ Correct! Well done!" : "❌ Incorrect, try again!"}
        </Typography>
      )}
      <Divider />
    </Stack>
  );
}
