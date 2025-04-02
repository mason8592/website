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

export default class tttGame implements TicTacToeGame {
    board: TicTacToeBoard
    turnNumber: number
    currentPlayer: 'X' | 'O'
    xID: string | null
    oID: string | null
    gameState: string

    constructor() {
        this.board = Array(9).fill(null)
        this.turnNumber = 1 
        this.currentPlayer = "X"
        this.xID = null
        this.oID = null
        this.gameState = 'active'
    }

    checkBoard(boardToCheck: TicTacToeBoard): string {
        console.log(this.turnNumber)

        for (const line of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) {
    
            if (line.every(value => boardToCheck[value] === "X")) {
                console.log("X wins", boardToCheck)
                return "X"
            } else if (line.every(value => boardToCheck[value] === "O")) {
                console.log("O wins", boardToCheck)
                return "O"
            }
            
        }

        if (this.turnNumber === 9) {
            console.log(boardToCheck)
            return "draw"
        }

        return 'active'
    }

    advanceTurn(): void {
        console.log('advancing turn from', this.turnNumber)
        this.turnNumber += 1
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
    }

    restart(): void {
        this.board = Array(9).fill(null)
        this.turnNumber = 1 
        this.currentPlayer = "X"
        this.gameState = 'active'
    }

    handleClick({ index, player }: {index: number, player: "X" | "O"}): boolean {
        if (this.board[index] === null && this.currentPlayer === player) {
            this.board[index] = this.currentPlayer

            if (this.turnNumber >= 5) {
                this.gameState = this.checkBoard(this.board)
            }

            this.advanceTurn()

            return true
        }

        return false
    }

}