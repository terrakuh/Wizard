from database import Database
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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

absolute_private_path = Path("static/private").absolute()

@app.get("/private/{name}")
async def handle_files(request: Request, name: str):
	try:
		await user_authentication.authenticate(request)
	except:
		return HTMLResponse(status_code=401)
	path = Path(absolute_private_path, name)
	if path.parent.absolute() == absolute_private_path and path.exists():
		return FileResponse(path)
	return HTMLResponse(status_code=404)

app.mount("/", StaticFiles(directory="static"))
