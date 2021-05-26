import { AppBar, Divider, Drawer, IconButton, Link, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography } from "@material-ui/core"
import { Settings as SettingsIcon, Menu as MenuIcon, VideogameAsset as VideogameAssetIcon, PersonAdd as PersonAddIcon, LockOpen as LockOpenIcon, Event as EventIcon } from "@material-ui/icons"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { SettingsDialog } from "./settings"
import { smoothGradient } from "./theme"

export default function Navigation() {
	const classes = useStyles()
	const history = useHistory()
	const [openSettings, setOpenSettings] = useState(false)
	const [openDrawer, setOpenDrawer] = useState(false)
	const [version, setVersion] = useState<string>()

	useEffect(() => {
		fetch("/VERSION.txt")
			.then(resp => {
				if (resp.status !== 200 || !resp.headers.get("content-type")?.startsWith("text/plain")) {
					throw Error()
				}
				return resp.text()
			})
			.then(setVersion)
			.catch(() => { })
	}, [])

	return (
		<>
			<AppBar position="static" className={classes.appBar}>
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
					<ListItem className={classes.headerInformation}>
						<Typography variant="h5">
							<Link
								target="_blank"
								rel="noreferrer"
								href="https://github.com/terrakuh/wizard">
								Wizard
							</Link>
						</Typography>
						{
							version == null ? null :
								<Typography variant="body2">{version}</Typography>
						}
					</ListItem>

					<Divider className={classes.divider} />

					{
						DRAWER_ACTIONS.map((action, index) =>
							action == null ? <Divider key={index} className={classes.divider} /> :
								<ListItem
									button
									key={index}
									selected={history.location.pathname === action.location}
									onClick={() => {
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
	appBar: smoothGradient(theme, "30s"),
	headerInformation: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: theme.spacing(2)
	},
	divider: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1)
	},
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
		title: "Kalendar",
		location: "/calendar",
		icon: <EventIcon />
	}
]
