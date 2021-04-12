from fastapi import FastAPI

app = FastAPI()

@app.post("/api/register")
async def register(name, password_hash, salt, hash_type):
    return {"message": "Hello World"}

@app.post("/api/login")
async def login(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/logout")
async def logout(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/create_lobby")
async def create_lobby(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/change_lobby_settings")
async def change_lobby_settings(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/join_lobby")
async def join_lobby(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/leave_lobby")
async def leave_lobby(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/start_game")
async def start_game(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/play_card")
async def play_card(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/call_tricks")
async def call_tricks(name, password_hash):
    return {"message": "Hello World"}

@app.post("/api/complete_action")
async def complete_action(name, password_hash):
    return {"message": "Hello World"}
