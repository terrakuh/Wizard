import React from "react"
import { deepMerge } from "../util"
import { Settings } from "./types"

interface Context {
	settings: Settings
	setSettings(settings: Settings): void
}

const initialSettings = deepMerge<Settings>({
	notifications: {
		enabled: true,
		audio: true,
		audioTrack: "turn_0.mp3",
		desktop: true,
		playerTurn: true
	}
}, JSON.parse(localStorage.getItem("settings") || "{}"))

const context = React.createContext<Context>({
	settings: initialSettings,
	setSettings(_) { }
})

interface Props {
	children: React.ReactNode
}

export default function SettingsProvider(props: Props) {
	const [settings, setSettings] = React.useState<Settings>(initialSettings)

	React.useEffect(() => {
		localStorage.setItem("settings", JSON.stringify(settings))
	}, [settings])

	return (
		<context.Provider value={{ settings, setSettings }}>
			{props.children}
		</context.Provider>
	)
}

export const useSettings = () => React.useContext(context)
