

from __future__ import annotations
import enum
import uuid as _uuid

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean,
    Float, ForeignKey, Index, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .db import Base


# ═══════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════

class IOCTypeEnum(str, enum.Enum):
    HASH = "hash"
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    CVE = "cve"
    MAIL = "mail"


class VerdictEnum(str, enum.Enum):
    MALICIOUS = "malicious"
    SUSPICIOUS = "suspicious"
    HARMLESS = "harmless"
    UNKNOWN = "unknown"


# ═══════════════════════════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")
    is_active = Column(Boolean, default=True)

    langue = Column(String(10), default="fr")
    theme = Column(String(10), default="dark")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    sessions = relationship("ChatSession", back_populates="user")
    scans = relationship("ScanHistory", back_populates="user")
    watchlist = relationship("Watchlist", back_populates="user")


# ═══════════════════════════════════════════════════════════════
# IOC CORE (CENTRE DU SYSTÈME)
# ═══════════════════════════════════════════════════════════════

class IOC(Base):
    __tablename__ = "iocs"
    __table_args__ = (
        UniqueConstraint("value", "type", name="uq_ioc_value_type"),
        Index("ix_ioc_type_verdict", "type", "final_verdict"),
    )

    id = Column(Integer, primary_key=True)

    value = Column(String(512), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)

    final_verdict = Column(String(50))
    risk_score = Column(Integer)
    confidence = Column(Float)

    tags = Column(JSON)
    geo = Column(JSON) 

    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    sources = relationship("IOCSource", back_populates="ioc", cascade="all, delete-orphan")
    scans = relationship("ScanHistory", back_populates="ioc")
    watchlist_items = relationship("Watchlist", back_populates="ioc")


# ═══════════════════════════════════════════════════════════════
# IOC SOURCES (multi-API)
# ═══════════════════════════════════════════════════════════════

class IOCSource(Base):
    __tablename__ = "ioc_sources"
    __table_args__ = (
        UniqueConstraint("ioc_id", "source", name="uq_ioc_source"),
    )

    id = Column(Integer, primary_key=True)

    ioc_id = Column(Integer, ForeignKey("iocs.id"), nullable=False, index=True)
    source = Column(String(50), nullable=False)

    verdict = Column(String(50))
    score = Column(Float)
    raw_data = Column(JSON)

    fetched_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)

    ioc = relationship("IOC", back_populates="sources")


# ═══════════════════════════════════════════════════════════════
# SCAN HISTORY
# ═══════════════════════════════════════════════════════════════

class ScanHistory(Base):
    __tablename__ = "scan_history"
    __table_args__ = (
        Index("ix_scan_user_date", "user_id", "created_at"),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    ioc_id = Column(Integer, ForeignKey("iocs.id"), nullable=True)

    indicator = Column(String(512), index=True)
    ioc_type = Column(String(50))

    final_verdict = Column(String(50))
    risk_score = Column(Integer)

    is_favorite = Column(Boolean, default=False)
    note = Column(Text)
    llm_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="scans")
    ioc = relationship("IOC", back_populates="scans")


# ═══════════════════════════════════════════════════════════════
# LLM LOGS
# ═══════════════════════════════════════════════════════════════

class LLMInferenceLog(Base):
    __tablename__ = "llm_inference_logs"
    __table_args__ = (
        Index("ix_llm_model_date", "model", "created_at"),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(36), nullable=True, index=True)

    indicator = Column(String(512))
    ioc_type = Column(String(50))

    model = Column(String(50), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)

    tokens_in = Column(Integer)
    tokens_out = Column(Integer)
    latency_ms = Column(Integer)

    used_rag = Column(Boolean, default=False)
    rag_score = Column(Float)

    error = Column(Text)

    created_at = Column(DateTime, server_default=func.now())


# ═══════════════════════════════════════════════════════════════
# WATCHLIST
# ═══════════════════════════════════════════════════════════════

class Watchlist(Base):
    __tablename__ = "watchlist"
    __table_args__ = (
        UniqueConstraint("user_id", "ioc_id", name="uq_watchlist_user_ioc"),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ioc_id = Column(Integer, ForeignKey("iocs.id"), nullable=False)

    alert_on = Column(JSON, default=["malicious", "suspicious"])
    note = Column(Text)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="watchlist")
    ioc = relationship("IOC", back_populates="watchlist_items")


# ═══════════════════════════════════════════════════════════════
# CHAT
# ═══════════════════════════════════════════════════════════════

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    title = Column(String(255), default="Nouvelle conversation")
    model = Column(String(50))

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)

    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False, index=True)

    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)

    ioc_ref = Column(String(512))
    llm_log_id = Column(Integer, ForeignKey("llm_inference_logs.id"))

    created_at = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")


# ═══════════════════════════════════════════════════════════════
# RAG
# ═══════════════════════════════════════════════════════════════

class RAGDocument(Base):
    __tablename__ = "rag_documents"
    __table_args__ = (
        UniqueConstraint("source_file", "doc_id", name="uq_rag_doc"),
    )

    id = Column(Integer, primary_key=True)

    doc_id = Column(String(100), nullable=False)
    source_file = Column(String(100), nullable=False)

    ioc_type = Column(String(50))
    content = Column(Text)

    doc_metadata = Column(JSON)

    indexed_at = Column(DateTime, server_default=func.now())


# ═══════════════════════════════════════════════════════════════
# ACTIVITY LOG
# ═══════════════════════════════════════════════════════════════

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("ix_log_user_date", "user_id", "created_at"),
        Index("ix_log_path_status", "path", "status_code"),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    ip = Column(String(50))
    method = Column(String(10))
    path = Column(String(255))

    status_code = Column(Integer)
    duration_ms = Column(Integer)

    user_agent = Column(String(512))

    created_at = Column(DateTime, server_default=func.now())

# ═══════════════════════════════════════════════════════════════
# PASSWORD RESET REQUESTS
# ═══════════════════════════════════════════════════════════════

class PasswordResetRequest(Base):
    __tablename__ = "password_reset_requests"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, index=True)
    status = Column(String(20), default="pending")  # pending / approved / rejected
    new_password = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())    