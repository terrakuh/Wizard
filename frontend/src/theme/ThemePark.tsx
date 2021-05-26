import { createMuiTheme, lighten, Theme, ThemeProvider } from "@material-ui/core"
import { createContext, ReactNode, useContext, useState } from "react"

declare module "@material-ui/core/styles/createMuiTheme" {
	interface Theme {
		pretty: {
			primaryGradient: string
		}
	}
	interface ThemeOptions extends Theme { }
}

export const createTheme = (background: string, primary: string, secondary: string) => createMuiTheme({
	palette: {
		type: "dark",
		background: {
			default: background,
			paper: lighten(background, 0.05)
		},
		primary: {
			main: primary
		},
		secondary: {
			main: secondary
		}
	},
	pretty: {
		primaryGradient: `linear-gradient(45deg, ${primary}, ${secondary})`
	}
})

const context = createContext<(theme: Theme) => void>(() => {})

interface Props {
	children?: ReactNode
}

export function ThemeParkProvider({ children }: Props) {
	const [theme, setTheme] = useState(createTheme("#242733", "#e42e50", "#a2268e"))
	// const [theme, setTheme] = useState(createTheme("#242733", "#5BB14E", "#4E5BB1"))

	return (
		<ThemeProvider theme={theme}>
			<context.Provider value={setTheme}>
				{children}
			</context.Provider>
		</ThemeProvider>
	)
}

export const useThemePark = () => useContext(context)
