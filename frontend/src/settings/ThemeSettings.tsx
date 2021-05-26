import { FormControl, FormControlLabel } from "@material-ui/core"
import { Settings } from "./types"
import { ColorPicker, createColor } from "material-ui-color"
import { ThemedButton } from "../theme"
import { defaultSettings } from "./SettingsProvider"

interface Props {
	settings: Settings["theme"]
	onChange(settings: Settings["theme"]): void
}

export default function ThemeSettings({ settings, onChange }: Props) {
	return (
		<FormControl component="fieldset">
			<FormControlLabel
				label="Hintergrund"
				labelPlacement="start"
				control={
					<ColorPicker
						disableAlpha
						value={createColor(settings.background)}
						onChange={color => onChange({ ...settings, background: "#" + color.hex })} />
				} />

			<FormControlLabel
				label="Primär"
				labelPlacement="start"
				control={
					<ColorPicker
						disableAlpha
						value={createColor(settings.primary)}
						onChange={color => onChange({ ...settings, primary: "#" + color.hex })} />
				} />

			<FormControlLabel
				label="Sekundär"
				labelPlacement="start"
				control={
					<ColorPicker
						disableAlpha
						value={createColor(settings.secondary)}
						onChange={color => onChange({ ...settings, secondary: "#" + color.hex })} />
				} />

			<ThemedButton
				onClick={() => onChange(defaultSettings.theme)}
				variant="contained">
				Reset
			</ThemedButton>
		</FormControl>
	)
}
