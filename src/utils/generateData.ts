export type Cell = {
  value: string;
  isPreFilled: boolean;
};

export const emptyBoard: Cell[][] = Array.from({ length: 9 }, () =>
  Array(9).fill({ value: "", isPreFilled: false })
);
