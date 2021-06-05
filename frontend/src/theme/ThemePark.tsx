import { createMuiTheme, lighten, ThemeProvider } from "@material-ui/core"
import { ReactNode, useEffect, useState } from "react"
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

interface ThemeOptions {
	background: string
	primary: string
	secondary: string
}

const createTheme = ({ background, primary, secondary }: ThemeOptions) => createMuiTheme({
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

export type Scheme = "dark" | "light"

const darkTheme = createTheme({
	background: "#242733",
	primary: "#e42e50",
	secondary: "#a2268e"
})
const lightTheme = createTheme({
	background: "#fafafa",
	primary: "#90caf9",
	secondary: "#f48fb1"
})

interface Props {
	children?: ReactNode
}

export function ThemeParkProvider({ children }: Props) {
	const { settings } = useSettings()
	const [scheme, setScheme] = useState<Scheme>(settings.theme)

	useEffect(() => setScheme(settings.theme), [settings.theme])

	return (
		<ThemeProvider theme={scheme === "dark" ? darkTheme : lightTheme}>
			{children}
		</ThemeProvider>
	)
}
