import { useState, useEffect, memo } from "react"
import { useLocation, useNavigate} from 'react-router-dom'
import styles from "./TicTacToe.module.css"
import useSocket from '../../hooks/useSocket'

type TicTacToeGame = {
    board: Array<null | "X" | "O">,
    turnNumber: number,
    currentPlayer: "X" | "O",
    xID: string,
    oID: string,
    gameState: string,
    placeholder?: boolean
}

const placeHolderBoard = {
    board: Array(9).fill(null),
    turnNumber: 0,
    currentPlayer: "X" as const,
    xID: "xid",
    oID: "oid",
    gameState: 'active',
    placeholder: true
}

const TicTacToe: React.FC = () => {
    const socket = useSocket()

    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const lobbyID = queryParams.get('id') || [...crypto.getRandomValues(new Uint8Array(3))].map(m=>('0'+m.toString(16)).slice(-2)).join('')

    useEffect(() => {
        if (!location.search.endsWith(lobbyID)) {
            navigate(`${location.pathname}?id=${lobbyID}`, { replace: true })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [tttGame, setTttGame] = useState<TicTacToeGame>(placeHolderBoard)
    const [message, setMessage] = useState('')
    const [whoAmI, setWhoAmI] = useState<"X" | "O" | "spectator" | undefined>(undefined)

    useEffect(() => {
        if (!socket) return

        socket.on('connect', () => {
            socket.emit('tttJoinRoom', { lobbyID: lobbyID, userID: socket.id })
        })

        socket.on('updatedGame', (game: TicTacToeGame) => {
            if (!whoAmI) setWhoAmI(determineWhoAmI(game.xID, game.oID, socket.id!))
            
            setTttGame(game)

            const currentWhoAmI = whoAmI || determineWhoAmI(game.xID, game.oID, socket.id!)

            if (game.gameState !== 'active') {
                return setWinner(game, currentWhoAmI)
            } else {
                console.log(`you are ${currentWhoAmI} | X: ${game.xID}, O: ${game.oID}, you: ${socket.id}`)
                if (game.gameState === "active") setMessage(
                    `${game.currentPlayer === currentWhoAmI ? 'Your' : game.currentPlayer + "'s"} turn`
                )
            }
        })

        socket.on('disconnect', () => {
            socket.emit('leaveGame', { userID: socket.id, lobbyID: lobbyID })
        })
    }, [socket, lobbyID, whoAmI])

    const handleClick = (index: number) => {
        socket.emit('click', { index, lobbyID, whoAmI })
    }

    const restartGame = () => {
        socket.emit('restartGame', lobbyID)
    }
    
    const setWinner = (game: TicTacToeGame, currentWhoAmI: "X" | "O" | "spectator") => {
        console.log(`setting winner. winner is ${game.gameState} and you are ${currentWhoAmI}`)
        if (game.gameState === "draw") {
            setMessage('Draw\n[click to restart]')
        } else if (game.gameState === currentWhoAmI) {
            setMessage('You win!\n[click to restart]')
        } else {
            setMessage(`${currentWhoAmI === "X" ? "O" : "X"} wins - better luck next time!\n[click to restart]`)
        }
    }

    const determineWhoAmI = (xID: TicTacToeGame["xID"], oID: TicTacToeGame["oID"], me: string) => {
        if (xID === me) {
            return "X"
        } else if (oID === me) {
            return "O"
        } else {
            return 'spectator'
        }
    }

    return <div className={styles.ttt_page}>
        <div className={styles.ttt_container}>

            <div className={styles.ttt_board} >
                {tttGame.board.map((value, index) => (
                    <TicTacToeSpace key={index} value={value!} onClick={() => handleClick(index)}/>
                ))}
            </div>

            <div className={`${styles.messageboard} ${tttGame.gameState !== 'active' ? styles.retry : ''}`} onClick={tttGame.gameState === 'active' ? () => {} : restartGame }>
                {message}
            </div>

        </div>
    </div>
}

const TicTacToeSpace = memo(({ value, onClick }: {value: "X" | "O", onClick: React.MouseEventHandler}) => (
    <div className={styles.ttt_cell} onClick={onClick}>
        {value}
    </div>
))

export default TicTacToe