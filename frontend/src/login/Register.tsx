import { useMutation } from "@apollo/client"
import { Button, TextField } from "@material-ui/core"
import gql from "graphql-tag"
import React from "react"
import { useHistory, useParams } from "react-router"
import CryptoJS from "crypto-js"
import { generatePasswordHash } from "../util/security"
import { Loading } from "../util"
import { useSnackbar } from "notistack"

export default function Register() {
	const { enqueueSnackbar } = useSnackbar()
	const history = useHistory()
	const urlToken = useParams<{ token?: string }>().token
	const [token, setToken] = React.useState(urlToken ?? "")
	const [name, setName] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [repeatPassword, setRepeatPassword] = React.useState("")
	const [loading, setLoading] = React.useState(false)
	const [registerUser] = useMutation(REGISTER_USER)

	return (
		<div>
			<Loading loading={loading} />

			<TextField
				value={name}
				onChange={ev => setName(ev.target.value)}
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
				disabled={name === "" || password.length < 6 || password !== repeatPassword}
				variant="contained"
				onClick={async () => {
					setLoading(true)
					try {
						const salt = CryptoJS.lib.WordArray.random(8)
						const passwordHash = generatePasswordHash(password, salt, "sha512")
						await registerUser({
							variables: {
								name,
								token,
								salt: CryptoJS.enc.Base64.stringify(salt),
								passwordHash
							}
						})
					} catch (err) {
						enqueueSnackbar(`Registrierung fehlgeschlagen: ${err}`, { variant: "error" })
						console.error(err)
						return
					} finally {
						setLoading(false)
					}
					enqueueSnackbar("Konto erfolgreich erstellt.", { variant: "success" })
					history.push("/login")
				}}
				color="primary">
				Registrieren
			</Button>
		</div>
	)
}

const REGISTER_USER = gql`
	mutation ($name: String!, $passwordHash: String!, $salt: String!, $token: String!) {
		register(name: $name, passwordHash: $passwordHash, salt: $salt, hashType: "sha512", token: $token)
	}
`
