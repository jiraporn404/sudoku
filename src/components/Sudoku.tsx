import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import SudokuCell from "./SudokuCell";
import {
  generateNewBoardForRoom,
  getRoomData,
  updateUserAnswer,
} from "../services/sudokuService";
import { emptyBoard, type Cell } from "../utils/generateData";
import { LoadingOverlay } from "./LoadingOverlay";

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

const emptyNoteNumbers = Array(9)
  .fill(null)
  .map(() =>
    Array(9)
      .fill(null)
      .map(() => [])
  );

export function Sudoku({ roomId }: Props) {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const lg = useMediaQuery(theme.breakpoints.up("lg"));
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
  const [isNoteModeA, setIsNoteModeA] = useState<boolean>(false);
  const [isNoteModeB, setIsNoteModeB] = useState<boolean>(false);
  const [noteNumbersA, setNoteNumbersA] =
    useState<string[][][]>(emptyNoteNumbers);
  const [noteNumbersB, setNoteNumbersB] =
    useState<string[][][]>(emptyNoteNumbers);
  const [activeNoteNumberA, setActiveNoteNumberA] = useState<string | null>(
    null
  );
  const [activeNoteNumberB, setActiveNoteNumberB] = useState<string | null>(
    null
  );
  const [isCheckA, setIsCheckA] = useState<boolean>(false);
  const [isCheckB, setIsCheckB] = useState<boolean>(false);
  const [correctPositionsA, setCorrectPositionsA] = useState<
    { row: number; col: number }[]
  >([]);
  const [correctPositionsB, setCorrectPositionsB] = useState<
    { row: number; col: number }[]
  >([]);

  const [activeBoard, setActiveBoard] = useState<"boardA" | "boardB">(
    (localStorage.getItem("activeBoard") as "boardA" | "boardB") || "boardA"
  );

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["board"],
    queryFn: async () => {
      const response = await getRoomData(roomId);
      return response;
    },
    enabled: !!roomId,
  });

  const { mutateAsync: generateNewBoardForRoomAsync, isPending } = useMutation({
    mutationFn: generateNewBoardForRoom,
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

    if (boardType === "boardA") {
      setIsCheckA(false);
    } else {
      setIsCheckB(false);
    }

    const board = boardType === "boardA" ? boardA : boardB;

    if (/^[1-9]?$/.test(value)) {
      if (boardType === "boardA") {
        if (isNoteModeA) {
          setNoteNumbersA((prev) => {
            const newNoteNumbers = prev.map((rowArray, i) =>
              rowArray.map((colArray, j) =>
                i === row && j === col
                  ? colArray.includes(value)
                    ? colArray.filter((v: string) => v !== value) // Remove if already exists
                    : [...colArray, value] // Add if doesn't exist
                  : colArray
              )
            );
            localStorage.setItem(
              "noteNumbersA",
              JSON.stringify(newNoteNumbers)
            );
            return newNoteNumbers;
          });
        } else {
          const newBoard = board.map((r, i) =>
            r.map((cell, j) =>
              i === row && j === col
                ? { value: value, isPreFilled: false }
                : cell
            )
          );
          setBoardA(newBoard);
          // Debounced API call instead of immediate call
          debouncedUpdateUserAnswer(roomId, boardType, row, col, value);
          // setNoteNumbersA((prev) => {
          //   const newNoteNumbers = prev.map((rowArray, i) =>
          //     rowArray.map((colArray, j) =>
          //       i === row && j === col ? [] : colArray
          //     )
          //   );
          //   localStorage.setItem(
          //     "noteNumbersA",
          //     JSON.stringify(newNoteNumbers)
          //   );
          //   return newNoteNumbers;
          // });
        }
      } else {
        if (isNoteModeB) {
          setNoteNumbersB((prev) => {
            const newNoteNumbers = prev.map((rowArray, i) =>
              rowArray.map((colArray, j) =>
                i === row && j === col
                  ? colArray.includes(value)
                    ? colArray.filter((v: string) => v !== value) // Remove if already exists
                    : [...colArray, value] // Add if doesn't exist
                  : colArray
              )
            );
            localStorage.setItem(
              "noteNumbersB",
              JSON.stringify(newNoteNumbers)
            );
            return newNoteNumbers;
          });
        } else {
          const newBoard = board.map((r, i) =>
            r.map((cell, j) =>
              i === row && j === col
                ? { value: value, isPreFilled: false }
                : cell
            )
          );
          setBoardB(newBoard);
          // Debounced API call instead of immediate call
          debouncedUpdateUserAnswer(roomId, boardType, row, col, value);
          // setNoteNumbersA((prev) => {
          //   const newNoteNumbers = prev.map((rowArray, i) =>
          //     rowArray.map((colArray, j) =>
          //       i === row && j === col ? [] : colArray
          //     )
          //   );
          //   localStorage.setItem(
          //     "noteNumbersA",
          //     JSON.stringify(newNoteNumbers)
          //   );
          //   return newNoteNumbers;
          // });
        }
      }
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
      setIsCheckA(true);
      setCorrectPositionsA(getCorrectPositions(boardType));
    } else {
      setIsValidB(validateSolution(boardType));
      setIsCheckB(true);
      setCorrectPositionsB(getCorrectPositions(boardType));
    }
  };

  const handleReset = async () => {
    await generateNewBoardForRoomAsync(roomId);
    await refetch();
    setIsValidA(null);
    setIsValidB(null);
    setNoteNumbersA(emptyNoteNumbers);
    setNoteNumbersB(emptyNoteNumbers);
    localStorage.setItem("noteNumbersA", JSON.stringify(emptyNoteNumbers));
    localStorage.setItem("noteNumbersB", JSON.stringify(emptyNoteNumbers));
    setIsCheckA(false);
    setIsCheckB(false);
    setCorrectPositionsA([]);
    setCorrectPositionsB([]);
  };

  const getCorrectPositions = (boardType: "boardA" | "boardB") => {
    const board = boardType === "boardA" ? boardA : boardB;
    const solution = boardType === "boardA" ? solutionA : solutionB;

    const correctPositions: { row: number; col: number }[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (
          board[row][col].value !== "" &&
          !board[row][col].isPreFilled &&
          Number(board[row][col].value) === solution[row][col]
        ) {
          correctPositions.push({ row, col });
        }
      }
    }
    return correctPositions;
  };

  useEffect(() => {
    const storageNoteNumbersA = localStorage.getItem("noteNumbersA");
    const storageNoteNumbersB = localStorage.getItem("noteNumbersB");
    if (storageNoteNumbersA) {
      setNoteNumbersA(JSON.parse(storageNoteNumbersA));
    }
    if (storageNoteNumbersB) {
      setNoteNumbersB(JSON.parse(storageNoteNumbersB));
    }

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

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;
  //     if (!target.closest("[data-sudoku-board]")) {
  //       setSelectedCellA(null);
  //       setSelectedCellB(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    if (!isNoteModeA) {
      setActiveNoteNumberA(null);
    }
  }, [isNoteModeA]);

  useEffect(() => {
    if (!isNoteModeB) {
      setActiveNoteNumberB(null);
    }
  }, [isNoteModeB]);

  return (
    <>
      <LoadingOverlay open={isLoading || isPending} />
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
          </Button>
          <ButtonGroup sx={{ mb: 2 }}>
            <Button
              value="boardA"
              onClick={() => {
                setActiveBoard("boardA");
                localStorage.setItem("activeBoard", "boardA");
              }}
              variant={activeBoard === "boardA" ? "contained" : "outlined"}
              sx={{
                color: activeBoard === "boardA" ? "white" : "text.primary",
              }}
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
              sx={{
                color: activeBoard === "boardB" ? "white" : "text.primary",
              }}
            >
              Board B
            </Button>
          </ButtonGroup>
        </Stack>
        <Stack
          direction={md ? "row" : "column"}
          justifyContent="center"
          alignItems="center"
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Grid
              container
              spacing={0.5}
              sx={{
                // maxWidth: activeBoard === "boardA" ? 360 : 270,
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
                        // onChange={(row, col, value) =>
                        //   handleChange(row, col, value, "boardA")
                        // }
                        isPreFilled={cell.isPreFilled}
                        isOwner={activeBoard === "boardA"}
                        onSelect={() => {
                          setSelectedCellA({
                            row: rowIndex,
                            col: colIndex,
                          });
                          if (activeNoteNumberA) {
                            if (activeNoteNumberA === cell.value) {
                              handleChange(rowIndex, colIndex, "", "boardA");
                            } else {
                              handleChange(
                                rowIndex,
                                colIndex,
                                activeNoteNumberA,
                                "boardA"
                              );
                            }
                          }
                        }}
                        noteNumbers={noteNumbersA?.[rowIndex]?.[colIndex] ?? []}
                        selectedCell={selectedCellA ?? undefined}
                        sx={{
                          color:
                            activeBoard !== "boardA" && !cell.isPreFilled
                              ? "#efe7bc"
                              : !cell.isPreFilled &&
                                  isCheckA &&
                                  !correctPositionsA.some(
                                    (pos) =>
                                      pos.row === rowIndex &&
                                      pos.col === colIndex
                                  )
                                ? "error.main"
                                : "inherit",
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Grid>
          </Box>
          {activeBoard === "boardA" && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: lg
                    ? "repeat(3, 50px)"
                    : md
                      ? "repeat(3, 40px)"
                      : "repeat(3, 30px)",
                  gap: 1,
                  // maxWidth: 360,
                  margin: "0 auto",
                  px: 2,
                }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <Box
                    key={num}
                    sx={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid",
                      borderColor:
                        activeNoteNumberA === num ? "primary.main" : "#ccc",
                      bgcolor:
                        activeNoteNumberA === num
                          ? "primary.light"
                          : "transparent",
                      cursor: "pointer",
                      // "&:hover": {
                      //   bgcolor: "primary.light",
                      // },
                    }}
                    onClick={() => {
                      if (activeNoteNumberA === num) {
                        setActiveNoteNumberA(null);
                        return;
                      }
                      if (isNoteModeA) {
                        setActiveNoteNumberA(num);
                        return;
                      }
                      if (selectedCellA) {
                        handleChange(
                          selectedCellA.row,
                          selectedCellA.col,
                          boardA[selectedCellA.row][selectedCellA.col].value ===
                            num
                            ? ""
                            : num,
                          "boardA"
                        );
                      }
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
                        color: "text.secondary",
                      }}
                    >
                      {boardA.reduce((acc, row) => {
                        const count = row.filter(
                          (cell) => cell.value === num
                        ).length;
                        return acc + count;
                      }, 0)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Stack>

        {activeBoard === "boardA" && (
          <>
            {isNoteModeA && (
              <Typography
                variant="body2"
                sx={{ fontFamily: "Luckiest Guy", letterSpacing: 10 }}
              >
                ✍🏻 Note Mode
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  width: "fit-content",
                }}
                onClick={() => handleCheck(activeBoard)}
                disabled={boardA.some((row) =>
                  row.some((cell) => cell.value === "")
                )}
              >
                Check
              </Button>
              <Button
                variant={isNoteModeA ? "contained" : "outlined"}
                color="primary"
                sx={{
                  width: "fit-content",
                  color: isNoteModeA ? "white" : "primary.main",
                }}
                onClick={() => {
                  setIsNoteModeA(!isNoteModeA);
                }}
              >
                {isNoteModeA ? "Note Off" : "Note On"}
              </Button>
              <Button
                data-sudoku-board
                variant="outlined"
                color="secondary"
                disabled={helpCountA === 0 || !selectedCellA || isNoteModeA}
                onClick={() => {
                  if (selectedCellA && helpCountA > 0) {
                    handleChange(
                      selectedCellA.row,
                      selectedCellA.col,
                      solutionA[selectedCellA.row][
                        selectedCellA.col
                      ].toString(),
                      "boardA"
                    );
                    setHelpCountA(helpCountA - 1);
                  }
                }}
              >
                Help ({helpCountA ?? 0})
              </Button>
            </Box>
            {isValidA !== null && (
              <Typography
                variant="subtitle2"
                sx={{ mt: 2 }}
                color={isValidA ? "green" : "error"}
              >
                {isValidA
                  ? "✅ Correct! Well done!"
                  : "❌ Incorrect, try again!"}
              </Typography>
            )}
          </>
        )}

        <Divider />
        <Stack
          direction={md ? "row" : "column"}
          justifyContent="center"
          alignItems="center"
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Grid
              container
              spacing={0.5}
              sx={{
                // maxWidth: activeBoard === "boardB" ? 360 : 270,
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
                        // onChange={(row, col, value) =>
                        //   handleChange(row, col, value, "boardB")
                        // }
                        isPreFilled={cell.isPreFilled}
                        isOwner={activeBoard === "boardB"}
                        onSelect={() => {
                          setSelectedCellB({
                            row: rowIndex,
                            col: colIndex,
                          });

                          if (activeNoteNumberB) {
                            if (activeNoteNumberB === cell.value) {
                              handleChange(rowIndex, colIndex, "", "boardB");
                            } else {
                              handleChange(
                                rowIndex,
                                colIndex,
                                activeNoteNumberB,
                                "boardB"
                              );
                            }
                          }
                        }}
                        noteNumbers={noteNumbersB?.[rowIndex]?.[colIndex] ?? []}
                        selectedCell={selectedCellB ?? undefined}
                        sx={{
                          color:
                            activeBoard !== "boardB" && !cell.isPreFilled
                              ? "#efe7bc"
                              : !cell.isPreFilled &&
                                  isCheckB &&
                                  !correctPositionsB.some(
                                    (pos) =>
                                      pos.row === rowIndex &&
                                      pos.col === colIndex
                                  )
                                ? "error.main"
                                : "inherit",
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Grid>
          </Box>
          {activeBoard === "boardB" && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: lg
                    ? "repeat(3, 50px)"
                    : md
                      ? "repeat(3, 40px)"
                      : "repeat(3, 30px)",
                  gap: 1,
                  // maxWidth: 360,
                  margin: "0 auto",
                  px: 2,
                }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <Box
                    key={num}
                    sx={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid",
                      borderColor:
                        activeNoteNumberB === num ? "primary.main" : "#ccc",
                      bgcolor:
                        activeNoteNumberB === num
                          ? "primary.light"
                          : "transparent",
                      cursor: "pointer",
                      // "&:hover": {
                      //   bgcolor: "primary.light",
                      // },
                    }}
                    onClick={() => {
                      if (activeNoteNumberB === num) {
                        setActiveNoteNumberB(null);
                        return;
                      }
                      if (isNoteModeB) {
                        setActiveNoteNumberB(num);
                        return;
                      }
                      if (selectedCellB) {
                        handleChange(
                          selectedCellB.row,
                          selectedCellB.col,
                          boardB[selectedCellB.row][selectedCellB.col].value ===
                            num
                            ? ""
                            : num,
                          "boardB"
                        );
                      }
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
                        color: "text.secondary",
                      }}
                    >
                      {boardB.reduce((acc, row) => {
                        const count = row.filter(
                          (cell) => cell.value === num
                        ).length;
                        return acc + count;
                      }, 0)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Stack>

        {activeBoard === "boardB" && (
          <>
            {isNoteModeB && (
              <Typography
                variant="body2"
                sx={{ fontFamily: "Luckiest Guy", letterSpacing: 10 }}
              >
                ✍🏻 Note Mode
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                sx={{ width: "fit-content" }}
                onClick={() => handleCheck(activeBoard)}
                disabled={boardB.some((row) =>
                  row.some((cell) => cell.value === "")
                )}
              >
                Check
              </Button>
              <Button
                variant={isNoteModeB ? "contained" : "outlined"}
                color="primary"
                sx={{
                  width: "fit-content",
                  color: isNoteModeB ? "white" : "primary.main",
                }}
                onClick={() => {
                  setIsNoteModeB(!isNoteModeB);
                }}
              >
                {isNoteModeB ? "Note Off" : "Note On"}
              </Button>
              <Button
                data-sudoku-board
                variant="outlined"
                color="secondary"
                disabled={helpCountB === 0 || !selectedCellB || isNoteModeB}
                onClick={() => {
                  if (selectedCellB && helpCountB > 0) {
                    handleChange(
                      selectedCellB.row,
                      selectedCellB.col,
                      solutionB[selectedCellB.row][
                        selectedCellB.col
                      ].toString(),
                      "boardB"
                    );
                    setHelpCountB(helpCountB - 1);
                  }
                }}
              >
                Help ({helpCountA ?? 0})
              </Button>
            </Box>
            {isValidB !== null && (
              <Typography
                variant="subtitle2"
                sx={{ mt: 2 }}
                color={isValidB ? "green" : "error"}
              >
                {isValidB
                  ? "✅ Correct! Well done!"
                  : "❌ Incorrect, try again!"}
              </Typography>
            )}
          </>
        )}

        <Divider sx={{ pb: 2 }} />
      </Stack>
    </>
  );
}
