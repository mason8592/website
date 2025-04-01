import Koa from 'koa'
import serve from 'koa-static'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { Server } from 'socket.io'
import tttGame from './TicTacToe'
import { TicTacToeGame } from './TicTacToeTypes'

const port = process.env.PORT || 4000
const environment = process.env.NODE_ENV

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Koa()
const httpServer = createServer(app.callback())

const socketOptions = environment === "development"
    ? {cors: { 
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
    }}
    : {}

const io = new Server(httpServer, socketOptions)

type GamesObject = { [key: string]: TicTacToeGame }

const tttGames: GamesObject = {}
const usersCurrentlyPlaying: { [key: string] : string} = {}

io.on("connection", (socket) => {
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

    socket.on('restartGame', lobbyID => {
        tttGames[lobbyID].restart()
        
        io.to(lobbyID).emit('updatedGame', tttGames[lobbyID])
    })

    socket.on('leaveGame', ({ userID, lobbyID }) => {
        console.log(`user ${userID} left game ${lobbyID}`)
    })

    //////////////////////////////////////
    socket.conn.on("close", () => {
        console.log(Date.now(), "A connection was closed.")

        console.log(socket.id, "left")

        console.log(usersCurrentlyPlaying)

        if (!tttGames[usersCurrentlyPlaying[socket.id]]) return

        const game = tttGames[usersCurrentlyPlaying[socket.id]]

        console.log(`removing ${socket.id} from lobby ${usersCurrentlyPlaying[socket.id]}`)
        delete usersCurrentlyPlaying[socket.id]

        if (game.xID === socket.id) {
            game.xID = null
        } else if (game.oID === socket.id) {
            game.oID = null
        }
    })
})



// Serve static files from the dist folder
const distFolder = path.resolve(__dirname, '../../frontend/dist')
app.use(serve(distFolder))

// Catch-all route to serve index.html for React routing
if (environment === 'production') {
    app.use(async (ctx) => {
        const indexPath = path.join(distFolder, 'index.html')
        try {
            ctx.type = 'html'
            ctx.body = fs.createReadStream(indexPath)
        } catch (err) {
            ctx.status = 404
            ctx.body = 'Not Found'
        }
    })
}

httpServer.listen(port)

httpServer.on('listening', () => {
    console.log(`Koa backend running in ${environment} mode on port ${port}`)
})