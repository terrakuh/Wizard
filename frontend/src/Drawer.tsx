import React from "react"
import { Box, createStyles, Divider, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer, Typography, withStyles, WithStyles } from "@material-ui/core"
import { Gamepad as GamepadIcon, VideogameAsset as VideogameAssetIcon } from "@material-ui/icons"
import { RouteComponentProps, withRouter } from "react-router-dom"

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
	open: boolean
	setOpen: (open: boolean) => void
}

function Drawer(props: Props) {
	return (
		<SwipeableDrawer
			open={props.open}
			onOpen={() => props.setOpen(true)}
			onClose={() => props.setOpen(false)}>
			<List className={props.classes.list}>
				<ListItem
					button
					onClick={() => {
						props.history.push("/create")
						props.setOpen(false)
					}}>
					<ListItemIcon><GamepadIcon /></ListItemIcon>
					<ListItemText>Create Lobby</ListItemText>
				</ListItem>

				<ListItem
					button
					onClick={() => {
						props.history.push("/join")
						props.setOpen(false)
					}}>
					<ListItemIcon><VideogameAssetIcon /></ListItemIcon>
					<ListItemText>Join Lobby</ListItemText>
				</ListItem>

				<Box flexGrow={1} />

				<Divider />
				<ListItem>
					<Typography
						style={{ width: "100%" }}
						align="center"
						variant="body2"
						color="textSecondary">
						Version v0.0.0<br />
						Made with ❤️
					</Typography>
				</ListItem>
			</List>
		</SwipeableDrawer>
	)
}

const styles = createStyles({
	list: {
		height: "100%",
		display: "flex",
		flexDirection: "column"
	}
})

export default withStyles(styles)(withRouter(Drawer))
