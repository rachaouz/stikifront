/**
 * Utilitaires de construction du rapport IOC.
 *
 * buildReport() était définie dans useChat.js, mais elle n'a rien d'un
 * "effet de bord React" — c'est une transformation de données pure.
 * Sa place naturelle est dans utils/.
 */

/**
 * Construit l'objet `report` normalisé à partir de la réponse API du chatbot.
 * Centralisé ici pour que useChat.js reste lisible et pour pouvoir réutiliser
 * cette logique si d'autres composants en ont besoin.
 *
 * @param {object} data  - Réponse brute de chatbotApi.message()
 * @param {string} clean - L'indicateur IOC nettoyé (sans préfixe [TYPE])
 * @returns {object}     - Rapport normalisé
 */
export function buildReport(data, clean) {
  const ti = data.ti_summary || {};
  return {
    ioc:               clean,
    type:              data.type,
    verdict:           data.verdict?.threat_level  || "unknown",
    threat_level:      data.verdict?.threat_level  || "unknown",
    score:             data.verdict?.score         || 0,
    message:           data.message                || "",
    tags:              data.verdict?.tags          || [],
    isp:               ti.isp,
    asn:               ti.asn,
    country:           ti.country,
    vt_malicious:      ti.reputation?.virustotal?.malicious  ?? ti.detection?.virustotal?.malicious,
    vt_suspicious:     ti.reputation?.virustotal?.suspicious ?? ti.detection?.virustotal?.suspicious,
    vt_undetected:     ti.detection?.virustotal?.undetected,
    vt_tags:           ti.vt_tags         || [],
    vt_reputation:     ti.reputation?.vt_reputation,
    vt_votes:          ti.vt_votes,
    abuseipdb:         ti.reputation?.abuseipdb?.score,
    otx_pulses:        ti.reputation?.otx?.pulses ?? ti.detection?.otx?.pulses,
    associated_domains: ti.associated_domains || [],
    associated_files:   ti.associated_files   || [],
    ip_domain:          ti.ip,
    registrar:          ti.registrar,
    created:            ti.created,
    subdomains_count:   ti.subdomains_count,
    global_risk_score:  ti.global_risk_score,
    domain:             ti.domain,
    file_type:          ti.file_type,
    first_seen:         ti.first_seen,
    mitre_attack:       ti.mitre_attack || [],
    gsb_threats:        ti.detection?.google_safe_browsing?.threats || [],
    phishtank:          ti.detection?.phishtank?.verdict,
    mail_domain:        ti.domain,
    provider:           ti.provider,
    mx:                 ti.security?.mx,
    spf:                ti.security?.spf,
    dmarc:              ti.security?.dmarc,
    alerts:             ti.alerts      || [],
    severity:           ti.severity,
    cvss_score:         ti.cvss_score,
    cvss_vector:        ti.cvss_vector,
    cwe:                ti.cwe         || [],
    published:          ti.published,
    phishing_signals:   ti.phishing_signals || [],
    hosting_platform:   ti.hosting_platform,
  };
}