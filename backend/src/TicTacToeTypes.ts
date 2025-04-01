export type TicTacToeBoard = Array<null | "X" | "O">

export interface TicTacToeGame {
    board: TicTacToeBoard;
    turnNumber: number;
    currentPlayer: "X" | "O";
    xID: string | null;
    oID: string | null;
    gameState: string;
    checkBoard(board: TicTacToeBoard): string;
    advanceTurn(): void;
    restart(): void;
    handleClick(object: { index: number, lobbyID: string, player: "X" | "O", }): boolean;
}
