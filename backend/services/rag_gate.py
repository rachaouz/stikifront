from __future__ import annotations

def _lower(s) -> str:
    return str(s).lower() if s is not None else ""

def _as_int(x, default: int = 0) -> int:
    try:
        return int(x)
    except (TypeError, ValueError):
        return default

def _as_float(x, default: float = 0.0) -> float:
    try:
        return float(x)
    except (TypeError, ValueError):
        return default

#Elle extrait un dict de signaux normalisés depuis raw brut.
#C'est utile parce que build_rag_query en dépend aussi.
def collect_ti_signals(ioc_type: str, raw: dict) -> dict:
    """Extrait des signaux comparables depuis les payloads bruts des services."""
    t = _lower(ioc_type)
    out: dict = {"ioc_type": t}
    if not isinstance(raw, dict):
        return out
    if t == "domain":
        vt = raw.get("virustotal") or {}
        det = vt.get("detection") or {}
        out.update(
            {
                "verdict": _lower(raw.get("global_risk_level") or raw.get("final_verdict")),
                "global_risk_score": _as_int(raw.get("global_risk_score"), 999),
                "vt_malicious": _as_int(det.get("malicious")),
                "vt_suspicious": _as_int(det.get("suspicious")),
                "vt_reputation": _as_int(vt.get("reputation_score")),
            }
        )
    elif t == "ip":
        vt = raw.get("virustotal") or {}
        stats = vt.get("stats") or {}
        abuse = raw.get("abuseipdb") or {}
        otx = raw.get("otx") or {}
        out.update(
            {
                "verdict": _lower(raw.get("final_verdict")),
                "vt_malicious": _as_int(stats.get("malicious")),
                "vt_suspicious": _as_int(stats.get("suspicious")),
                "abuse_score": _as_int(abuse.get("abuse_score")),
                "otx_pulses": _as_int(otx.get("pulse_count")),
            }
        )
    elif t == "hash":
        det = raw.get("detection") or {}
        otx = raw.get("otx") or {}
        out.update(
            {
                "verdict": _lower(raw.get("risk_level") or raw.get("final_verdict")),
                "vt_malicious": _as_int(det.get("malicious")),
                "vt_suspicious": _as_int(det.get("suspicious")),
                "vt_reputation": _as_int(raw.get("reputation_score")),
                "otx_pulses": _as_int(otx.get("pulse_count")),
            }
        )
    elif t == "url":
        vendors = raw.get("vendors") or {}
        vt = vendors.get("virustotal") or {}
        gsb = vendors.get("google_safe_browsing") or {}
        pt = vendors.get("phishtank") or {}
        out.update(
            {
                "verdict": _lower(raw.get("final_verdict") or raw.get("global_risk_level")),
                "global_risk_score": _as_int(raw.get("global_risk_score"), 999),
                "vt_malicious": _as_int(vt.get("malicious")),
                "vt_suspicious": _as_int(vt.get("suspicious")),
                "gsb_verdict": _lower(gsb.get("verdict")),
                "phishtank_verdict": _lower(pt.get("verdict")),
            }
        )
    elif t == "mail":
        alertes = raw.get("alertes") or []
        n_alerts = len(alertes) if isinstance(alertes, list) else 0
        out.update(
            {
                "verdict": _lower(raw.get("verdict")),
                "mailbox_score": _as_int(raw.get("score"), 0),
                "alert_count": n_alerts,
            }
        )
    elif t == "cve":
        risk = raw.get("risk") or {}
        out.update(
            {
                "verdict": _lower(risk.get("level") or raw.get("severity")),
                "cvss": _as_float(raw.get("cvss_score")),
            }
        )
    return out

#. Elle construit la requête textuelle envoyée à ChromaDB
#Sans elle, le retrieval RAG n'a pas de query contextuelle
def build_rag_query(ioc_type: str, raw: dict, ti_data: dict) -> str:
    sig = collect_ti_signals(ioc_type, raw)
    t   = sig.get("ioc_type") or _lower(ioc_type)

    def _is_malicious() -> bool:
        v      = sig.get("verdict", "")
        vt_mal = sig.get("vt_malicious", 0)
        abuse  = sig.get("abuse_score", 0)
        grs    = sig.get("global_risk_score", 0)
        return (
            v in ("malicious", "high", "critical", "suspect", "suspicious")
            or vt_mal > 0
            or abuse > 50
            or grs > 50
        )
    malicious = _is_malicious()
    if t == "ip":
        vt_mal = sig.get("vt_malicious", 0)
        abuse  = sig.get("abuse_score", 0)
        otx    = sig.get("otx_pulses", 0)
        v      = sig.get("verdict", "unknown")
        if malicious:
            return (
                f"ip malicious detection block investigation "
                f"vt_malicious={vt_mal} abuseipdb_score={abuse} "
                f"otx_pulses={otx} verdict={v} "
                f"threat confirmed abuse botnet c2 command control"
            )
        return (
            f"ip clean benign legitimate no threat "
            f"vt_malicious={vt_mal} abuseipdb_score={abuse} "
            f"verdict={v} false positive whitelist"
        )
    elif t == "hash":
        vt_mal = sig.get("vt_malicious", 0)
        otx    = sig.get("otx_pulses", 0)
        v      = sig.get("verdict", "unknown")
        ft     = ti_data.get("file_type", "")
        if malicious:
            return (
                f"hash file malicious detection antivirus engines "
                f"vt_malicious={vt_mal} otx_pulses={otx} "
                f"verdict={v} file_type={ft} "
                f"malware trojan ransomware block quarantine"
            )
        return (
            f"hash file clean benign no detection "
            f"vt_malicious={vt_mal} verdict={v} "
            f"file_type={ft} safe no threat whitelist"
        )
    elif t == "domain":
        vt_mal = sig.get("vt_malicious", 0)
        grs    = sig.get("global_risk_score", 0)
        v      = sig.get("verdict", "unknown")
        cd     = ti_data.get("creation_date", "")
        if malicious:
            return (
                f"domain malicious phishing malware distribution "
                f"vt_malicious={vt_mal} global_risk_score={grs} "
                f"verdict={v} block suspicious typosquatting"
            )
        return (
            f"domain clean legitimate no threat "
            f"vt_malicious={vt_mal} global_risk_score={grs} "
            f"verdict={v} registration_context={cd} whitelist"
        )
    elif t == "url":
        vt_mal = sig.get("vt_malicious", 0)
        gsb    = sig.get("gsb_verdict", "n/a")
        pt     = sig.get("phishtank_verdict", "n/a")
        grs    = sig.get("global_risk_score", 0)
        v      = sig.get("verdict", "unknown")
        if malicious:
            return (
                f"url malicious phishing scam detection "
                f"vt_malicious={vt_mal} gsb={gsb} phishtank={pt} "
                f"global_risk_score={grs} verdict={v} "
                f"block redirect exploit drive-by"
            )
        return (
            f"url clean safe no threat "
            f"vt_malicious={vt_mal} gsb={gsb} phishtank={pt} "
            f"verdict={v} legitimate whitelist"
        )
    elif t == "mail":
        score   = sig.get("mailbox_score", 0)
        alerts  = sig.get("alert_count", 0)
        v       = sig.get("verdict", "unknown")
        if malicious:
            return (
                f"email phishing spoofing authentication failure "
                f"mailbox_score={score} alerts={alerts} verdict={v} "
                f"spf dmarc dkim missing typosquatting block"
            )
        return (
            f"email legitimate clean authentication valid "
            f"mailbox_score={score} alerts={alerts} verdict={v} "
            f"spf dmarc dkim present trusted sender"
        )
    elif t == "cve":
        cvss = sig.get("cvss", "N/A")
        v    = sig.get("verdict", "unknown")
        return (
            f"cve vulnerability severity={v} cvss={cvss} "
            f"patching prioritization exploitation risk management"
        )
    return f"{t} security threat analysis verdict={sig.get('verdict', 'unknown')}"