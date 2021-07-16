import { AppBar, IconButton, makeStyles, Toolbar, Typography } from "@material-ui/core"
import { MoreVert as MoreVertIcon } from "@material-ui/icons"
import { useRef, useState } from "react"
import Menu from "./menu"
import { smoothGradient } from "./theme"

export default function Navigation() {
	const classes = useStyles()
	const [openMenu, setOpenMenu] = useState(false)
	const menuAnchor = useRef<HTMLButtonElement>(null)

	return (
		<>
			<AppBar position="static" className={classes.appBar}>
				<Toolbar>
					<Typography
						className={classes.title}
						variant="h6"
						color="inherit">
						Wizard Online
					</Typography>

					<IconButton color="inherit" onClick={() => setOpenMenu(true)} ref={menuAnchor}>
						<MoreVertIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Menu
				open={openMenu}
				onClose={() => setOpenMenu(false)}
				anchorEl={menuAnchor.current} />
		</>
	)
}

const useStyles = makeStyles(theme => ({
	appBar: smoothGradient(theme, "30s"),
	title: {
		flexGrow: 1,
		marginLeft: theme.spacing(2)
	}
}))
