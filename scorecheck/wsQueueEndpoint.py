from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
from lobby import Lobbies
from process import driver
import json
import time
app= FastAPI()
def lobbyPayload(lobby):
    return[{"id":pid,"name":pid,"ready":pid in lobby.ready, "score": lobby.scores.get(pid,0)}
           for pid in lobby.connections.keys()]
async def lobby_snapshot(lobby):
    sh= {"type": "LOBBY_SNAPSHOT","payload":{
        "roomId": lobby.id,
        "roomCode": lobby.id,
        "phase": "LOBBY",
        "song": lobby.song,
        "players": lobbyPayload(lobby),


    }}
    dta= json.dumps(sh)
    for ws in lobby.connections.values():
        await ws.send_text(dta)

async def playerReady(lobby,pid,ready):
    msg={"type": "PLAYER_READY","payload":{"playerid":pid,"ready":ready}}
    dta= json.dumps(msg)
    for ws in lobby.connections.values():
        await ws.send_text(dta)
async def phaseChange(lobby, phase):
    msg={"type": "PHASE_CHANGE","payload":{"phase": phase,"startTime": int(time.time())*1000}}
    dta= json.dumps(msg)
    for ws in lobby.connections.values():
        await ws.send_text(dta)

lobbies= Lobbies()
@app.websocket("/ws/{lid}/{idname}")
async def endpoint(websocket: WebSocket,lid: str,idname: str):
    await websocket.accept()
    #debug line to makesure connection was accepted
    await websocket.send_text(json.dumps({ "type": "WELCOME", "payload": { "roomId": lid, "playerId": idname } }))

    lobby= lobbies.makelobby(lid)
  
    if not lobby.started:
        asyncio.create_task(driver(lobby))
        lobby.started= True
    lobby.connections[idname]= websocket
    try:
        while True:
            packet= await websocket.receive_text()
            dta= json.loads(packet)
            types= dta.get("type")
            payload= dta.get("payload", {})
            if types== "JOIN_LOBBY":
                await lobby_snapshot(lobby)
            elif types =="LEAVE_LOBBY":
                lobby.ready.discard(idname)
                lobby.playerlist.remove(idname)
                del lobby.connections[idname]
                await lobby_snapshot(lobby)
            elif types =="SET_READY": 
                ready= bool(payload.get("ready"))
                if ready:
                    lobby.ready.add(idname)
                else:
                    lobby.ready.discard(idname)
                await playerReady(lobby,idname,ready)
                if len(lobby.ready) == lobby.players:
                    await phaseChange(lobby,phase="IN_BATTLE")
            elif types== "SELECT_SONG":
                lobby.song_id=payload.get("songID")
                await lobby_snapshot(lobby)

           


           

    except WebSocketDisconnect:
        if idname in lobby.connections:
            del lobby.connections[idname]
            lobby.ready.discard(idname)
