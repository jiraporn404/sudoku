import { serverTimestamp } from "firebase/firestore";
import { get, ref, remove, set, update } from "firebase/database";
import { dbRealTime } from "../storage/firebase";
import { getBoard } from "../api/getBoard";

const db = dbRealTime;

type Cell = {
  value: string;
  isPreFilled: boolean;
};

type Board = Cell[][];

type SudokuBoard = {
  value: number[][];
  solution: number[][];
  difficulty: string;
};

// Enhanced board structure with solution and user answers
type BoardData = {
  puzzle: Board; // The original puzzle with prefilled cells
  solution: number[][]; // The complete solution from API
  userAnswers: Board; // User's current answers
  difficulty: string; // Difficulty level from API
};

type RoomData = {
  roomId: string;
  boardA: BoardData;
  boardB: BoardData;
  createdAt: any;
  updatedAt?: any;
};

const emptyBoard = (): Board =>
  Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: "", isPreFilled: false }))
    );

// Convert API board format to our Cell format
const convertApiBoardToCellBoard = (apiBoard: SudokuBoard): Board => {
  const board: Board = Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: "", isPreFilled: false }))
    );

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const value = apiBoard.value[i][j];
      board[i][j] = {
        value: value === 0 ? "" : value.toString(),
        isPreFilled: value !== 0,
      };
    }
  }

  return board;
};

// Create user answers board (initially empty except for prefilled cells)
const createUserAnswersBoard = (puzzle: Board): Board => {
  const userAnswers: Board = Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: "", isPreFilled: false }))
    );

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      userAnswers[i][j] = {
        value: puzzle[i][j].isPreFilled ? puzzle[i][j].value : "",
        isPreFilled: puzzle[i][j].isPreFilled,
      };
    }
  }

  return userAnswers;
};

// Generate a new board data from the API
export const generateNewBoardData = async (): Promise<BoardData> => {
  try {
    const apiBoard = await getBoard();
    const puzzle = convertApiBoardToCellBoard(apiBoard);
    const userAnswers = createUserAnswersBoard(puzzle);

    return {
      puzzle,
      solution: apiBoard.solution,
      userAnswers,
      difficulty: apiBoard.difficulty,
    };
  } catch (error) {
    console.error("Error generating new board:", error);
    // Return empty board data as fallback
    const emptyPuzzle = emptyBoard();
    return {
      puzzle: emptyPuzzle,
      solution: Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)),
      userAnswers: createUserAnswersBoard(emptyPuzzle),
      difficulty: "unknown",
    };
  }
};

export const createRoom = async (roomId: string) => {
  const roomRef = ref(db, `rooms/${roomId}`);

  // Generate two different boards for the room
  const board = await generateNewBoardData();
  const boardA = board;
  const boardB = board;

  await set(roomRef, {
    roomId,
    boardA,
    boardB,
    createdAt: serverTimestamp(),
  });
};

export const generateNewBoardForRoom = async (
  roomId: string
  //   boardType: "boardA" | "boardB"
) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  const newBoardData = await generateNewBoardData();

  await update(roomRef, {
    // [boardType]: newBoardData,
    boardA: newBoardData,
    boardB: newBoardData,
    updatedAt: serverTimestamp(),
  });

  return newBoardData;
};

// export const generateNewBoardA = async (roomId: string) => {
//   return generateNewBoardForRoom(roomId, "boardA");
// };

// export const generateNewBoardB = async (roomId: string) => {
//   return generateNewBoardForRoom(roomId, "boardB");
// };

// Update user answer for a specific cell
export const updateUserAnswer = async (
  roomId: string,
  boardType: "boardA" | "boardB",
  row: number,
  col: number,
  value: string
) => {
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = snapshot.val();
    const boardData = roomData[boardType];

    // Don't allow updating prefilled cells
    if (boardData.puzzle[row][col].isPreFilled) {
      throw new Error("Cannot update prefilled cell");
    }

    // Update the user answer using bracket notation to avoid dot issues
    const updatePath = `${boardType}/userAnswers/${row}/${col}/value`;
    await update(roomRef, {
      [updatePath]: value,
      updatedAt: serverTimestamp(),
    });

    return boardData.userAnswers;
  } catch (error) {
    console.error("Error updating user answer:", error);
    throw error;
  }
};

// Update the entire user answers board
export const updateUserBoard = async (
  roomId: string,
  boardType: "boardA" | "boardB",
  newUserAnswers: Board
) => {
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = snapshot.val();
    const boardData = roomData[boardType];

    // Validate that prefilled cells haven't been modified
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (boardData.puzzle[row][col].isPreFilled) {
          const originalValue = boardData.puzzle[row][col].value;
          const newValue = newUserAnswers[row][col].value;
          if (originalValue !== newValue) {
            throw new Error(
              `Cannot modify prefilled cell at position (${row}, ${col})`
            );
          }
        }
      }
    }

    // Update the entire user answers board
    await update(roomRef, {
      [`${boardType}/userAnswers`]: newUserAnswers,
      updatedAt: serverTimestamp(),
    });

    return newUserAnswers;
  } catch (error) {
    console.error("Error updating user board:", error);
    throw error;
  }
};

// Get a specific board data from a room
export const getBoardDataFromRoom = async (
  roomId: string,
  boardType: "boardA" | "boardB"
): Promise<BoardData | null> => {
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomData = snapshot.val();
      return roomData[boardType] || null;
    }

    return null;
  } catch (error) {
    console.error(`Error getting ${boardType} from room ${roomId}:`, error);
    return null;
  }
};

// Get boardA data from a room
export const getBoardAData = async (
  roomId: string
): Promise<BoardData | null> => {
  return getBoardDataFromRoom(roomId, "boardA");
};

// Get boardB data from a room
export const getBoardBData = async (
  roomId: string
): Promise<BoardData | null> => {
  return getBoardDataFromRoom(roomId, "boardB");
};

// Get user answers for a specific board
export const getUserAnswers = async (
  roomId: string,
  boardType: "boardA" | "boardB"
): Promise<Board | null> => {
  const boardData = await getBoardDataFromRoom(roomId, boardType);
  return boardData?.userAnswers || null;
};

// Get puzzle (original board) for a specific board
export const getPuzzle = async (
  roomId: string,
  boardType: "boardA" | "boardB"
): Promise<Board | null> => {
  const boardData = await getBoardDataFromRoom(roomId, boardType);
  return boardData?.puzzle || null;
};

// Get solution for a specific board
export const getSolution = async (
  roomId: string,
  boardType: "boardA" | "boardB"
): Promise<number[][] | null> => {
  const boardData = await getBoardDataFromRoom(roomId, boardType);
  return boardData?.solution || null;
};

// Check if user's answer is correct
export const checkAnswer = async (
  roomId: string,
  boardType: "boardA" | "boardB",
  row: number,
  col: number
): Promise<boolean> => {
  const boardData = await getBoardDataFromRoom(roomId, boardType);
  if (!boardData) return false;

  const userValue = boardData.userAnswers[row][col].value;
  const correctValue = boardData.solution[row][col].toString();

  return userValue === correctValue;
};

// Get all room data including both boards
export const getRoomData = async (roomId: string): Promise<RoomData | null> => {
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error(`Error getting room data for ${roomId}:`, error);
    return null;
  }
};

// Check if a room exists
export const roomExists = async (roomId: string): Promise<boolean> => {
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    return snapshot.exists();
  } catch (error) {
    console.error(`Error checking if room ${roomId} exists:`, error);
    return false;
  }
};

export const delRoom = async (roomId: string) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  await remove(roomRef);
};

export const listRooms = async () => {
  const roomRef = ref(db, `rooms`);
  const snapshot = await get(roomRef);
  return snapshot.val();
};

export const deleteRoom = async (roomId: string) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  await remove(roomRef);
};
