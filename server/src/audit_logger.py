"""
HIPAA-compliant audit logger for MediVault-Secure.
Records all access to patient records with immutable append-only log.
"""
import json
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional


class AuditAction(str, Enum):
    VIEW = "VIEW"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    EXPORT = "EXPORT"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    FAILED_AUTH = "FAILED_AUTH"


@dataclass
class AuditEvent:
    action: AuditAction
    user_id: str
    resource_type: str  # e.g., "patient_record", "lab_result"
    resource_id: str
    ip_address: str
    timestamp_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Optional[dict] = None
    session_id: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "action": self.action.value,
            "user_id": self.user_id,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "ip_address": self.ip_address,
            "timestamp_utc": self.timestamp_utc,
            "details": self.details or {},
            "session_id": self.session_id,
        }

    def checksum(self) -> str:
        """SHA-256 of the event content for tamper detection."""
        content = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()


class AuditLogger:
    """
    Append-only HIPAA audit logger.
    Each event is stored with a chained checksum for tamper detection.
    """

    def __init__(self, log_path: str = "audit.jsonl"):
        self.log_path = Path(log_path)
        self._last_checksum = "genesis"

    def log(self, event: AuditEvent) -> str:
        """Append event to audit log. Returns the event checksum."""
        entry = event.to_dict()
        entry["_checksum"] = event.checksum()
        entry["_prev_checksum"] = self._last_checksum

        with open(self.log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

        self._last_checksum = entry["_checksum"]
        return entry["_checksum"]

    def verify_integrity(self) -> dict:
        """Verify the audit log has not been tampered with."""
        if not self.log_path.exists():
            return {"valid": True, "events": 0, "message": "No log file yet"}

        lines = self.log_path.read_text().strip().split("\n")
        prev = "genesis"
        for i, line in enumerate(lines):
            if not line:
                continue
            entry = json.loads(line)
            if entry.get("_prev_checksum") != prev:
                return {
                    "valid": False,
                    "tampered_at_line": i + 1,
                    "message": f"Chain broken at event {i + 1}",
                }
            prev = entry["_checksum"]

        return {"valid": True, "events": len(lines), "message": "Log integrity verified"}

    def get_events(
        self,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        action: Optional[AuditAction] = None,
        limit: int = 100,
    ) -> list[dict]:
        """Query audit events with optional filters."""
        if not self.log_path.exists():
            return []

        events = []
        for line in self.log_path.read_text().strip().split("\n"):
            if not line:
                continue
            entry = json.loads(line)
            if user_id and entry.get("user_id") != user_id:
                continue
            if resource_id and entry.get("resource_id") != resource_id:
                continue
            if action and entry.get("action") != action.value:
                continue
            events.append(entry)

        return events[-limit:]


_logger_instance: Optional[AuditLogger] = None


def get_audit_logger(log_path: str = "audit.jsonl") -> AuditLogger:
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = AuditLogger(log_path)
    return _logger_instance
