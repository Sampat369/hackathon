from pathlib import Path
def extract(path: str, mime: str):
    p=Path(path); ext=p.suffix.lower()
    if ext==".pdf":
        import pdfplumber
        with pdfplumber.open(p) as pdf: return [(page.extract_text() or "", {"page":i+1}) for i,page in enumerate(pdf.pages)]
    if ext==".docx":
        from docx import Document
        return [("\n".join(x.text for x in Document(p).paragraphs), {})]
    if ext in {".eml",".msg"}:
        from email import policy
        from email.parser import BytesParser
        msg=BytesParser(policy=policy.default).parsebytes(p.read_bytes()); body=msg.get_body(preferencelist=("plain",)); return [(f"From: {msg.get('From','')}\nTo: {msg.get('To','')}\nDate: {msg.get('Date','')}\nSubject: {msg.get('Subject','')}\n\n{body.get_content() if body else msg.get_payload()}", {"email_headers":dict(msg.items())})]
    if ext in {".png",".jpg",".jpeg"}:
        import pytesseract
        from PIL import Image
        return [(pytesseract.image_to_string(Image.open(p)), {})]
    return [(p.read_text(errors="replace"), {})]
