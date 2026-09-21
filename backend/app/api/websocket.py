import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter(tags=["WebSocket Real-Time Tracking"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, request_id: int, websocket: WebSocket):
        await websocket.accept()
        if request_id not in self.active_connections:
            self.active_connections[request_id] = []
        self.active_connections[request_id].append(websocket)

    def disconnect(self, request_id: int, websocket: WebSocket):
        if request_id in self.active_connections:
            if websocket in self.active_connections[request_id]:
                self.active_connections[request_id].remove(websocket)
            if not self.active_connections[request_id]:
                del self.active_connections[request_id]

    async def broadcast(self, request_id: int, message: dict):
        if request_id in self.active_connections:
            for connection in self.active_connections[request_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/tracker/{request_id}")
async def tracker_websocket(websocket: WebSocket, request_id: int):
    """
    Bi-directional real-time WebSocket connection for live technician tracking,
    simulated GPS movement, and in-app instant chat.
    """
    await manager.connect(request_id, websocket)
    
    # Send initial connection confirmation
    await websocket.send_json({
        "type": "CONNECTED",
        "request_id": request_id,
        "message": "Connected to FixIt Live Tracking Stream"
    })
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except Exception:
                payload = {"text": data}
                
            event_type = payload.get("type", "CHAT")
            
            if event_type == "START_GPS_SIMULATION":
                # Spawn a background task to simulate technician vehicle traveling on map
                start_lat = payload.get("start_lat", 17.4485)
                start_lng = payload.get("start_lng", 78.3750)
                dest_lat = payload.get("dest_lat", 17.4435)
                dest_lng = payload.get("dest_lng", 78.3810)
                total_steps = 15
                
                for step in range(total_steps + 1):
                    progress = step / total_steps
                    cur_lat = start_lat + (dest_lat - start_lat) * progress
                    cur_lng = start_lng + (dest_lng - start_lng) * progress
                    rem_mins = max(1, int(15 * (1 - progress)))
                    
                    status = "en_route"
                    if progress >= 1.0:
                        status = "in_progress"
                    elif progress == 0.0:
                        status = "assigned"

                    await manager.broadcast(request_id, {
                        "type": "GPS_UPDATE",
                        "request_id": request_id,
                        "lat": round(cur_lat, 6),
                        "lng": round(cur_lng, 6),
                        "progress_percent": round(progress * 100, 1),
                        "eta_minutes": rem_mins,
                        "status": status,
                        "speed_kmh": 28 if progress < 1.0 else 0
                    })
                    await asyncio.sleep(1.8) # Update every ~1.8 seconds
            
            elif event_type == "CHAT_MESSAGE":
                # Broadcast incoming chat message to all connected clients on this request
                await manager.broadcast(request_id, {
                    "type": "CHAT_MESSAGE",
                    "request_id": request_id,
                    "sender_type": payload.get("sender_type", "customer"),
                    "sender_name": payload.get("sender_name", "User"),
                    "message": payload.get("message", ""),
                    "timestamp": payload.get("timestamp", "")
                })
                
            elif event_type == "STATUS_UPDATE":
                await manager.broadcast(request_id, {
                    "type": "STATUS_CHANGED",
                    "request_id": request_id,
                    "status": payload.get("status", "assigned"),
                    "eta_minutes": payload.get("eta_minutes", 12)
                })
                
    except WebSocketDisconnect:
        manager.disconnect(request_id, websocket)
    except Exception:
        manager.disconnect(request_id, websocket)
