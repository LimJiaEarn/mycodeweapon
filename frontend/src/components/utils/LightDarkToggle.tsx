"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Toggle } from "@/components/ui/toggle"
import { useState, useEffect } from "react"

export function LightDarkToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const [lightMode, setLightMode] = useState(theme === "light")
    
    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
        setLightMode(theme === "light")
    }, [theme])

    if (!mounted) {
        return null // Prevent rendering until client-side
    }

    return (
        <Toggle
            pressed={!lightMode}
            onPressedChange={() => {
                const newMode = !lightMode
                setLightMode(newMode)
                setTheme(newMode ? "light" : "dark")
            }}
            className="relative h-10 w-10 rounded-md border border-transparent bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
            <Sun className={`h-5 w-5 transition-all ${
                lightMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
            }`} />
            <Moon className={`absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transition-all ${
                lightMode ? '-rotate-90 scale-0' : 'rotate-0 scale-100'
            }`} />
        </Toggle>
    )
}

export default LightDarkToggle