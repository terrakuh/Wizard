import { FormControl, FormControlLabel, Switch } from "@material-ui/core"
import { Settings } from "./types"

interface Props {
	settings: Settings["messages"]
	onChange(settings: Settings["messages"]): void
}

export default function CommunicationSettings({ settings, onChange }: Props) {
	return (
		<FormControl>
			<FormControlLabel
				control={
					<Switch
						onChange={(_, enabled) => onChange({ ...settings, signal: { ...settings.signal, enabled } })}
						checked={settings.signal.enabled}
						color="primary" />
				}
				label={settings.signal.enabled ? "Aktiviert" : "Deaktiviert"}
				labelPlacement="start" />
		</FormControl>
	)
}
