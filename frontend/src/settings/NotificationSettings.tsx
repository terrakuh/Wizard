import React from "react"
import { FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, Switch } from "@material-ui/core"
import { Settings, AudioTrack, notificationSpriteMap } from "./types"

interface Props {
	settings: Settings["notifications"]
	onChange(settings: Settings["notifications"]): void
}

export default function NotificationSettings({ settings, onChange }: Props) {
	return (
		<FormControl component="fieldset">
			<FormControlLabel
				control={
					<Switch
						onChange={(_, enabled) => onChange({ ...settings, enabled })}
						checked={settings.enabled}
						color="primary" />
				}
				label={settings.enabled ? "Aktiviert" : "Deaktiviert"}
				labelPlacement="start" />

			<FormControlLabel
				control={
					<Switch
						disabled={!settings.enabled}
						onChange={(_, audio) => onChange({ ...settings, audio })}
						checked={settings.audio}
						color="primary" />
				}
				label="Audio"
				labelPlacement="start" />

			<FormControlLabel
				control={
					<Switch
						disabled={!settings.enabled}
						onChange={(_, desktop) => onChange({ ...settings, desktop })}
						checked={settings.desktop}
						color="primary" />
				}
				label="Desktop-Benachrichtigungen"
				labelPlacement="start" />

			<FormControlLabel
				control={
					<Switch
						disabled={!settings.enabled}
						onChange={(_, playerTurn) => onChange({ ...settings, playerTurn })}
						checked={settings.playerTurn}
						color="primary" />
				}
				label="Spielerzug"
				labelPlacement="start" />

			<FormControl>
				<InputLabel id="select-audio">Audio</InputLabel>
				<Select
					disabled={!settings.enabled || !settings.audio || settings.desktop}
					value={settings.audioTrack}
					onChange={ev => onChange({ ...settings, audioTrack: ev.target.value as AudioTrack })}
					labelId="select-audio">
					{
						Object.keys(notificationSpriteMap).map(track =>
							<MenuItem key={track} value={track}>{track}</MenuItem>
						)
					}
				</Select>
				<FormHelperText>Benutzerdefinierte Töne funktionieren nur mit den eingebauten Benachrichtigungen und nicht mit Desktop-Benachrichtigungen.</FormHelperText>
			</FormControl>
		</FormControl>
	)
}
