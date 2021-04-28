from api.types import LoginInformation, User
from sqlite3 import connect
import random
import string
from os.path import join, dirname
from asyncio import get_event_loop, run
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Iterable


with open(join(dirname(__file__), "schema.sql")) as f:
		SCHEMA = f.read()


class Round:
	pass

# class Game:

# 	def __init__(self, cursor: sqlite3.Cursor):
# 		self._cursor = cursor

# 	def add_round(self, round: Round):
# 		pass


class Database:
	def __init__(self, filename: str):
		self._pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="database")
		get_event_loop().run_in_executor(self._pool, self.__setup, filename)


	def __setup(self, filename: str):
		self._db = connect(filename)
		with self._db:
			self._db.executescript(SCHEMA)
			self._db.execute("DELETE FROM session WHERE expires<=DATETIME('now')")


	def __execute(self, sql: str, parameters: Iterable[Any] = ...):
		with self._db:
			return self._db.execute(sql, parameters).fetchall()


	async def close(self):
		await get_event_loop().run_in_executor(self._pool, lambda: self._db.close())


	async def get_login_information(self, name: str) -> LoginInformation:
		result = await get_event_loop().run_in_executor(self._pool, self.__execute, """
			SELECT salt, hash_type
			FROM user
			WHERE name=?
		""", (name,))
		return LoginInformation(salt=result[0][0], hash_type=result[0][1])


	async def get_username(self, id: int):
		result = await get_event_loop().run_in_executor(self._pool, self.__execute, """
			SELECT name
			FROM user
			WHERE id=?
		""", (id,))
		return result[0][0]


	async def register_user(self, name: str, password_hash: str, salt: str, hash_type: str):
		await get_event_loop().run_in_executor(self._pool, self.__execute, """
			INSERT INTO user(name, password, salt, hash_type)
			VALUES(?, ?, ?, ?)
		""", (name, password_hash, salt, hash_type))


	async def login(self, name: str, password_hash: str, expires_days: int = 31, cookie_length: int = 32) -> str:
		cookie = "".join(random.choices(string.ascii_letters, k=cookie_length))
		await get_event_loop().run_in_executor(self._pool, self.__execute, """
			INSERT INTO session(user, cookie, expires)
			VALUES((
				SELECT id
				FROM user
				WHERE name=? AND password=?
			), ?, DATETIME('now', ?))
		""", (name, password_hash, cookie, "{} days".format(expires_days)))
		return cookie


	async def logout(self, cookie: str):
		await get_event_loop().run_in_executor(self._pool, self.__execute,
			"DELETE FROM session WHERE cookie=?", (cookie,))


	async def is_logged_in(self, cookie: bytes) -> bool:
		result = await get_event_loop().run_in_executor(self._pool, self.__execute,
			"SELECT 1 FROM session WHERE cookie=? AND expires>DATETIME('now')", (cookie,))
		return len(result) != 0


	# def create_game(self) -> Game:
	# 	return Game(self._db.cursor())

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
