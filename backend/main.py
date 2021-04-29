from database import Database
from fastapi import FastAPI, Request
from starlette.graphql import GraphQLApp
from graphene import Schema
from api.query import Query
from api.mutation import Mutation
from api.security import UserAuthentication
from api.decorators import Response
from graphql.execution.executors.asyncio import AsyncioExecutor
from lobby.manager import Manager

app = FastAPI()
schema = Schema(query=Query, mutation=Mutation)
gql_app = GraphQLApp(schema=schema, executor_class=AsyncioExecutor)
db = Database("wizard.db")
user_authentication = UserAuthentication(db)
lobby_manager = Manager()

# app.mount("/", StaticFiles(directory="static"))

@app.post("/api/gql")
async def handle_gql(request: Request):
	request.state.db = db
	request.state.user_authentication = user_authentication
	request.state.response = Response()
	real_response = await gql_app.handle_graphql(request=request)
	for key, value in request.state.response.cookies.items():
		if value is None:
			real_response.delete_cookie(key)
		else:
			real_response.set_cookie(key, value)
	return real_response
