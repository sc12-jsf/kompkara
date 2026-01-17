from fastapi import FastAPI
from wsQueueEndpoint import router as queue_router 
from wsBattleEndpoint import router as battle_router 
app = FastAPI()
app.include_router(queue_router) 
app.include_router(battle_router)