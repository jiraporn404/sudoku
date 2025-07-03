type Board = {
  newboard: {
    grids: [
      {
        value: number[][];
        solution: number[][];
        difficulty: string;
      }
    ];
    results: number;
    message: string;
  };
};

export async function getBoard() {
  const response = await fetch("https://sudoku-api.vercel.app/api/dosuku");

  const data: Board = await response.json();
  return data.newboard.grids[0];
}
