from database import Database
from fastapi import FastAPI, Request, Depends
from starlette.graphql import GraphQLApp
from api import schema
from api.security import UserAuthentication
from graphql.execution.executors.asyncio import AsyncioExecutor

app = FastAPI()
gql_app = GraphQLApp(schema=schema, executor_class=AsyncioExecutor)
db = Database("wizard.db")
user_authentication = UserAuthentication(db)

# app.mount("/", StaticFiles(directory="static"))

@app.post("/api/gql")
async def handle_gql(request: Request):
	request.db = db
	request.user_authentication = user_authentication
	return await gql_app.handle_graphql(request=request)

@app.get("/test")
async def test(auth: UserAuthentication = Depends(user_authentication)):
	return "hihi"
