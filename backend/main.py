from api.decorators import State
from database import Database
from fastapi import FastAPI, Request, Depends
from starlette.graphql import GraphQLApp
from graphene import Schema
from api.query import Query
from api.mutation import Mutation
from api.security import UserAuthentication
from graphql.execution.executors.asyncio import AsyncioExecutor

app = FastAPI()
schema = Schema(query=Query, mutation=Mutation)
gql_app = GraphQLApp(schema=schema, executor_class=AsyncioExecutor)
db = Database("wizard.db")
user_authentication = UserAuthentication(db)

# app.mount("/", StaticFiles(directory="static"))

@app.post("/api/gql")
async def handle_gql(request: Request):
	request.state.db = db
	request.state.user_authentication = user_authentication
	return await gql_app.handle_graphql(request=request)
