import asyncio
async def driver(lobby):
    while True:
        if lobby.queue:
            id, websocket= lobby.queue.popleft()
            if lobby.not_full():
                lobby.playerlist.append(id)
                lobby.connections[id]= websocket

                #websocket call 
                await websocket.send_json({
                    "event": "joined",
                    "id": lobby.id,
                    "players": lobby.playerlist
                })
                for userid, ws in lobby.connections.items():
                    #checks if user is not already in the queue
                    if userid != id:
                        await ws.send_json({
                            "event": "player joined",
                            "id": id
                        })
            else:
                await ws.send_json({
                    "event": "queue is full",
                    "id": lobby.id
                })
        await asyncio.sleep(0.02)