from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from services.ioc_analysis import analyze_indicator_for_user
from services.auth_service import get_current_user, get_db
from database.models import User
router = APIRouter()

class IOCRequest(BaseModel):
    indicator: str
    model: str | None = None 


class BulkIOCRequest(BaseModel):
    indicators: list[str] = Field(..., min_length=1)
    force_rag: bool = False


@router.post("/analyze")
def analyze(
    body: IOCRequest,
    force_rag: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = analyze_indicator_for_user(
        db, current_user.id, body.indicator.strip(), force_rag=force_rag,
        model=body.model
    )
    if not result["ok"]:
        return JSONResponse(result["error"], status_code=result["status_code"])
    return result["payload"]


@router.post("/bulk")
def bulk_analyze(
    body: BulkIOCRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results: list[dict] = []
    for raw in body.indicators:
        indicator = (raw or "").strip()
        if not indicator:
            results.append(
                {
                    "indicator": raw,
                    "ok": False,
                    "status_code": 400,
                    "error": {"error": "Indicateur vide"},
                }
            )
            continue
        r = analyze_indicator_for_user(
            db, current_user.id, indicator, force_rag=body.force_rag
        )
        if r["ok"]:
            results.append({"indicator": indicator, "ok": True, "data": r["payload"]})
        else:
            results.append(
                {
                    "indicator": indicator,
                    "ok": False,
                    "status_code": r["status_code"],
                    "error": r["error"],
                }
            )
    return {"count": len(results), "results": results}


