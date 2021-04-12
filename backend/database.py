import sqlite3
import random
import string

with open("schema.sql") as f:
		SCHEMA = f.read()


class Round:
	pass

class Game:

	def __init__(self, cursor: sqlite3.Cursor):
		self._cursor = cursor

	def add_round(self, round: Round):
		pass

class Database:

	def __init__(self, filename: str):
		self._db = sqlite3.connect(filename)
		self.__create_tables()

	def __create_tables(self):
		with self._db:
			self._db.execute(SCHEMA)

	def close(self):
		self._db.close()

	def register_user(self, name: str, password_hash: bytes, salt: bytes, hash_type: str):
		self._db.execute("""
			INSERT INTO user(name, password, salt, hash_type)
			VALUES(?, ?, ?, ?)
		""", (name, password_hash, salt, hash_type))

	def login(self, name: str, password_hash: bytes, expires_days: int = 31, cookie_length: int = 32):
		cookie = "".join(random.choices(string.ascii_letters, k=cookie_length))

		self._db.execute("""
			INSERT INTO session(user, cookie, expires)
			VALUES((
				SELECT id
				FROM user
				WHERE name=? AND password=?
			), ?, DATETIME('now', ?))
		""", (name, password_hash, cookie, "{} days".format(expires_days)))

	def logout(self, cookie: bytes):
		self._db.execute("DELETE FROM session WHERE cookie=?", (cookie,))

	def is_logged_in(self, cookie: bytes):
		cur = self._db.execute("SELECT 1 FROM session WHERE cookie=? AND expires<DATETIME('now')", (cookie,))
		return cur.fetchone() is not None

	def create_game(self) -> Game:
		return Game(self._db.cursor())
