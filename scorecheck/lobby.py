from collections import deque
class Lobby:
    def __init__(self, id, players=4):
        self.id= id
        self.players= players
        self.connections= {}
        self.song= None
        self.ready=set()
        self.contour= None
        self.scores={}
class Lobbies:
    def __init__(self):
        self.lobbies= {}
    def makelobby(self, id):
        if id not in self.lobbies:
            self.lobbies[id]= Lobby(id)
        return self.lobbies[id]
    def get(self,id):
        return self.lobbies.get(id)
manager=Lobbies()