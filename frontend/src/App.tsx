import { BrowserRouter, Route, Routes } from "react-router-dom"
import React, { useEffect, useState } from 'react'

type PageComponent = {
    name: string
    Component: React.ComponentType<unknown>
}

/**
 * Returns an array of objects which contain the name and Component for every page
 * @function
 */
const importAll = async (): Promise<PageComponent[]> => {
    // Import the main component from every folder in the /pages/ directory
    const matches = import.meta.glob('./pages/**/component.tsx')

    const promises = Object.entries(matches).map(async ([key, value]) => {
        const componentName = key.match(/([^/]+)\/component\.tsx$/)![1]

        const module = await value() as { default: React.ComponentType<unknown> }

        return {
            name: componentName!,
            Component: module.default,
        }
    })

    // The above map is a list of promises, so we need to await them all before returning
    return Promise.all(promises)
}

const aliases: Record<string, string[]> = {
    "tictactoe": ["ttt"],
    "test": ["tickles"],
}

function App() {
    const [pageComponents, setPageComponents] = useState<PageComponent[]>([])

    useEffect(() => {
        const loadComponents = async () => {
            const components = await importAll()
            setPageComponents(components)
        }

        loadComponents()
    }, [])


    return (
        <BrowserRouter>
            <Routes>
                // Take the list of PageComponents and maps them to a list of Routes
                {pageComponents.map(({ name, Component }, index: number) => {
                    const componentName = name.toLowerCase()

                    // First, combine the page name and its aliases into one "paths" array
                    let paths = [componentName]
                    if (aliases[componentName]) {
                        paths = [...paths, ...aliases[componentName]]
                    }

                    // Then, route every page name and alias to its corresponding component
                    return paths.map(path => (
                        <Route key={index} path={
                            path === "main" ? "/" : 
                            path === "nopage" ? "*" : 
                            path
                        } element={<Component />} />
                    ))
                })}
                
                {/* <Route path="/" element={null} />
                <Route path="*" element={null} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default App
