import React from "react"
import { deepMerge } from "../util"
import Settings from "./type"

const initialSettings = deepMerge<Settings>({
	notifications: {
		enabled: true,
		audio: true,
		audioTrack: "turn_0.mp3",
		desktop: true,
		playerTurn: true
	}
}, JSON.parse(localStorage.getItem("settings") || "{}"))

const context = React.createContext<{
	settings: Settings
	setSettings: (settings: Settings) => void
}>({ settings: initialSettings, setSettings(_) { } })

interface Props {
	children: React.ReactNode
}

function SettingsProvider(props: Props) {
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
export default SettingsProvider
