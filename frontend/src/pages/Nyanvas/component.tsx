import React, { useEffect, useState, useRef, forwardRef, useCallback, createContext, useContext } from "react"
import styles from "./Nyanvas.module.css"

interface ImageObject {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function Nyanvas() {
	const [settingsActive, setSettingsActive] = useState(false)
    const [messages, setMessages] = useState<React.JSX.Element[]>([])
    const [, setCurrentIndex] = useState(0)
    const isDrawing = useRef(false)
    const isErasing = useRef(false)
    const drawingIsToggled = useRef(false)
    const superEraserMode = useRef(true)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const imageRef = useRef<HTMLImageElement>(new Image())
    const brushSize = useRef(100)
    const [images, setImages] = useState<ImageObject[]>([])
    const imagesRef = useRef(images)

    const imageList = ['femboy_pfp.png', 'tempoaerial.jpg']
    const [imageSrc, setImageSrc] = useState(imageList[0])

    useEffect(() => {
        imagesRef.current = images
    }, [images])

    // Welcome message
    useEffect(() => {
        displayMessage('welcome to nyanvas! press Shift to open settings!')
    }, [])







    ///////////////////////
    // GENERAL FUNCTIONS //
    ///////////////////////

    /**
     * Displays a message in the message box in the top left corner of the screen
     * @param messageText The message to display
     */
    const displayMessage = (messageText: string) => {
        let message: JSX.Element
        
        setCurrentIndex((prevState) => {
            message = <Message message={messageText} key={prevState}/>

            return prevState += 1
        })

        setTimeout(() => {
            setMessages((prevState) => {
                const temp = Array.from(prevState)
                temp.pop()
                return temp
            })
        }, 4000)

        setMessages((prevState) => [message, ...prevState])
    }

    /**
     * Draws an image on the canvas
     * 
     * @param context The canvas to draw on
     * @param src The URL of the image to be drawn
     * @param x The x coordinate to draw it at
     * @param y The y coordinate to draw it at
     * @param width The normalized width the image should be. This number should already have taken brushSize into account
     * @param height The normalized height the image should be. This number should already have taken brushSize into account
     */
    const drawImage = (context: CanvasRenderingContext2D, src: string, x: number, y: number, width: number, height: number) => {
        if (!imageRef.current) return

        const imageToDraw = imageRef.current
        imageToDraw.src = src

        context.drawImage(imageToDraw, x - width / 2, y - height / 2, width, height)
    }

    /**
     * Redraws a canvas using the data stored in imageRefs.current
     * @param canvas The canvas to redraw
     */
    const redrawCanvas = useCallback((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d')
        if (!context) return

        context.clearRect(0, 0, canvas.width, canvas.height)

        imagesRef.current.forEach(img => drawImage(context, img.src, img.x, img.y, img.width, img.height))
    }, [])

    /**
     * Adds an image to the canvas and to the list of images
     * @param x The x coordinate of the center of the image
     * @param y The y coordinate of the center of the image
     * @param naturalWidth The natural width of the image, before being resized to match the brush size
     * @param naturalHeight The natural height of the image, before being resized to match the brush size
     */
    const addImage = useCallback((context: CanvasRenderingContext2D, x: number, y: number, naturalWidth: number, naturalHeight: number) => {
        let height: number
        let width: number
        
        if (naturalHeight <= naturalWidth) {
            width = brushSize.current
            height = brushSize.current * (1 / (naturalWidth / naturalHeight))
        } else {
            width = brushSize.current * (1 / (naturalHeight / naturalWidth))
            height = brushSize.current
        }

        drawImage(context, imageRef.current.src, x, y, width, height)

        setImages(prevImages => [...prevImages, { src: imageRef.current.src, x, y, width, height }])
    }, [])
    











    /////////////////////
    // useEffect HOOKS //
    /////////////////////

    // Load image for use in canvas
    useEffect(() => {
        console.log(`loading image useEffect`)
        const image = imageRef.current

        if (image) {
            console.log(`setting image from ${image.src} to ${imageSrc}`)
            image.src = imageSrc
            image.onload = () => {
                displayMessage(`loaded ${imageSrc}`)
                console.log(`loaded ${imageSrc}`)
                image.onload = null
            }    
        }

        return () => {
            image.onload = null
        }
    }, [imageSrc])


    // Handles state for image addition and removal, as well as drawing for images. 
    // Doesn't handle actual re-rendering for erased images
    useEffect(() => {
        console.log('set state useEffect, no image drawn yet')

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        // Handles code for drawing (including erasing) for both clicking and moving AND just clicking
        const handleDrawing = (x: number, y: number) => {
            if (settingsActive) return

            const rect = canvas.getBoundingClientRect()

            if (isErasing.current) {
                removeImage(x - rect.left, y - rect.top)
            } else {
                addImage(context, x - rect.left, y - rect.top, imageRef.current.naturalWidth, imageRef.current.naturalHeight)
            }
        }


        const removeImage = (x: number, y: number) => {
            if (!context) return console.log("no contxt!!!")

            // Remove identified images
            setImages(prevImages => { 
                const toRemove = prevImages.filter(img => {
                    return (
                        x >= img.x - img.width / 2 &&
                        x <= img.x + img.width / 2 &&
                        y >= img.y - img.height / 2 &&
                        y <= img.y + img.height / 2
                    )
                })        

                if (superEraserMode.current) { 
                    return prevImages.filter(img => !toRemove.includes(img))
                } else {
                    return prevImages.filter(img => img !== toRemove[toRemove.length - 1])
                }
            })
        }

        const handleMouseDown = (event: MouseEvent) => {
            // If left button is being held
            if (event.button === 0) {
                isDrawing.current = true
                handleDrawing(event.clientX, event.clientY)
            }
        }

        const handleMouseUp = (event: MouseEvent) => {
            if (event.button === 0) {
                isDrawing.current = false
            }
        }

        const handleMouseMove = (event: MouseEvent) => {
            // If left button is being held
            if (event.buttons === 1 || drawingIsToggled.current) {
                if (!superEraserMode.current && isErasing.current) return

                handleDrawing(event.x, event.y)   
            }
        }

        document.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)    
        }
        // Needs the current value of settingsActive to determine whether to ignore inputs or not
        // Not a performance worry
    }, [settingsActive, addImage])


    // Handle visually ERASING when necessary
    useEffect(() => {
        if (!isErasing.current) return

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        // Redraw on state change
        redrawCanvas(canvas)
    }, [images, redrawCanvas])


    // Handler for keypresses
    useEffect(() => {
        console.log('initializing keyPress handlers')
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const clearCanvas = () => {
            context.clearRect(0, 0, canvas.width, canvas.height)
            setImages([])
        }    

        const handleKeyPress = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase()

            if (key === 'shift') {
                setSettingsActive(prev => !prev)
            }

            if (settingsActive) return
 
            if (key === 'e') {
                displayMessage(isErasing.current ? 'erasing mode: off' : 'erasing mode: on')
                isErasing.current = !isErasing.current
            } else if (key === 'c') {
                displayMessage('clearing canvas')
                clearCanvas()
            } else if (key === '-') {
                displayMessage(`changing brush size to ${brushSize.current - 3}`)
                brushSize.current -= 3
            } else if (key === '=') {
                displayMessage(`changing brush size to ${brushSize.current + 3}`)
                brushSize.current += 3
            } else if (key === 't') {
                displayMessage(`toggling automatic drawing to ${drawingIsToggled.current ? 'false' : 'true'}`)
                drawingIsToggled.current = !drawingIsToggled.current
            } else if (key === 'x') {
                console.log("X PRESSED!")
                setImageSrc(prev => {
                    const newImage = prev === 'femboy_pfp.png' ? 'tempoaerial.jpg' : 'femboy_pfp.png'
                    displayMessage(`switching image to ${newImage}`)
                    return newImage
                })
            } else if (key === 's') {
                displayMessage(`turned super erase mode ${superEraserMode.current ? 'off' : 'on'}`)
                superEraserMode.current = !superEraserMode.current
            }
        }
        
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [settingsActive])

    // Handler for resizes
    useEffect(() => {
        console.log('setting canvas size to', window.innerWidth, window.innerHeight)
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            redrawCanvas(canvas)
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [redrawCanvas])


















    ////////////////
    // RETURN JSX //
    ////////////////

	return <div id="nyanvas" className={styles.nyanvas}>
		{ settingsActive ? <Settings imageList={imageList} /> : null }
		<Logo />
        <ControlPanel buttons={[
            ['E', isErasing.current]
        ]}/>
		<MessageBox messages={messages}/>
		<Canvas ref={canvasRef} />
	</div>
}



















/////////////////////
// MAIN COMPONENTS //
/////////////////////

const Canvas = forwardRef<HTMLCanvasElement>((_, ref) => {
    return (
        <canvas
            ref={ref}
        ></canvas>
    )
})

const MessageBox = (props: {messages: JSX.Element[]}) => {
	return <div id="message-box" className={styles.messageBox}>
        {props.messages}
    </div>
}

const Message = ({ message }: { message: string }) => {
	return <h1 className={styles.fadingMessage}>{message}</h1>
}

const Logo = () => {
	return <div className={styles.nyanvasLogo}>
		<h1 style={{color: "#002883"}} className={`${styles.nyanvasText} ${styles.nyanColors}`}>
			NYAN
		</h1>
		<h1 style={{color: "#ffffff"}} className={styles.nyanvasText}>
			VAS
		</h1>
	</div>
}

const ControlPanel = ({ buttons }: { buttons: [string, any, any?][] } ) => {
    return (
        <div className={styles.controlPanel}>
            <ControlButton button="A" />
        </div>
    )
}

const ControlButton = ({ button }: { button: string }) => {
    return (
        <div className={styles.controlButton}>
            {button}
        </div>
    )
}






///////////////////
// SETTINGS PAGE //
///////////////////

const Settings = ({ imageList }: { imageList: string[] }) => {
	return <div id='settings-container' className={styles.settingsContainer}>
        <div id='settings-menu' style={{zIndex: 999999}} className={styles.settingsMenu}>
            <ControlsList />
            <BrushSizeSlider />
            <ImageSelector imageList={imageList} />
            <ImageAdder />
        </div>
    </div>
}

const ControlsList = () => {
    return <div className={`${styles.controlsList} ${styles.setting}`}>
        <h1 className={styles.settingsText}>e - toggle </h1>
    </div>
}

const BrushSizeSlider = () => {
    return <div className={`${styles.brushSizeSliderContainer} ${styles.setting}`}>
        <input type="range" min="1" max="500" className={styles.brushSizeSlider}></input>
    </div>
}

const ImageSelector = ({ imageList }: { imageList: string[] }) => {
    return <div className={`${styles.imageSelector} ${styles.setting}`}>
        {imageList.map(image => {
            return <div className={styles.imageListDisplay}>
                <h1>image: {image}</h1>
                <img src={image} className={styles.imageListImage}></img>
            </div>
        })}
    </div>
}

const ImageAdder = () => {
    return <div>
        <input type="text"></input>
        <input type="button" value="Add Image"></input>
    </div>
}