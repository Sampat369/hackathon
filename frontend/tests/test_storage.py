from app.services.storage import safe_name
def test_filename_sanitized():
    assert safe_name("../../secret file.pdf")=="secret_file.pdf"
