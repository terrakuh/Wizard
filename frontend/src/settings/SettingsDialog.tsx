import React from "react"
import { AppBar, Button, Dialog, DialogContent, FormControl, FormControlLabel, IconButton, InputLabel, makeStyles, MenuItem, Paper, Select, Slide, Switch, Tab, Tabs, Toolbar, Typography } from "@material-ui/core"
import { TransitionProps } from "@material-ui/core/transitions"
import { Close as CloseIcon, Notifications as NotificationsIcon } from "@material-ui/icons"
import SwipeableViews from "react-swipeable-views"
import { useSettings } from "./SettingsProvider"

interface Props {
	open: boolean
	onClose: () => void
}

export default function SettingsDialog(props: Props) {
	const classes = useStyles()
	const { settings, setSettings } = useSettings()
	const [newSettings, setNewSettings] = React.useState(settings)
	const [index, setIndex] = React.useState(0)

	React.useEffect(() => {
		if (props.open) {
			setNewSettings(settings)
		}
	}, [settings, props.open])

	return (
		<Dialog
			TransitionComponent={Transition}
			fullScreen
			open={props.open}>
			<AppBar className={classes.appBar}>
				<Toolbar>
					<IconButton onClick={props.onClose} edge="start" color="inherit">
						<CloseIcon />
					</IconButton>
					<Typography variant="h6" className={classes.title}>Einstellungen</Typography>
					<Button
						color="inherit"
						onClick={props.onClose}>
						Abbrechen
					</Button>
					<Button
						color="inherit"
						onClick={() => {
							setSettings(newSettings)
							props.onClose()
						}}>
						Speichern
					</Button>
				</Toolbar>
			</AppBar>
			<DialogContent>
				<Paper>
					<Tabs
						centered
						onChange={(_, newIndex) => setIndex(newIndex)}
						value={index}>
						<Tab label={<NotificationsIcon />} />
					</Tabs>
				</Paper>

				<SwipeableViews>
					<div hidden={index !== 0}>
						<FormControl component="fieldset">
							<FormControlLabel
								control={
									<Switch
										onChange={(_, enabled) => setNewSettings({ ...newSettings, notifications: { ...newSettings.notifications, enabled } })}
										checked={newSettings.notifications.enabled}
										color="primary" />
								}
								label={newSettings.notifications.enabled ? "Aktiviert" : "Deaktiviert"}
								labelPlacement="start" />

							<FormControlLabel
								control={
									<Switch
										disabled={!newSettings.notifications.enabled}
										onChange={(_, audio) => setNewSettings({ ...newSettings, notifications: { ...newSettings.notifications, audio } })}
										checked={newSettings.notifications.audio}
										color="primary" />
								}
								label="Audio"
								labelPlacement="start" />

							<FormControlLabel
								control={
									<Switch
										disabled={!newSettings.notifications.enabled}
										onChange={(_, desktop) => setNewSettings({ ...newSettings, notifications: { ...newSettings.notifications, desktop } })}
										checked={newSettings.notifications.desktop}
										color="primary" />
								}
								label="Desktop Benachrichtigungen"
								labelPlacement="start" />

							<FormControlLabel
								control={
									<Switch
										disabled={!newSettings.notifications.enabled}
										onChange={(_, playerTurn) => setNewSettings({ ...newSettings, notifications: { ...newSettings.notifications, playerTurn } })}
										checked={newSettings.notifications.playerTurn}
										color="primary" />
								}
								label="Spielerzug"
								labelPlacement="start" />

							<FormControl>
								<InputLabel id="select-audio">Audio</InputLabel>
								<Select
									disabled={!newSettings.notifications.enabled || !newSettings.notifications.audio}
									value={newSettings.notifications.audioTrack}
									onChange={ev => setNewSettings({ ...newSettings, notifications: { ...newSettings.notifications, audioTrack: ev.target.value as string } })}
									labelId="select-audio">
									<MenuItem value="turn_0.mp3">Klang 1</MenuItem>
									<MenuItem value="turn_1.mp3">Klang 2</MenuItem>
									<MenuItem value="alarm.mp3">Alarm</MenuItem>
								</Select>
							</FormControl>
						</FormControl>
					</div>
				</SwipeableViews>
			</DialogContent>
		</Dialog>
	)
}

const useStyles = makeStyles({
	appBar: {
		position: "relative"
	},
	title: {
		flexGrow: 1
	}
})

const Transition = React.forwardRef(function (props: TransitionProps & { children?: React.ReactElement }, ref: React.Ref<unknown>,) {
	return <Slide direction="up" ref={ref} {...props} />
})
