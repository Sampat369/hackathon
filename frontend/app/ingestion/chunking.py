import re
def chunk_text(text: str, size=500, overlap=50):
    words=re.findall(r"\S+",text); out=[]; step=max(1,size-overlap)
    for start in range(0,len(words),step):
        part=" ".join(words[start:start+size])
        if part: out.append((part,start//step))
        if start+size>=len(words): break
    return out
