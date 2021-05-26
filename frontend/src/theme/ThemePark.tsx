import { createMuiTheme, lighten, Theme, ThemeProvider } from "@material-ui/core"
import { createContext, ReactNode, useContext, useState } from "react"
import { useSettings } from "../settings";

declare module "@material-ui/core/styles/createMuiTheme" {
	interface Theme {
		pretty: {
			primaryGradient: string
		}
	}
	interface ThemeOptions extends Theme { }
}

function isLight(color: string) {
	const hex = color.replace('#', '');
	const c_r = parseInt(hex.substr(0, 2), 16);
	const c_g = parseInt(hex.substr(2, 2), 16);
	const c_b = parseInt(hex.substr(4, 2), 16);
	const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
	return brightness > 155;
}

export interface ThemeOptions {
	background: string
	primary: string
	secondary: string
}

export const createTheme = ({ background, primary, secondary }: ThemeOptions) => createMuiTheme({
	palette: {
		type: isLight(background) ? "light" : "dark",
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

const context = createContext<(theme: Theme) => void>(() => { })

interface Props {
	children?: ReactNode
}

export function ThemeParkProvider({ children }: Props) {
	const { settings } = useSettings()
	const [theme, setTheme] = useState(createTheme(settings.theme))

	return (
		<ThemeProvider theme={theme}>
			<context.Provider value={setTheme}>
				{children}
			</context.Provider>
		</ThemeProvider>
	)
}

export const useThemePark = () => useContext(context)
