import { AppBar, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography } from "@material-ui/core"
import { Settings as SettingsIcon, Menu as MenuIcon, VideogameAsset as VideogameAssetIcon, PersonAdd as PersonAddIcon, LockOpen as LockOpenIcon, Event as EventIcon } from "@material-ui/icons"
import { useState } from "react"
import { useHistory } from "react-router-dom"
import { SettingsDialog } from "./settings"

export default function Navigation() {
	const classes = useStyles()
	const history = useHistory()
	const [openSettings, setOpenSettings] = useState(false)
	const [openDrawer, setOpenDrawer] = useState(false)

	return (
		<>
			<AppBar position="static">
				<Toolbar>
					<IconButton color="inherit" onClick={() => setOpenDrawer(true)}>
						<MenuIcon />
					</IconButton>

					<Typography
						className={classes.title}
						variant="h6"
						color="inherit">
						Wizard Online
					</Typography>
					<IconButton color="inherit" onClick={() => setOpenSettings(true)}>
						<SettingsIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
				<List className={classes.list}>
					{
						DRAWER_ACTIONS.map((action, index) =>
							action == null ? <Divider key={index} /> :
								<ListItem button key={index} onClick={() => {
									history.push(action.location)
									setOpenDrawer(false)
								}}>
									<ListItemIcon>{action.icon}</ListItemIcon>
									<ListItemText primary={action.title} />
								</ListItem>
						)
					}
				</List>
			</Drawer>

			<SettingsDialog
				open={openSettings}
				onClose={() => setOpenSettings(false)} />
		</>
	)
}

const useStyles = makeStyles(theme => ({
	title: {
		flexGrow: 1,
		marginLeft: theme.spacing(2)
	},
	list: {
		minWidth: 200
	}
}))

const DRAWER_ACTIONS = [
	{
		title: "Login",
		location: "/login",
		icon: <LockOpenIcon />
	},
	{
		title: "Registrierung",
		location: "/register",
		icon: <PersonAddIcon />
	},
	null,
	{
		title: "Game",
		location: "/lobby",
		icon: <VideogameAssetIcon />
	},
	{
		title: "Events",
		location: "/appointments",
		icon: <EventIcon />
	}
]
