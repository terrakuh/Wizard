import { Theme } from "@material-ui/core"
import "./global.css"

export const smoothGradient = (theme: Theme, duration: string) => ({
	backgroundImage: theme.pretty.primaryGradient,
	backgroundSize: "200% 100%",
	"&:not(.Mui-disabled)": {
		animation: `Wizard-shakenNotStirred ${duration} ease infinite`
	}
})
