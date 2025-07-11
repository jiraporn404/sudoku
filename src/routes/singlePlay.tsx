import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { emptyBoard, type Cell } from "../utils/generateData";
import { generateNewBoardData } from "../services/sudokuService";
import { Button, Grid, Stack, Typography, useMediaQuery } from "@mui/material";
import { Box } from "@mui/material";
import SudokuCell from "../components/SudokuCell";
import { useMutation } from "@tanstack/react-query";
import { LoadingOverlay } from "../components/LoadingOverlay";

function RouteComponent() {
  const touchDuration = 1000;
  let pressTimer: NodeJS.Timeout | undefined = undefined;
  const md = useMediaQuery("(min-width: 600px)");
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
  const [difficulty, setDifficulty] = useState<string>("");
  const [solution, setSolution] = useState<number[][]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [helpCount, setHelpCount] = useState<number>(0);
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
  const [noteNumbers, setNoteNumbers] = useState<string[][][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => [])
      )
  );
  const [activeNoteNumber, setActiveNoteNumber] = useState<string | null>(null);

  const { mutateAsync: generateNewBoardDataAsync, isPending } = useMutation({
    mutationFn: generateNewBoardData,
  });

  const generateNewBoard = async () => {
    const newBoard = await generateNewBoardDataAsync();
    setIsValid(null);
    setBoard(newBoard.puzzle);
    setDifficulty(newBoard.difficulty);
    setSolution(newBoard.solution);
    setHelpCount(5);
    setNoteNumbers(
      Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(() => [])
        )
    );
    localStorage.setItem(
      "noteNumbers",
      JSON.stringify(
        Array(9)
          .fill(null)
          .map(() =>
            Array(9)
              .fill(null)
              .map(() => [])
          )
      )
    );
    localStorage.setItem(
      "board",
      JSON.stringify({
        board: newBoard.puzzle,
        difficulty: newBoard.difficulty,
        solution: newBoard.solution,
        activeBoard: "",
        helpCount: 5,
      })
    );
  };

  const handleChange = (row: number, col: number, value: string) => {
    setIsValid(null);
    if (isNoteMode) {
      setNoteNumbers((prev) => {
        const newNoteNumbers = prev.map((rowArray, i) =>
          rowArray.map((colArray, j) =>
            i === row && j === col
              ? colArray.includes(value)
                ? colArray.filter((v: string) => v !== value) // Remove if already exists
                : [...colArray, value] // Add if doesn't exist
              : colArray
          )
        );
        localStorage.setItem("noteNumbers", JSON.stringify(newNoteNumbers));
        return newNoteNumbers;
      });
    } else {
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
      setNoteNumbers((prev) => {
        const newNoteNumbers = prev.map((rowArray, i) =>
          rowArray.map((colArray, j) =>
            i === row && j === col ? [] : colArray
          )
        );
        localStorage.setItem("noteNumbers", JSON.stringify(newNoteNumbers));
        return newNoteNumbers;
      });
    }
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

  // const validateBoard2 = (): boolean => {
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

  const handleCheck = () => {
    setIsValid(validateBoard());
  };

  useEffect(() => {
    const storageBoard = localStorage.getItem("board");
    const storageNoteNumbers = localStorage.getItem("noteNumbers");
    setNoteNumbers(
      storageNoteNumbers
        ? JSON.parse(storageNoteNumbers)
        : Array(9)
            .fill(null)
            .map(() =>
              Array(9)
                .fill(null)
                .map(() => [])
            )
    );
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

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;
  //     if (!target.closest("[data-sudoku-board]")) {
  //       setSelectedCell(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <>
      <LoadingOverlay open={isPending} />
      <Stack>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "Luckiest Guy",
              letterSpacing: 8,
              bgcolor:
                difficulty === "Easy"
                  ? "#55E485"
                  : difficulty === "Medium"
                    ? "#DE9542"
                    : "secondary.main",
              color: "white",
              p: 1,
            }}
          >
            Level: {difficulty}
          </Typography>
        </Box>
        <Stack
          direction={md ? "row" : "column"}
          justifyContent="center"
          alignItems="center"
        >
          <div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                height: 30,
                mb: 1,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 300,
                  margin: "0 auto",
                  px: 2,
                }}
              >
                {isNoteMode && (
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "Luckiest Guy", letterSpacing: 5 }}
                  >
                    ✍🏻 Note Mode
                  </Typography>
                )}
                <Button
                  variant={isNoteMode ? "contained" : "outlined"}
                  color="primary"
                  sx={{
                    position: "absolute",
                    right: 0,
                    width: "fit-content",
                    alignSelf: "flex-end",
                    fontFamily: "Luckiest Guy",
                    color: isNoteMode ? "white" : "primary.main",
                  }}
                  onClick={() => {
                    setIsNoteMode(!isNoteMode);
                  }}
                >
                  {isNoteMode ? "Note Off" : "Note On"}
                </Button>
              </Stack>
            </Box>

            <Box
              data-sudoku-board
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Grid
                container
                spacing={0.5}
                sx={{ maxWidth: 360, margin: "0 auto" }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(9, 1fr)",
                  }}
                >
                  {board?.map((row, rowIndex) =>
                    row?.map((cell, colIndex) => (
                      <Box key={`${rowIndex}-${colIndex}`}>
                        <SudokuCell
                          value={cell.value}
                          row={rowIndex}
                          col={colIndex}
                          // onChange={(row, col, value) =>
                          //   handleChange(row, col, value)
                          // }
                          isPreFilled={cell.isPreFilled}
                          isOwner={true}
                          onSelect={() => {
                            setSelectedCell({
                              row: rowIndex,
                              col: colIndex,
                            });
                            if (activeNoteNumber) {
                              if (activeNoteNumber === cell.value) {
                                handleChange(rowIndex, colIndex, "");
                              } else {
                                handleChange(
                                  rowIndex,
                                  colIndex,
                                  activeNoteNumber
                                );
                              }
                            }
                          }}
                          noteNumbers={
                            noteNumbers?.[rowIndex]?.[colIndex] ?? []
                          }
                          selectedCell={selectedCell ?? undefined}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Grid>
            </Box>
          </div>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 40px)",
                gap: 1,
                maxWidth: 360,
                margin: "0 auto",
                px: 2,
              }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => {
                const count = board.reduce((acc, row) => {
                  const count = row.filter((cell) => cell.value === num).length;
                  return acc + count;
                }, 0);
                return (
                  <Box
                    key={num}
                    className="no-select"
                    sx={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid",
                      borderColor:
                        activeNoteNumber === num ? "primary.main" : "#ccc",
                      bgcolor:
                        activeNoteNumber === num
                          ? "primary.light"
                          : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (activeNoteNumber) {
                        setActiveNoteNumber(null);
                        return;
                      }
                      if (selectedCell) {
                        handleChange(
                          selectedCell.row,
                          selectedCell.col,
                          board[selectedCell.row][selectedCell.col].value ===
                            num
                            ? ""
                            : num
                        );
                      }
                    }}
                    onTouchStart={() => {
                      pressTimer = setTimeout(() => {
                        setActiveNoteNumber(num);
                      }, touchDuration);
                    }}
                    onTouchEnd={() => {
                      clearTimeout(pressTimer);
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      {num}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: "center",
                        fontSize: 12,
                        color:
                          count === 9
                            ? "success.main"
                            : count > 9
                              ? "error.main"
                              : "text.secondary",
                        fontWeight: count === 9 ? 500 : 400,
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Stack>

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
            data-sudoku-board
            variant="outlined"
            color="secondary"
            disabled={helpCount === 0 || !selectedCell || isNoteMode}
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
    </>
  );
}

export const Route = createFileRoute("/singlePlay")({
  component: RouteComponent,
});
