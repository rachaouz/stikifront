from fastapi import APIRouter, Query, HTTPException, Depends
from services.ip_service import check_ip_reputation
from services.auth_service import get_current_user
import ipaddress
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import IOC, IOCSource, ScanHistory

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/", summary="IP Reputation Check")
def ip_route(
    param: str = Query(..., description="IPv4 or IPv6 address"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        ipaddress.ip_address(param)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address format")

    result = check_ip_reputation(param)

    try:
        ioc = db.query(IOC).filter_by(value=param, type="ip").first()
        if not ioc:
            ioc = IOC(
                value=param,
                type="ip",
                final_verdict=result.get("final_verdict"),
                risk_score=result.get("risk_score"),
                geo={
                    "country": result.get("virustotal", {}).get("country"),
                    "asn": result.get("abuseipdb", {}).get("asn"),
                    "isp": result.get("abuseipdb", {}).get("isp"),
                }
            )
            db.add(ioc)
            db.flush()

        if result.get("virustotal"):
            vt_src = db.query(IOCSource).filter_by(ioc_id=ioc.id, source="virustotal").first()
            if not vt_src:
                db.add(IOCSource(
                    ioc_id=ioc.id,
                    source="virustotal",
                    verdict=result["virustotal"].get("verdict"),
                    raw_data=result["virustotal"]
                ))

        if result.get("abuseipdb"):
            ab_src = db.query(IOCSource).filter_by(ioc_id=ioc.id, source="abuseipdb").first()
            if not ab_src:
                db.add(IOCSource(
                    ioc_id=ioc.id,
                    source="abuseipdb",
                    verdict=result["abuseipdb"].get("verdict"),
                    raw_data=result["abuseipdb"]
                ))

        db.add(ScanHistory(
            user_id=current_user.id,
            ioc_id=ioc.id,
            indicator=param,
            ioc_type="ip",
            final_verdict=result.get("final_verdict"),
            risk_score=result.get("risk_score"),
            llm_summary=str(result.get("llm_analysis", ""))
        ))
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"[IP ROUTER DB ERROR] {e}")

    return result