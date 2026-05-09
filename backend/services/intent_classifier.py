"""permet de classer chaque message dans l’une des trois catégories suivantes :
IOC (Indicator of Compromise) : indicateurs techniques comme une adresse IP, un hash ou une URL
Question : question liée à la cybersécurité
Off-topic : message non pertinent"""

import json
import re
from pathlib import Path
from services.ioc_analysis import detect_type

# Chargement des mots-clés
_KW_PATH = Path(__file__).parent.parent / "cybersec_keywords.json"
with open(_KW_PATH, encoding="utf-8") as f:
    _RAW = json.load(f)

# Flatten + normalisation
_ALL_KEYWORDS = [
    kw.lower().strip()
    for category in _RAW.get("cybersecurity_keywords", {}).values()
    for kw in category
]

_ALL_KEYWORDS.sort(key=len, reverse=True)
# Regex pour mots complets (évite "patch" dans "dispatch")
_KEYWORD_PATTERNS = [
    re.compile(rf"\b{re.escape(kw)}\b", re.IGNORECASE)
    for kw in _ALL_KEYWORDS
]
# Outils TI connus (pas toujours dans les keywords génériques)
_TI_TOOLS = re.compile(
    r"\b(virustotal|abuseipdb|otx|shodan|censys|greynoise|urlscan|"
    r"alienvault|threatfox|malwarebazaar|hybrid.analysis|any\.run|"
    r"pulsedive|recorded.future|mandiant|crowdstrike)\b",
    re.IGNORECASE
)
 
# IOC embarqué dans une phrase (ex: "analyze 8.8.8.8", "check domain evil.com")
_IOC_IN_SENTENCE = re.compile(
    r"\b(\d{1,3}(?:\.\d{1,3}){3}"       # IPv4
    r"|[a-f0-9]{32,64}"                   # hash MD5/SHA
    r"|(?:[a-z0-9-]+\.)+[a-z]{2,6}"      # domaine
    r"|https?://\S+)\b",                  # URL
    re.IGNORECASE
)
 
# Messages de suivi court (more, details, explain, suite...)
_FOLLOWUP = re.compile(
    r"^(more|plus|detail|explain|elaborate|continue|suite|"
    r"développe|précise|donne|montre|encore|go on|and|et alors|"
    r"tell me more|what else|quoi d.autre|approfondis)",
    re.IGNORECASE
)
 
# Patterns de question explicite
_QUESTION_REGEX = re.compile(
    r"(\?$"
    r"|^(what|how|why|when|where|who|which|is |are |does |do |can |"
    r"qu[' ]|c[' ]est|comment|pourquoi|explique|définition|"
    r"difference|différence|que veut dire|kesako|kézako|signifie))",
    re.IGNORECASE
)
 
 
# ── Fonctions de détection ────────────────────────────────────────────────────
 
def contains_cyber_keyword(text: str) -> bool:
    """Vérifie si le texte contient un mot-clé du fichier JSON."""
    return any(p.search(text) for p in _KEYWORD_PATTERNS)
 
 
def contains_ti_tool(text: str) -> bool:
    """Vérifie si le texte mentionne un outil de Threat Intelligence."""
    return bool(_TI_TOOLS.search(text))
 
 
def contains_ioc_in_sentence(text: str) -> bool:
    """Détecte un IOC embarqué dans une phrase (ex: 'analyze 8.8.8.8')."""
    return bool(_IOC_IN_SENTENCE.search(text))
 
 
def is_followup(text: str) -> bool:
    """Détecte un message de suivi court."""
    return bool(_FOLLOWUP.search(text)) and len(text.split()) <= 8
 
 
# ── Classificateur principal ──────────────────────────────────────────────────
 
def classify_message(message: str) -> str:
    msg       = message.strip()
    msg_lower = msg.lower()
 
    # 1. IOC pur — ex: "8.8.8.8", "d41d8cd98f00b204e9800998ecf8427e"
    if detect_type(msg_lower) != "unknown":
        return "ioc"
 
    # 2. IOC dans une phrase — ex: "analyze 8.8.8.8", "is evil.com malicious?"
    if contains_ioc_in_sentence(msg):
        return "question"
 
    # 3. Suivi conversationnel — ex: "more details", "explain more", "suite"
    if is_followup(msg):
        return "question"
 
    # 4. Mot-clé cybersec du JSON — ex: "red team", "phishing", "aes"
    if contains_cyber_keyword(msg_lower):
        return "question"
 
    # 5. Outil TI mentionné — ex: "abuseipdb", "virustotal", "otx pulses"
    if contains_ti_tool(msg_lower):
        return "question"
 
    # 6. Question explicite avec contexte cyber implicite
    #    ex: "what does a score of 85 mean?" → pas de keyword mais c'est une question
    if _QUESTION_REGEX.search(msg) and len(msg.split()) >= 4:
         if contains_cyber_keyword(msg_lower) or contains_ti_tool(msg_lower):
             return "question"
    return "off_topic"
 
    # 7. Off-topic
    return "off_topic"