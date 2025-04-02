import type { Server, Socket } from "socket.io"
import { type TicTacToeGame } from "./gameLogic"
import tttGame from "./gameLogic"

type GamesObject = { [key: string]: TicTacToeGame }
type UsersPlaying = { [key: string]: string }

export const setupTttServer = (io: Server) => {
    /**
     * A list of lobby IDs, mapped to their corresponding TicTacToeGame instance
     */
    const tttGames: GamesObject = {}
    /**
     * A list of user IDs, mapped to the ID of whatever TTT game they're currently in
     */
    const usersCurrentlyPlaying: UsersPlaying = {}

    io.on("connection", (socket: Socket) => {
        console.log(Date.now(), "A connection was opened!")
        //////////////////////////////////////
    
    
        socket.on("message", message => {
            io.emit("message", message)
        })
    
        socket.on("click", ({ index, lobbyID, whoAmI: player }: {index: number, lobbyID: string, whoAmI: "X" | "O"}) => {
            console.log(`${player} clicked ${index} in ${lobbyID}`)
    
            if (tttGames[lobbyID]?.handleClick({ index, lobbyID, player })) { // handleClick returns true if the click did anything, and false if it didn't (i.e. the move was invalid)
                console.log("updating board", tttGames[lobbyID])
                io.to(lobbyID).emit('updatedGame', tttGames[lobbyID]) // only re-emit board if the move was valid
            }
    
        })
    
        socket.on("tttJoinRoom", ({lobbyID, userID}) => {
            console.log(`${userID} joined ${lobbyID}`)
            socket.join(lobbyID)
    
            if (!tttGames[lobbyID]) {
                tttGames[lobbyID] = new tttGame()
            }
    
            usersCurrentlyPlaying[userID] = lobbyID
    
            if (tttGames[lobbyID].xID === null) {
                tttGames[lobbyID].xID = userID
            } else if (tttGames[lobbyID].oID === null) {
                tttGames[lobbyID].oID = userID
            } else {
                // the lobby is full, maybe enter spectator mode?
            }
    
            io.to(lobbyID).emit('updatedGame', tttGames[lobbyID])
        })
    
        socket.on('restartGame', (lobbyID: string) => {
            tttGames[lobbyID]!.restart()
            
            io.to(lobbyID).emit('updatedGame', tttGames[lobbyID])
        })
    
        socket.on('leaveGame', ({ userID, lobbyID }) => {
            console.log(`user ${userID} left game ${lobbyID}`)
        })
    
        //////////////////////////////////////
        socket.conn.on("close", () => {
            console.log(Date.now(), "A connection was closed.")
    
            const lobbyWhichWasLeft = usersCurrentlyPlaying[socket.id]!
            const game = tttGames[lobbyWhichWasLeft]!
    
            console.log(`removing ${socket.id} from lobby ${lobbyWhichWasLeft}`)
            delete usersCurrentlyPlaying[socket.id]
    
            if (game.xID === socket.id) {
                game.xID = null
            } else if (game.oID === socket.id) {
                game.oID = null
            }  
        })
    })    
}