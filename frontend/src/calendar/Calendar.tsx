import { useQuery } from "@apollo/client"
import { lighten, makeStyles, Typography } from "@material-ui/core"
import gql from "graphql-tag"
import { Appointment } from "../types"
import Day from "./Day"

interface Props {
	date: Date
}

export default function Calendar(props: Props) {
	const classes = useStyles()
	const { data } = useQuery<AppointmentsResult>(APPOINTMENTS)
	const daysInMonth = new Date(props.date.getFullYear(), props.date.getMonth() + 1, 0).getDate()
	const firstDayOfMonth = new Date(props.date.getFullYear(), props.date.getMonth(), 1)
	const start = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1)

	return (
		<div className={classes.root}>
			{
				ROWS.map(rid =>
					<div key={rid} className={classes.row}>
						{
							CELLS.map((dom, cid) =>
								<div key={cid} className={classes.cell}>
									<Typography color="textPrimary" variant="body2" align="center">
										{rid === 0 ? <>{dom}<br /></> : null}
										{new Date(start.getFullYear(), start.getMonth(), start.getDate() + rid * CELLS.length + cid).getDate()}
									</Typography>
									{
										isSameDay(props.date, new Date(start.getFullYear(), start.getMonth(), start.getDate() + rid * CELLS.length + cid)) ?
											<div className={classes.entry}>
												Wizard!!!
											</div> : null
									}
								</div>
							)
						}
					</div>
				)
			}
		</div >
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%"
	},
	row: {
		display: "flex",
		flexDirection: "row",
		flexGrow: 1
	},
	cell: {
		flexGrow: 1,
		flexBasis: 0,
		display: "flex",
		flexDirection: "column",
		borderRight: "solid 1px",
		borderTop: "solid 1px",
		borderRightColor: lighten(theme.palette.background.default, 0.5),
		borderTopColor: lighten(theme.palette.background.default, 0.5),
		"&:hover": {
			backgroundColor: lighten(theme.palette.background.default, 0.2)
		}
	},
	cellTitle: {
		textAlign: "center"
	},
	entry: {
		backgroundColor: theme.palette.primary.main,
		borderRadius: 4,
		margin: theme.spacing(1),
		padding: theme.spacing(0.5),
		textOverflow: ""
	}
}))

interface AppointmentsResult {
	appointments: Appointment[]
}

const APPOINTMENTS = gql`
	query {
		appointments {
			id
			start
			end
			user {
				id
				name
			}
		}
	}
`

function isSameDay(a: Date, b: Date) {
	return !Math.floor(Math.abs(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 1000 / 60 / 60 / 24)
}

const ROWS = [0, 1, 2, 3, 4, 5]
const CELLS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"]
