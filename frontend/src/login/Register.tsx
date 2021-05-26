import { useMutation } from "@apollo/client"
import { makeStyles, Paper, TextField, Theme } from "@material-ui/core"
import gql from "graphql-tag"
import { useState } from "react"
import { useHistory, useParams } from "react-router"
import CryptoJS from "crypto-js"
import { generatePasswordHash } from "../util/security"
import { Loading } from "../util"
import { useSnackbar } from "notistack"
import { ThemedButton } from "../theme"

export default function Register() {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const history = useHistory()
	const urlToken = useParams<{ token?: string }>().token
	const [token, setToken] = useState(urlToken ?? "")
	const [name, setName] = useState("")
	const [password, setPassword] = useState("")
	const [repeatPassword, setRepeatPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [registerUser] = useMutation(REGISTER_USER)

	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
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

				<ThemedButton
					disabled={name === "" || password.length < 6 || password !== repeatPassword}
					variant="contained"
					onClick={async () => {
						setLoading(true)
						try {
							const pwnedCount = await checkIfPwned(password)
							if (pwnedCount) {
								enqueueSnackbar(`Dieses Passwort wurde ${pwnedCount} gepwnt.`, { "variant": "error" })
								return
							}

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
				</ThemedButton>
			</Paper>

			<Loading loading={loading} />
		</div>
	)
}

const useStyles = makeStyles((theme: Theme) => ({
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

const REGISTER_USER = gql`
	mutation ($name: String!, $passwordHash: String!, $salt: String!, $token: String!) {
		register(name: $name, passwordHash: $passwordHash, salt: $salt, hashType: "sha512", token: $token)
	}
`

async function checkIfPwned(password: string) {
	try {
		password = CryptoJS.enc.Hex.stringify(CryptoJS.SHA1(password))
		const resp = await fetch(`https://api.pwnedpasswords.com/range/${password.substring(0, 5)}`)
		const match = new RegExp(`${password.substring(5)}:(\\d+)`, "i").exec(await resp.text())
		return parseInt(match?.[1] ?? "0")
	} catch (err) { }
	return 0
}
