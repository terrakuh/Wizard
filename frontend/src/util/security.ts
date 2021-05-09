import CryptoJS from "crypto-js"

export function generatePasswordHash(password: string, salt: CryptoJS.lib.WordArray, hashType: string) {
	if (hashType.toLowerCase() !== "sha512") {
		throw Error(`Nicht unterstützte Hashfunktion "${hashType}"`)
	}

	return CryptoJS.enc.Base64.stringify(CryptoJS.PBKDF2(password, salt, {
		iterations: 1,
		hasher: CryptoJS.algo.SHA512,
		keySize: 256 / 32
	}))
}
