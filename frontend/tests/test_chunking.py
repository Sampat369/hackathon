from app.ingestion.chunking import chunk_text
def test_chunking_overlap_and_order():
    chunks=chunk_text(" ".join(f"w{i}" for i in range(120)),size=20,overlap=5)
    assert len(chunks)>1 and chunks[0][0].startswith("w0") and chunks[1][0].startswith("w15")
