from api.types import LoginInformation, Appointment, User as UserType
from game.player import User
from sqlite3 import connect
import random
import string
from os.path import join, dirname
from asyncio import get_event_loop, run
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Iterable
from hashlib import new
from base64 import b64encode
from datetime import datetime


with open(join(dirname(__file__), "schema.sql")) as f:
		SCHEMA = f.read()


class Database:
	def __init__(self, filename: str) -> None:
		self._pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="database")
		get_event_loop().run_in_executor(self._pool, self.__setup, filename)

	def __setup(self, filename: str) -> None:
		self._db = connect(filename)
		with self._db:
			self._db.executescript(SCHEMA)

	def __execute(self, sql: str, parameters: Iterable[Any] = ...):
		with self._db:
			return self._db.execute(sql, parameters).fetchall()

	async def close(self) -> None:
		await get_event_loop().run_in_executor(self._pool, lambda: self._db.close())

	async def get_login_information(self, name: str) -> LoginInformation:
		result = await get_event_loop().run_in_executor(self._pool, self.__execute, """
			SELECT salt, hash_type
			FROM user
			WHERE name=?
		""", (name,))
		return LoginInformation(salt=result[0][0], hash_type=result[0][1])

	async def get_username(self, id: int) -> str:
		result = await get_event_loop().run_in_executor(self._pool, self.__execute, """
			SELECT name
			FROM user
			WHERE id=?
		""", (id,))
		return result[0][0]

	async def get_user_by_cookie(self, cookie: str) -> User:
		row = (await get_event_loop().run_in_executor(self._pool, self.__execute, """
			SELECT user.id, user.name
			FROM user
			JOIN session ON session.user=user.id
			WHERE session.cookie=?
		""", (cookie,)))[0]
		return User(user_id=row[0], name=row[1])

	@staticmethod
	def __hash_key(password_hash: str, salt: str, hash_type: str) -> str:
		hasher = new(hash_type)
		hasher.update(salt.encode("utf8"))
		hasher.update(password_hash.encode("utf8"))
		hasher.update(salt.encode("utf8"))
		return b64encode(hasher.digest()).decode("utf8")

	async def register_user(self, name: str, password_hash: str, salt: str, hash_type: str) -> None:
		password_hash = Database.__hash_key(password_hash, salt, hash_type)
		await get_event_loop().run_in_executor(self._pool, self.__execute, """
			INSERT INTO user(name, password, salt, hash_type)
			VALUES(?, ?, ?, ?)
		""", (name, password_hash, salt, hash_type))

	async def login(self, name: str, password_hash: str, expires_days: int = 31, cookie_length: int = 32) -> str:
		cookie = "".join(random.choices(string.ascii_letters, k=cookie_length))
		def func():
			with self._db:
				row = self._db.execute("SELECT id, salt, hash_type, password FROM user WHERE name=?", (name,)).fetchone()
				if Database.__hash_key(password_hash, row[1], row[2]) != row[3]:
					raise Exception()
				self._db.execute("INSERT INTO session(user, cookie, expires) VALUES(?, ?, DATETIME('now', ?))", (row[0], cookie, "{} days".format(expires_days)))
		await get_event_loop().run_in_executor(self._pool, func)
		return cookie

	async def logout(self, cookie: str) -> None:
		await get_event_loop().run_in_executor(self._pool, self.__execute,
			"DELETE FROM session WHERE cookie=?", (cookie,))

	async def is_logged_in(self, cookie: bytes) -> bool:
		result = await get_event_loop().run_in_executor(self._pool, self.__execute,
			"SELECT 1 FROM session WHERE cookie=? AND expires>DATETIME('now')", (cookie,))
		return len(result) != 0

	async def consume_token(self, token: str) -> None:
		def func():
			with self._db:
				result = self._db.execute("SELECT 1 FROM register_token WHERE token=?", (token,)).fetchone()
				if result is None and self._db.execute("SELECT COUNT(*) FROM user").fetchone()[0] != 0:
					raise Exception("invalid token")
				self._db.execute("DELETE FROM register_token WHERE token=?", (token,))
		await get_event_loop().run_in_executor(self._pool, func)

	async def get_appointments(self) -> list[Appointment]:
		def func():
			with self._db:
				appointments: list[Appointment] = []
				for appointment in self._db.execute("SELECT id, start FROM appointment WHERE start>datetime('now', '-1 hour')"):
					users: list[UserType] = []
					for user in self._db.execute("""
						SELECT user.id, user.name
						FROM user
						JOIN user_appointment ON user_appointment.user=user.id
						WHERE user_appointment.appointment=?
					""", (appointment[0],)):
						users.append(UserType(id=user[0], name=user[1]))
					appointments.append(Appointment(id=appointment[0], start=appointment[1], participants=users))
				return appointments
		return await get_event_loop().run_in_executor(self._pool, func)

	async def create_appointment(self, start: datetime) -> int:
		def func():
			with self._db:
				return self._db.execute("INSERT INTO appointment(start) VALUES(?)", (start,)).lastrowid
		return await get_event_loop().run_in_executor(self._pool, func)

	async def join_appointment(self, id: int, name: str) -> None:
		def func():
			with self._db:
				self._db.execute("""
					INSERT INTO user_appointment(user, appointment)
					VALUES((SELECT id FROM user WHERE name=?), ?)
				""", (name, id))
		await get_event_loop().run_in_executor(self._pool, func)

	async def leave_appointment(self, id: int, name: str) -> None:
		def func():
			with self._db:
				self._db.execute("""
					DELETE FROM user_appointment
					WHERE user=(SELECT id FROM user WHERE name=?) AND appointment=?
				""", (name, id))
				self._db.execute("""
					DELETE FROM appointment
					WHERE id NOT IN (
						SELECT DISTINCT appointment
						FROM user_appointment
					)
				""")
		await get_event_loop().run_in_executor(self._pool, func)

	async def get_appointment(self, id: int) -> Appointment:
		def func():
			with self._db:
				appointment = Appointment(id=id, participants=[])
				appointment.start = self._db.execute("SELECT start FROM appointment WHERE id=?", (id,)).fetchone()[0]
				for user in self._db.execute("""
					SELECT user.id, user.name
					FROM user
					JOIN user_appointment ON user_appointment.user=user.id
					WHERE user_appointment.appointment=?
				""", (id,)):
					appointment.participants.append(UserType(id=user[0], name=user[1]))
				return appointment
		return await get_event_loop().run_in_executor(self._pool, func)


if __name__ == "__main__":
	async def main():
		db = Database("test.db")
		# await db.register_user(name="Hi", password_hash=b"asd", salt=b"asdwqwe", hash_type="lksd")
		cookie = await db.login("Hi", password_hash=b"asd")
		print("cookie:", cookie)
		print("logged in:", await db.is_logged_in(cookie))
		await db.logout(cookie)
		await db.close()

	run(main())
