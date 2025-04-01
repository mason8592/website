import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const useSocket = (serverURL = 'ws://localhost:4000') => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        const newSocket = process.env.NODE_ENV === "development" 
        ? io(serverURL) 
        : io()

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [serverURL])

    return socket!
}

export default useSocket