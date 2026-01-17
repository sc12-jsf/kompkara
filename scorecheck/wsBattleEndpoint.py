from fastapi import WebSocket, WebSocketDisconnect
import json 
from lobby import lobbies
from fastapi import APIRouter 
router = APIRouter()
from scorecheckmyw import getPitch, error

@router.websocket("/battle/{lid}/{idname}")
async def endpoint(websocket: WebSocket, lid: str, idname: str):
    await websocket.accept()
    lobby= lobbies.get(lid)
    if lobby is None:
        await websocket.send_text("Error: Lobby not found")
        await websocket.close()
        return
    
    lobby.connections[idname]= websocket
    lobby.scores[idname]= 0
    contour= lobby.contour
    await websocket.send_text(json.dumps({"type": "BATTLE_START", "payload":{"message":"Let the singing begin!"} }))
    await websocket.send_text(json.dumps({"type": "PHASE_CHANGE", "payload": {"phase": "IN_BATTLE"}}))

    try:
        while True:
            packet= await websocket.receive_text()
            dta= json.loads(packet)
            types= dta.get("type")
            ms= dta.get("payload",{}) 

            if types== "pitch":
                userpitch= dta.get("pitch")
                time= dta.get("time")
                songpitch= getPitch(time,contour)
                difference= error(userpitch,songpitch)
                lobby.scores[idname]= difference
                updatescores={"type": "PLAYER_SCORE_UPDATE", "payload":{"playerId":idname,"score":difference}}
                dta= json.dumps(updatescores)
                for ws in lobby.connections.values():
                    await ws.send_text(dta)
            elif types=="FINISH_BATTLE":
                results={"type": "BATTLE_RESULTS","payload":{"players":[{"id":pid,"scores":score} for pid, score in  lobby.scores.items()]}}
                dta= json.dumps(results)
                for ws in lobby.connections.values():
                    await ws.send_text(dta)
    
    except WebSocketDisconnect:
        print(f'{idname} has ragequit')
        if idname in lobby.connections:
            del lobby.connections[idname]
        if idname in lobby.scores:
            del lobby.scores[idname]

                