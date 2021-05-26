import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { deepMerge } from "../util"
import { Settings } from "./types"

interface Context {
	settings: Settings
	setSettings(settings: Settings): void
}

export const defaultSettings: Settings = {
	notifications: {
		enabled: true,
		audio: true,
		audioTrack: "Klang 1",
		desktop: true,
		playerTurn: true
	},
	messages: {
		signal: {
			enabled: false,
			number: ""
		}
	},
	theme: {
		background: "#242733",
		primary: "#e42e50",
		secondary: "#a2268e"
	}
}

const initialSettings = deepMerge<Settings>(defaultSettings, JSON.parse(localStorage.getItem("settings") || "{}"))

const context = createContext<Context>({
	settings: initialSettings,
	setSettings(_) { }
})

interface Props {
	children: ReactNode
}

export default function SettingsProvider(props: Props) {
	const [settings, setSettings] = useState<Settings>(initialSettings)

	useEffect(() => {
		localStorage.setItem("settings", JSON.stringify(settings))
	}, [settings])

	return (
		<context.Provider value={{ settings, setSettings }}>
			{props.children}
		</context.Provider>
	)
}

export const useSettings = () => useContext(context)
