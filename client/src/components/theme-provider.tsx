import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'primesoft'

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'ui-theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    // If saved theme is primesoft, default to light for better UX
    if (savedTheme === 'primesoft') {
      return 'light';
    }
    return savedTheme || defaultTheme;
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'primesoft-theme')
    
    // Add the current theme class
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'primesoft') {
      root.classList.add('primesoft-theme')
    }
    // Light theme doesn't need a class as it's the default
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}