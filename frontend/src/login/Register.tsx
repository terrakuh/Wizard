import { Button, TextField } from "@material-ui/core"
import React from "react"
import { useParams } from "react-router"

export default function Register() {
	const urlToken = useParams<{ token?: string }>().token
	const [token, setToken] = React.useState(urlToken ?? "")
	const [user, setUser] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [repeatPassword, setRepeatPassword] = React.useState("")

	return (
		<div>
			<TextField
				value={user}
				onChange={ev => setUser(ev.target.value)}
				label="Benutzer"
				fullWidth />

			<TextField
				type="password"
				value={password}
				error={password.length < 6}
				helperText={password.length < 6 ? "Passwort muss mindestens 6 Zeichen lang sein." : undefined}
				onChange={ev => setPassword(ev.target.value)}
				label="Passwort"
				fullWidth />

			<TextField
				type="password"
				value={repeatPassword}
				error={password !== repeatPassword}
				onChange={ev => setRepeatPassword(ev.target.value)}
				label="Passwort wiederholen"
				fullWidth />

			<TextField
				disabled={urlToken != null}
				value={token}
				onChange={ev => setToken(ev.target.value)}
				label="Token"
				fullWidth />

			<Button
				disabled={user === "" || password.length < 6 || password !== repeatPassword}
				variant="contained"
				color="primary">
				Registrieren
			</Button>
		</div>
	)
}
