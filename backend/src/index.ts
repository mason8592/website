import Koa from 'koa'
import serve from 'koa-static'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupTttServer } from './TicTacToe/socketLogic'

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

setupTttServer(io)

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