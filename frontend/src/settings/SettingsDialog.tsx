import React from "react"
import { AppBar, Button, Dialog, DialogContent, IconButton, makeStyles, Paper, Slide, Tab, Tabs, Toolbar, Typography } from "@material-ui/core"
import { TransitionProps } from "@material-ui/core/transitions"
import { Close as CloseIcon, Message as MessageIcon, Notifications as NotificationsIcon, Palette as PaletteIcon, Save as SaveIcon } from "@material-ui/icons"
import { useSettings } from "./SettingsProvider"
import NotificationSettings from "./NotificationSettings"
import CommunicationSettings from "./CommunicationSettings"
import { createTheme, ThemedButton, useThemePark } from "../theme"
import ThemeSettings from "./ThemeSettings"

interface Props {
	open: boolean
	onClose: () => void
}

export default function SettingsDialog(props: Props) {
	const classes = useStyles()
	const changeTheme = useThemePark()
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
						onClick={() => {
							changeTheme(createTheme(settings.theme))
							props.onClose()
						}}>
						Abbrechen
					</Button>

					<ThemedButton
						variant="contained"
						endIcon={<SaveIcon />}
						onClick={() => {
							setSettings(newSettings)
							props.onClose()
						}}>
						Speichern
					</ThemedButton>
				</Toolbar>
			</AppBar>

			<DialogContent>
				<Paper>
					<Tabs
						centered
						onChange={(_, newIndex) => setIndex(newIndex)}
						value={index}>
						<Tab value={0} label={<NotificationsIcon />} />
						<Tab value={1} label={<MessageIcon />} />
						<Tab value={2} label={<PaletteIcon />} />
					</Tabs>
				</Paper>

				<div hidden={index !== 0}>
					<NotificationSettings
						onChange={notifications => setNewSettings({ ...newSettings, notifications })}
						settings={newSettings.notifications} />
				</div>

				<div hidden={index !== 1}>
					<CommunicationSettings
						onChange={messages => setNewSettings({ ...newSettings, messages })}
						settings={newSettings.messages} />
				</div>

				<div hidden={index !== 2}>
					<ThemeSettings
						onChange={theme => {
							setNewSettings({ ...newSettings, theme })
							changeTheme(createTheme(theme))
						}}
						settings={newSettings.theme} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

const useStyles = makeStyles(theme => ({
	appBar: {
		position: "relative",
		backgroundImage: theme.pretty.primaryGradient
	},
	title: {
		flexGrow: 1
	}
}))

const Transition = React.forwardRef(function (props: TransitionProps & { children?: React.ReactElement }, ref: React.Ref<unknown>,) {
	return <Slide direction="up" ref={ref} {...props} />
})
