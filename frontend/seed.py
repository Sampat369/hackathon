"""Create a small local demo corpus. Files are intentionally synthetic."""
from pathlib import Path
from datetime import datetime
import hashlib, json
ROOT=Path("data/demo"); ROOT.mkdir(parents=True,exist_ok=True)
(ROOT/"email-thread.eml").write_text("From: alice@example.test\nTo: bob@example.test\nDate: Tue, 02 Jan 2024 10:00:00 +0000\nSubject: Meeting\n\nThe meeting happened on 2024-01-02.")
(ROOT/"whatsapp.txt").write_text("02/01/2024, 10:05 - Bob: We met on 03/01/2024.\n02/01/2024, 10:06 - Alice: I agree.")
(ROOT/"duplicate.txt").write_text((ROOT/"whatsapp.txt").read_text())
print(json.dumps({"files":[str(p) for p in ROOT.iterdir()],"note":"Synthetic corpus includes a planted date inconsistency and exact duplicate."},indent=2))
