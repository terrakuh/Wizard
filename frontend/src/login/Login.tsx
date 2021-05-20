import React from "react"
import { Button, makeStyles, Paper, TextField } from "@material-ui/core"
import gql from "graphql-tag"
import { useLazyQuery, useMutation } from "@apollo/client"
import { Loading } from "../util"
import CryptoJS from "crypto-js"
import { useSnackbar } from "notistack"
import { generatePasswordHash } from "../util/security"
import { useHistory } from "react-router"

export default function Login() {
	const classes = useStyles()
	const history = useHistory()
	const { enqueueSnackbar } = useSnackbar()
	const [loggingIn, setLogginIn] = React.useState(false)
	const [name, setName] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [login] = useMutation(LOGIN)
	const [fetchLoginInformation, { loading }] = useLazyQuery<GetLoginInformation>(GET_LOGIN_INFORMATION, {
		onCompleted(data) {
			setLogginIn(true)
			let passwordHash: string
			try {
				passwordHash = generatePasswordHash(password, CryptoJS.enc.Base64.parse(data.loginInformation.salt), data.loginInformation.hashType)
			} catch (err) {
				setLogginIn(false)
				enqueueSnackbar(err, { variant: "error" })
				return
			}

			login({ variables: { name, passwordHash } })
				.then(() => enqueueSnackbar("Erfolgreich eingeloggt", { variant: "success" }))
				.then(() => history.push("/"))
				.catch(err => enqueueSnackbar(`Login fehlgeschlagen: ${err}`, { variant: "error" }))
				.finally(() => setLogginIn(false))
		},
		onError(err) {
			console.error(err)
			enqueueSnackbar("Login Informationen sind nicht verfügbar.", { variant: "error" })
		}
	})

	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
				<Loading loading={loading || loggingIn} />

				<TextField
					label="Benutzer"
					value={name}
					onChange={ev => setName(ev.target.value)}
					fullWidth />

				<TextField
					label="Passwort"
					value={password}
					type="password"
					onKeyPress={ev => {
						if (ev.key === "Enter") {
							fetchLoginInformation({ variables: { name } })
						}
					}}
					onChange={ev => setPassword(ev.target.value)}
					fullWidth />

				<Button
					disabled={name === "" || password === ""}
					onClick={() => fetchLoginInformation({ variables: { name } })}
					variant="contained"
					color="primary">
					Einloggen
			</Button>
			</Paper>
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%"
	},
	paper: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(2),
		padding: theme.spacing(2)
	}
}))

interface GetLoginInformation {
	loginInformation: {
		salt: string
		hashType: string
	}
}

const GET_LOGIN_INFORMATION = gql`
	query ($name: String!) {
		loginInformation(name: $name) {
			salt
			hashType
		}
	}
`

const LOGIN = gql`
	mutation ($name: String!, $passwordHash: String!) {
		login(name: $name, passwordHash: $passwordHash) {
			id
			name
		}
	}
`
