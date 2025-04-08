from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Set
import json
from datetime import datetime
import uuid

from Db.session import get_db
from API.Models.ChatMessage import ChatMessage
from API.Models.Project import Project
from API.Models.User import User
from API.utils.auth import create_access_token
from API.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

# Active connections by project_id
active_connections: Dict[str, Set[WebSocket]] = {}

async def get_db_websocket():
    """Database dependency for WebSockets"""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()

@router.websocket("/ws/{project_id}/{token}")
async def websocket_endpoint(
    websocket: WebSocket, 
    project_id: str, 
    token: str, 
    db: Session = Depends(get_db_websocket)
):
    """WebSocket endpoint for project chat"""
    # Authenticate user via token
    try:
        from jose import jwt
        from Db.config import JWT_SECRET_KEY, JWT_ALGORITHM
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)  # Policy violation
            return
        
        # Get user
        user = db.query(User).filter(User.Id == user_id, User.IsDeleted == False).first()
        if not user:
            await websocket.close(code=1008)
            return
        
        # Check if project exists and user has access
        project = db.query(Project).filter(Project.Id == project_id, Project.IsDeleted == False).first()
        if not project:
            await websocket.close(code=1008)
            return
        
        # Check user access to project (creator, stakeholder, or team member)
        has_access = (
            project.CreatedBy == user_id or
            any(s.UserId == user_id for s in project.Stakeholders) or
            any(u.Id == user_id for team in project.Teams for u in team.Members)
        )
        
        if not has_access:
            await websocket.close(code=1008)
            return
        
        # Accept connection
        await websocket.accept()
        
        # Add to active connections
        if project_id not in active_connections:
            active_connections[project_id] = set()
        active_connections[project_id].add(websocket)
        
        try:
            # Send last 50 messages as history
            history = (
                db.query(ChatMessage)
                .filter(ChatMessage.ProjectId == project_id)
                .order_by(ChatMessage.SentAt.desc())
                .limit(50)
                .all()
            )
            
            history_messages = []
            for msg in reversed(history):
                sender = db.query(User).filter(User.Id == msg.UserId).first()
                history_messages.append({
                    "id": msg.Id,
                    "content": msg.Content,
                    "senderId": msg.UserId,
                    "senderName": f"{sender.FirstName} {sender.LastName}" if sender else "Unknown",
                    "timestamp": msg.SentAt.isoformat(),
                    "isHistory": True
                })
            
            if history_messages:
                await websocket.send_text(json.dumps({
                    "type": "history",
                    "messages": history_messages
                }))
            
            # Handle messages
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Save message to database
                db_message = ChatMessage(
                    Id=str(uuid.uuid4()),
                    ProjectId=project_id,
                    UserId=user_id,
                    Content=message_data.get("content", ""),
                    SentAt=datetime.utcnow(),
                    IsRead=False
                )
                db.add(db_message)
                db.commit()
                
                # Broadcast message to all connected clients
                response = {
                    "id": db_message.Id,
                    "content": db_message.Content,
                    "senderId": user_id,
                    "senderName": f"{user.FirstName} {user.LastName}",
                    "timestamp": db_message.SentAt.isoformat(),
                    "type": "message"
                }
                
                if project_id in active_connections:
                    for connection in active_connections[project_id]:
                        await connection.send_text(json.dumps(response))
                
        except WebSocketDisconnect:
            # Remove from active connections
            if project_id in active_connections and websocket in active_connections[project_id]:
                active_connections[project_id].remove(websocket)
                if not active_connections[project_id]:
                    del active_connections[project_id]
                    
        except Exception as e:
            print(f"WebSocket error: {e}")
            if project_id in active_connections and websocket in active_connections[project_id]:
                active_connections[project_id].remove(websocket)
                if not active_connections[project_id]:
                    del active_connections[project_id]
            
    except Exception as e:
        print(f"Authentication error: {e}")
        await websocket.close(code=1008)