import React from "react"
import { useSnackbar, WithSnackbarProps } from "notistack"
import { Settings } from "../settings"
import useSound from "use-sound"
import { PlayFunction } from "use-sound/dist/types"

interface Props {
	settings: Settings
	setSettings: (settings: Settings) => void
	playerTurn?: string | null
}

export default function useTurnSound({ settings, ...props }: Props) {
	const {enqueueSnackbar, closeSnackbar} = useSnackbar()
	const [id, setID] = React.useState(0)
	const playSound: Map<string, PlayFunction> = new Map()
	playSound.set("turn_0.mp3", useSound("/turn_0.mp3")[0])
	playSound.set("turn_1.mp3", useSound("/turn_1.mp3")[0])
	playSound.set("alarm.mp3", useSound("/alarm.mp3")[0])

	React.useEffect(() => {
		if (settings.notifications.enabled && settings.notifications.playerTurn) {
			if (props.playerTurn === localStorage.getItem("name")) {
				if (settings.notifications.desktop) {
					Notification.requestPermission()
						.then(() => {
							new Notification("Wizard", {
								body: "Du bist am Zug.",
								silent: !settings.notifications.audio
							})
						})
						.catch(() => props.setSettings({ ...settings, notifications: { ...settings.notifications, desktop: false } }))
				} else {
					const playID = id
					setID(id+1)
					enqueueSnackbar("Your turn.", {
						autoHideDuration: null,
						variant: "info",
						key: `player-turn-${playID}`
					})
					if (settings.notifications.audio) {
						const play = playSound.get(settings.notifications.audioTrack)
						if (play !== undefined) {
							play()
						}
					}
					return () => closeSnackbar(`player-turn-${playID}`)
				}
			}
		}
	}, [props.playerTurn, settings.notifications, enqueueSnackbar])
}
