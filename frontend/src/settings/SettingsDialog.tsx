import React from "react"
import { AppBar, Button, createStyles, Dialog, DialogContent, FormControl, FormControlLabel, IconButton, Paper, Slide, Switch, Tab, Tabs, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core"
import { TransitionProps } from "@material-ui/core/transitions"
import { Close as CloseIcon } from "@material-ui/icons"
import SwipeableViews from "react-swipeable-views"
import { useSettings } from "./SettingsProvider"

interface Props extends WithStyles<typeof styles> {
	open: boolean
	onClose: () => void
}

function SettingsDialog(props: Props) {
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
			<AppBar className={props.classes.appBar}>
				<Toolbar>
					<IconButton edge="start" color="inherit">
						<CloseIcon />
					</IconButton>
					<Typography variant="h6" className={props.classes.title}>Einstellungen</Typography>
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
						<Tab label="Benachrichtungen" />
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
								label="Enabled"
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
						</FormControl>
					</div>
				</SwipeableViews>
			</DialogContent>
		</Dialog>
	)
}

const styles = createStyles({
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

export default withStyles(styles)(SettingsDialog)
