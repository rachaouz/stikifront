import requests, os, logging
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()
logger = logging.getLogger(__name__)

def get_llm_url(model: str | None = None) -> str:
    gemma_url = os.getenv("LLM_API_URL_GEMMA", "").strip().rstrip("/")
    phi3_url  = os.getenv("LLM_API_URL_PHI3",  "").strip().rstrip("/")
    if model:
        m = model.lower()
        if "phi" in m:
            url = phi3_url
        elif "gemma" in m:
            url = gemma_url
        else:
            raise HTTPException(400, f"Modèle invalide: {model}")
    else:
        url = phi3_url or gemma_url
    if not url:
        raise HTTPException(503, f"LLM URL non configurée — vérifier .env")

    return url

def set_llm_api_url(url: str, model: str = "gemma") -> None:
    global LLM_API_URL_GEMMA, LLM_API_URL_PHI3
    url = (url or "").strip().rstrip("/")
    if "phi" in model.lower():
        LLM_API_URL_PHI3 = url
    else:
        LLM_API_URL_GEMMA = url

#Préparation des données pour le LLM
def _build_ti_data(ioc_type: str, raw_data: dict) -> dict:
    ioc_type = ioc_type.lower()
    if ioc_type == "ip":
        vt    = raw_data.get("virustotal", {})
        abuse = raw_data.get("abuseipdb", {})
        otx   = raw_data.get("otx", {})
        stats = vt.get("stats", {})
        return {
            "indicator":           raw_data.get("indicator"),
            "type": ioc_type,
            "country":             vt.get("country", "unknown"),
            "vt_verdict":          vt.get("verdict", "unknown"),
            "vt_malicious_count":  stats.get("malicious", 0),
            "vt_total_engines":    sum(stats.values()) if stats else 0,
            "vt_malware_families": vt.get("tags", []),
            "abuseipdb_score":     abuse.get("abuse_score", 0),
            "otx_pulse_count":     otx.get("pulse_count", 0),
            "otx_verdict":         otx.get("verdict", "unknown"),
            "final_verdict":       raw_data.get("final_verdict", "unknown")
        }

    elif ioc_type == "cve":
        return {
            "indicator":   raw_data.get("indicator"),
            "type":          ioc_type,
            "description":   raw_data.get("description", ""),
            "severity":      raw_data.get("severity", "N/A"),
            "cvss_score":    raw_data.get("cvss_score"),
            "cvss_vector":   raw_data.get("cvss_vector"),
            "cwe":           raw_data.get("cwe", []),
            "affected":      raw_data.get("affected", []),
            "final_verdict": raw_data.get("risk", {}).get("level", "unknown")
        }

    elif ioc_type == "hash":
        det = raw_data.get("detection", {})
        otx = raw_data.get("otx", {})
        mal = det.get("malicious") or 0
        sus = det.get("suspicious") or 0
        und = det.get("undetected") or 0
        return {
            "indicator":          raw_data.get("indicator"),
            "type":                 ioc_type,
            "file_type":            raw_data.get("file_type", "unknown"),
            "vt_malicious_count":   mal,
            "vt_suspicious":        sus,
            "vt_undetected":       und,
            "vt_total_engines":     mal + sus + und, 
            "vt_reputation":        raw_data.get("reputation_score", 0),
            "first_submission":     raw_data.get("first_submission", "unknown"),
            "mitre_attack":         [f["technique_name"] for f in (raw_data.get("mitre_attack") or [])[:3]],  # ← corriger
            "otx_pulse_count":      otx.get("pulse_count", 0),
            "otx_malware_families": otx.get("malware_families", []),
            "final_verdict":        raw_data.get("risk_level", "unknown"),
        }
    elif ioc_type == "domain":
        vt  = raw_data.get("virustotal", {})
        det = vt.get("detection", {})
        ht = raw_data.get("hackertarget", {})
        return {
            "indicator":          raw_data.get("indicator"),
            "type":               ioc_type,
            "registrar":          raw_data.get("registrar", "unknown"),
            "creation_date":      raw_data.get("creation_date", "unknown"),
            "ip_address":         raw_data.get("ip_address", "unknown"),
            "vt_malicious_count": det.get("malicious", 0),
            "vt_suspicious":      det.get("suspicious", 0),
            "vt_malware_families": list(vt.get("categories", {}).values())[:3],
            "subdomains_count":    ht.get("subdomains_count", 0),
            "vt_reputation":      vt.get("reputation_score", 0),
            "vt_risk_level":      vt.get("risk_level", "unknown"),
            "global_risk_level": raw_data.get("global_risk_level", "unknown"),
            "global_risk_score": raw_data.get("global_risk_score"),
            
        }
    elif ioc_type == "url":
        vt  = raw_data.get("vendors", {}).get("virustotal", {})
        gsb = raw_data.get("vendors", {}).get("google_safe_browsing", {})
        pt  = raw_data.get("vendors", {}).get("phishtank", {})
        return {
            "indicator":          raw_data.get("indicator"),
            "type":               ioc_type,
            "domain":             raw_data.get("domain", "unknown"),
            "ip":                 raw_data.get("ip", "unknown"),
            "vt_malicious_count": vt.get("malicious", 0),
            "vt_suspicious":      vt.get("suspicious", 0),
            "vt_verdict":         vt.get("verdict", "unknown"),
            "gsb_verdict":        gsb.get("verdict", "unknown"),
            "gsb_threats":        gsb.get("threats", []),
            "phishtank_verdict":  pt.get("verdict", "unknown"),
            "phishtank_verified": pt.get("verified", False),
            "final_verdict":      raw_data.get("final_verdict", "unknown"),
            "global_risk_level":  raw_data.get("global_risk_level", "unknown")
        }
    elif ioc_type == "mail":
        return {
            "indicator":     raw_data.get("indicator"),
            "type":          ioc_type,
            "domain":        raw_data.get("domaine", "unknown"),
            "mx_servers":    len(raw_data.get("mx", [])),
            "provider":      raw_data.get("fournisseur", "unknown"),
            "spf":           raw_data.get("spf", "absent"),
            "dmarc":         raw_data.get("dmarc", "absent"),
            "alerts":        raw_data.get("alertes", [])[:3],
            "score":         raw_data.get("score", 0),
            "final_verdict": raw_data.get("verdict", "unknown")
        }

    return {**raw_data, "type": ioc_type}

#Si le LLM est offline, elle calcule un score de risque par règles basées uniquement sur les données TI
def _fallback(ti_data: dict, reason: str) -> dict:
    score    = 0
    tags     = []
    ioc_type = ti_data.get("type", "ip")
    if ioc_type == "ip":
        vt  = ti_data.get("vt_malicious_count", 0)
        ab  = ti_data.get("abuseipdb_score", 0)
        otx = ti_data.get("otx_pulse_count", 0)
        if vt  > 30: score += 40; tags.append("malicious-vt")
        elif vt > 10: score += 20
        if ab  > 80: score += 35; tags.append("high-abuse")
        elif ab > 50: score += 15
        if otx > 5:  score += 25; tags.append("otx-high")
        elif otx > 0: score += 10
    elif ioc_type == "hash":
        vt = ti_data.get("vt_malicious_count", 0)
        if vt > 30:   score += 60; tags.append("malicious-vt")
        elif vt > 10: score += 35; tags.append("suspicious-vt")
        elif vt > 0:  score += 15
        if ti_data.get("otx_pulse_count", 0) > 0:
            score += 20; tags.append("otx-pulse")
    elif ioc_type == "domain":
        vt = ti_data.get("vt_malicious_count", 0)
        if vt > 5:   score += 40; tags.append("malicious-vt")
        elif vt > 0: score += 20
    elif ioc_type == "url":
        vt  = ti_data.get("vt_malicious_count", 0)
        gsb = ti_data.get("gsb_verdict", "clean")
        pt  = ti_data.get("phishtank_verdict", "clean")
        if vt > 3:             score += 40; tags.append("malicious-vt")
        if gsb == "malicious": score += 35; tags.append("google-sb")
        if pt  == "malicious": score += 30; tags.append("phishtank")
    elif ioc_type == "cve":
        cvss     = ti_data.get("cvss_score") or 0
        severity = ti_data.get("severity", "").upper()
        if severity == "CRITICAL" or cvss >= 9.0:
            score = 95; tags.append("critical-cve")
        elif severity == "HIGH" or cvss >= 7.0:
            score = 70; tags.append("high-cve")
        elif severity == "MEDIUM" or cvss >= 4.0:
            score = 45; tags.append("medium-cve")
        else:
            score = 20; tags.append("low-cve")
    elif ioc_type == "mail":
        mail_score = ti_data.get("score", 100)
        score = max(0, 100 - mail_score)
        alerts = ti_data.get("alerts", [])
        if "DMARC absent" in str(alerts): tags.append("no-dmarc")
        if "SPF absent"   in str(alerts): tags.append("no-spf")
    score = min(100, score)
    level = (
        "critical" if score >= 80 else
        "high"     if score >= 60 else
        "medium"   if score >= 40 else
        "low"      if score >= 20 else
        "clean"
    )
    sources_map = {
        "ip":     ["VirusTotal", "AbuseIPDB", "OTX"],
        "hash":   ["VirusTotal", "OTX"],
        "domain": ["VirusTotal", "hackertarget"],
        "url":    ["VirusTotal", "GoogleSafeBrowsing", "PhishTank"],
        "mail":   ["MXToolbox"],
        "cve":    ["CIRCL", "NVD"]
    }
    return {
        "threat_level": level,
        "score":        score,
        "summary":      f"Analyse par règles (LLM offline : {reason}).",
        "tags":         tags,
        "sources_ti":   sources_map.get(ioc_type, ["VirusTotal"]),
        "fallback":     True
    }

#Appel au LLM cas simple sans RAG 
def enrich_ioc(ioc_type: str, raw_data: dict, model: str | None = None) -> dict:
    ti_data = _build_ti_data(ioc_type, raw_data)
    url = get_llm_url(model)
    if not url:
        model_label = model or "inconnu"
        logger.warning(f"LLM URL non définie dans .env pour le modèle '{model_label}'")
        return _fallback(ti_data, reason=f"LLM URL manquante pour '{model_label}'")
    try:
        resp = requests.post(
            f"{url}/enrich",
            json=ti_data,
            timeout=60,
            headers={
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        )
        resp.raise_for_status()
        result = resp.json()
        result["fallback"] = False
        logger.info(f"LLM OK — {ti_data.get('indicator')} ({ioc_type}) → {result.get('threat_level')}")
        return result
    except requests.exceptions.Timeout:
        logger.warning("[LLM] Timeout")
        return _fallback(ti_data, reason="timeout")
    except requests.exceptions.ConnectionError:
        logger.warning("[LLM] Colab/ngrok inaccessible")
        return _fallback(ti_data, reason="Colab/ngrok inaccessible")
    except Exception as e:
        logger.error(f"[LLM] Erreur inattendue: {e}")
        return _fallback(ti_data, reason=str(e))

#appel LLM avec rag 
def enrich_with_rag(ioc, ioc_type, final_verdict, rag_docs, ti_data={}, model=None) -> dict:
    ti_data = {**ti_data, "type": ioc_type}
    url = get_llm_url(model)
    if not url:
        model_label = model or "inconnu"
        logger.warning(f"LLM URL non définie dans .env pour le modèle '{model_label}'")
        return _fallback(ti_data, reason=f"LLM URL manquante pour '{model_label}'")
    rag_preamble = (
        "Les extraits ci-dessous sont des notes internes génériques (détection / playbooks). "
        "Ils ne constituent pas une preuve de compromission. "
        "Si les mesures TI ci-dessous indiquent absence de détections malveillantes ou verdict bénin, "
        "ne pas augmenter threat_level ni recommander un blocage agressif sur la seule base de ces extraits.\n\n"
    )
    context_block = rag_preamble + "\n".join(
        f"[{r['source']}] (score={r['score']}) {r['text']}"
        for r in rag_docs
    ) if rag_docs else "Aucune donnée interne disponible."
    payload = {
        "indicator":     ioc,
        "type":          ioc_type,
        "rag_context":   context_block,
        "final_verdict": final_verdict,
    }
    if ioc_type == "ip":
        payload.update({
            "vt_malicious_count":  ti_data.get("vt_malicious_count", 0),
            "vt_total_engines":    ti_data.get("vt_total_engines", 0),
            "vt_verdict":          ti_data.get("vt_verdict", "unknown"),
            "vt_malware_families": ti_data.get("vt_malware_families", []),
            "abuseipdb_score":     ti_data.get("abuseipdb_score", 0),
            "otx_pulse_count":     ti_data.get("otx_pulse_count", 0),
            "country":             ti_data.get("country", "unknown"),
        })
        if str(final_verdict).strip().lower() == "suspicious":
            payload["triage_note"] = (
                "Verdict TI = suspicious (pas malicious confirmé). "
                "Réponse attendue : threat_level au plus « medium » ou « suspicious » ; "
                "éviter high/critical sans preuve explicite dans les champs TI."
            )
    elif ioc_type == "hash":
        payload.update({
            "vt_malicious_count":   ti_data.get("vt_malicious_count", 0),
            "vt_suspicious":        ti_data.get("vt_suspicious", 0),
            "file_type":            ti_data.get("file_type", "unknown"),
            "vt_reputation":        ti_data.get("vt_reputation", 0),
            "otx_pulse_count":      ti_data.get("otx_pulse_count", 0),
            "otx_malware_families": ti_data.get("otx_malware_families", []),
            "mitre_attack":         ti_data.get("mitre_attack", []),
        })
        if ti_data.get("vt_malicious_count", 0) == 0:
            payload["triage_note"] = (
                "IMPORTANT: VirusTotal shows 0 malicious detections. "
                "Final verdict is Clean. "
                "The RAG context above contains generic detection rules — "
                "they do NOT apply here since no engine flagged this file. "
                "threat_level MUST be 'low' or 'clean'. "
                "Summary must reflect that no threat was confirmed."
            )
    elif ioc_type == "domain":
        payload.update({
            "vt_malicious_count": ti_data.get("vt_malicious_count", 0),
            "vt_suspicious":      ti_data.get("vt_suspicious", 0),
            "vt_reputation":      ti_data.get("vt_reputation", 0),
            "global_risk_level":  ti_data.get("global_risk_level", "unknown"),
            "global_risk_score":  ti_data.get("global_risk_score"),
            "registrar":          ti_data.get("registrar", "unknown"),
        })
    elif ioc_type == "url":
        payload.update({
            "vt_malicious_count": ti_data.get("vt_malicious_count", 0),
            "vt_suspicious":      ti_data.get("vt_suspicious", 0),
            "vt_verdict":         ti_data.get("vt_verdict", "unknown"),
            "gsb_verdict":        ti_data.get("gsb_verdict", "unknown"),
            "phishtank_verdict":  ti_data.get("phishtank_verdict", "unknown"),
            "global_risk_level":  ti_data.get("global_risk_level", "unknown"),
        })
    elif ioc_type == "mail":
        alerts = ti_data.get("mxtoolbox_alerts") or ti_data.get("alerts", [])
        payload.update({
            "score":         ti_data.get("score", 0),
            "spf":           ti_data.get("spf", "unknown"),
            "dmarc":         ti_data.get("dmarc", "unknown"),
            "final_verdict": ti_data.get("final_verdict", "unknown"),
            "alerts":        alerts,
            "triage_note": (
                "IMPORTANT: Base your analysis ONLY on the TI signals provided above. "
                "Do NOT flag an email as malicious based on its name or domain appearance alone. "
                f"MXToolbox score={ti_data.get('score', 0)}/100 — "
                f"SPF={ti_data.get('spf', 'unknown')} — "
                f"DMARC={ti_data.get('dmarc', 'unknown')} — "
                f"alerts={len(alerts)} — "
                f"verdict={ti_data.get('final_verdict', 'unknown')}. "
                "If score >= 70 and alerts <= 3 and SPF/DMARC present → threat_level must be low or clean."
            )
        })
    elif ioc_type == "cve":
        payload.update({
            "cvss_score":  ti_data.get("cvss_score", "N/A"),
            "severity":    ti_data.get("severity", "unknown"),
            "description": ti_data.get("description", ""),
            "cwe":         ti_data.get("cwe", []),
        })
    try:
        resp = requests.post(
            f"{url}/enrich",
            json=payload,
            timeout=60,
            headers={
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        )
        resp.raise_for_status()
        data = resp.json()
        data["rag_used"] = True
        return data

    except requests.exceptions.Timeout:
        return _fallback(ti_data, reason="timeout")
    except requests.exceptions.ConnectionError:
        return _fallback(ti_data, reason="Colab/ngrok inaccessible")
    except Exception as e:
        return _fallback(ti_data, reason=str(e))