import { Button, withStyles } from "@material-ui/core"
import { smoothGradient } from "./styles"

export const ThemedButton = withStyles(theme => ({
	root: {
		...smoothGradient(theme, "5s"),
		color: theme.palette.text.primary
	}
}))(Button)
