import json
import uuid
import re
import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from services.auth_service import get_current_user
from database.models import ChatSession, ChatMessage, User
from services.ioc_analysis import _build_ti_summary, detect_type,analyze_indicator_for_user
from services.intent_classifier import classify_message
from services.llm_enricher import get_llm_url

router = APIRouter()

class ChatMessageRequest(BaseModel):
    message: str
    session_id: str | None = None
    model: str | None = None
    history: list[dict] | None = []

def get_or_create_session(db: Session, session_id: str | None, user_id: int):
    if session_id:
        session = db.query(ChatSession).filter_by(id=session_id).first()
        if session:
            return session

    session = ChatSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="Nouvelle conversation"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def save_message(db: Session, session_id: str, role: str, content: str):
    msg = ChatMessage(
        session_id=session_id,
        role=role,
        content=content
    )
    db.add(msg)
    db.commit()

@router.post("/message")
def chat_message(
    body: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = body.message.strip()
    if not message:
        raise HTTPException(400, "Message vide")

    session = get_or_create_session(db, body.session_id, current_user.id)
    save_message(db, session.id, "user", message)

    intent = classify_message(message)
    if intent == "off_topic":
        return {
            "session_id": session.id,
            "message": "Je suis spécialisé en cybersécurité. Posez-moi une question en cybersécurité"
        }
    
    if intent in ("question"):
        llm_url = get_llm_url(body.model)
        try:
            resp = requests.post(
                f"{llm_url}/chat",
                json={"question": message, "history": body.history or []},
                timeout=240
            )
            resp.raise_for_status()
            answer = resp.json().get("answer", "")
        except Exception as e:
            answer = f"LLM error: {str(e)}"
        save_message(db, session.id, "assistant", answer)
        return {
            "session_id": session.id,
            "message": answer
        }
    ioc_match = re.search(
        r'\b(\d{1,3}(?:\.\d{1,3}){3})\b'           # ip
        r'|([a-fA-F0-9]{32,64})'                     # hash
        r'|(https?://\S+)'                            # url
        r'|([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,})'  # ← email EN PREMIER
        r'|([a-zA-Z0-9-]+\.[a-zA-Z]{2,6})\b', 
        message
    )
    indicator = ioc_match.group(0) if ioc_match else message.strip()
    ioc_type  = detect_type(indicator)
    if ioc_type == "unknown":
        reply = {"message": "Type d'indicateur non reconnu."}
        save_message(db, session.id, "assistant", json.dumps(reply))
        return {"session_id": session.id, **reply}
    result = analyze_indicator_for_user(
        db=db,
        user_id=current_user.id,
        indicator=indicator,
        force_rag=False,
        model=body.model
    )
    if not result["ok"]:
        raise HTTPException(
            status_code=result["status_code"],
            detail=result["error"]
        )
    raw_analysis = result["payload"]
    ti_data      = raw_analysis.get("ti_data", {})
    llm_analysis = raw_analysis.get("llm_analysis", {})
    ti_summary   = _build_ti_summary(ioc_type, ti_data)
    reply = {
        "message":    llm_analysis.get("summary", ""),
        "indicator":  indicator,
        "type":       ioc_type,
        "verdict":    llm_analysis,
        "ti_summary": ti_summary,
    }
    save_message(db, session.id, "assistant", json.dumps(reply))
    return {
        "session_id": session.id,
        **reply
    }
