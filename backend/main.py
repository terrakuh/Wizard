from database import Database
from fastapi import FastAPI, Request, status
from fastapi.responses import HTMLResponse, FileResponse
from starlette.graphql import GraphQLApp
from graphene import Schema
from api.query import Query
from api.mutation import Mutation
from api.security import UserAuthentication
from api.decorators import Response
from graphql.execution.executors.asyncio import AsyncioExecutor
from lobby.manager import Manager
from pathlib import Path
from datetime import timedelta

app = FastAPI()
schema = Schema(query=Query, mutation=Mutation)
gql_app = GraphQLApp(schema=schema, executor_class=AsyncioExecutor)
db = Database("wizard.db")
user_authentication = UserAuthentication(db)
lobby_manager = Manager()

@app.post("/api/gql")
async def handle_gql(request: Request):
	# dependencies
	request.state.db = db
	request.state.user_authentication = user_authentication
	request.state.response = Response()
	request.state.lobby_manager = lobby_manager
	# execute
	real_response = await gql_app.handle_graphql(request=request)
	for key, value in request.state.response.cookies.items():
		if value is None:
			real_response.delete_cookie(key)
		else:
			real_response.set_cookie(key, value, max_age=timedelta(days=365).total_seconds())
	return real_response


ABSOLUTE_PRIVATE_PATH = Path("static/private").absolute()
ABSOLUTE_STATIC_PATH = Path("static").absolute()
INDEX_PATH = Path(ABSOLUTE_STATIC_PATH, "index.html")

@app.get("/{full_path:path}")
async def handle_static_files(request: Request, full_path: str):
	path = Path(ABSOLUTE_STATIC_PATH, full_path)
	parents = path.parents
	if ABSOLUTE_PRIVATE_PATH in parents:
		try:
			await user_authentication.authenticate(request)
		except:
			return HTMLResponse(status_code=status.HTTP_401_UNAUTHORIZED)
	elif ABSOLUTE_STATIC_PATH not in parents and ABSOLUTE_STATIC_PATH != path:
		return HTMLResponse(status_code=status.HTTP_403_FORBIDDEN)
	if path.is_file():
		return FileResponse(path)
	return FileResponse(INDEX_PATH)
