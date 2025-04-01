import { useEffect, useRef, useState } from "react"
import useWindowDimensions from "../../hooks/useWindowDimensions"
import { createContext } from "vm"

const getRand = (num: number) => {
    return Math.random() * num
}

const getRandHex = () => {
    return (Math.floor(Math.random() * 255)).toString(16).padStart(2, "0")
}

const getRandColor = () => {
    const hex = `#${getRandHex()}${getRandHex()}${getRandHex()}`
    console.log(hex)
    return hex
}

type Shape = {
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
}

// TODO: MAKE SHAPE A CLASS INSTEAD? give it functions to move it and stuff, so i can just run shape.moveX(5) or something

const createShape = (x: number, y: number, width: number, height: number, color: string) => {
    return { x, y, width, height, color } as Shape
}

const RenderTest = () => {
    const canvasRef = useRef(null)
    const { width, height } = useWindowDimensions()
    const masonSquare = createShape(500, 500, 500, 500, '#0090ff')
    const [shapes, setShapes] = useState([masonSquare])

    const drawShape = ({ x, y, width, height, color }: Shape) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, height)
    }

    const drawCanvas = () => {
        clearCanvas()
        shapes.forEach(shape => {
            drawShape(shape)
        })
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const moveShape = (e: MouseEvent) => {
        setShapes(prev => {
            prev.shift()
            return [...prev, createShape(e.clientX * 3, e.clientY * 3, 100, 100, '#0090ff')]
        })
    }

    // Track square to mouse cursor
    useEffect(() => {
        document.getElementById('canvas')!.addEventListener('mousemove', moveShape)

        return () => document.getElementById('canvas')!.removeEventListener('mousemove', moveShape)
    }, [])

    useEffect(() => {
        drawCanvas()
    }, [shapes])

    return (
        <div id='container' style={{width: '100vw', height: '100vh', backgroundColor: '#222222'}}>
            <canvas ref={canvasRef} id='canvas' width={3840} height={2160} style={{backgroundColor: 'black', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: 16/9}}></canvas>
        </div>
    )
}

export default RenderTest