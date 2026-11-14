# EvidenceIQ — AI-Powered Digital Evidence Intelligence Platform

EvidenceIQ is an enterprise-grade digital evidence intelligence platform designed to ingest, verify, analyze, and synthesize large volumes of digital evidence (PDFs, contracts, email threads, Slack chats, audio/video recordings, and institutional documents).

Files remain in immutable, read-only storage with cryptographic SHA-256 verification and append-only custody tracking. AI output is investigative assistance only, requiring human verification, and does not constitute a legal conclusion.

---

## Architecture Overview

```
evidenceiq/
├── app/                  # FastAPI Backend (Python 3.11+, SQLAlchemy, Ollama RAG)
│   ├── api/routes.py     # REST & SSE streaming endpoints
│   ├── core/             # Database, config, security, prompt definitions
│   ├── ingestion/        # Chunking and document processing
│   ├── models/           # Models (Case, EvidenceFile, Chunk, Entity, Timeline, etc.)
│   ├── parsers/          # Text/OCR extraction
│   ├── rag/              # Local Ollama LLM & embedding streaming
│   └── services/         # Storage, custody logs, and background ingestion
├── src/                  # React 18 + TypeScript Frontend (Vite, Tailwind, Radix)
│   ├── api/              # Typed REST client & endpoints
│   ├── app/              # Router, AppShell, Zustand state store
│   ├── components/       # UI primitives & layout (Sidebar, TopBar)
│   ├── features/         # Feature modules (cases, evidence, chat, timeline, graph, etc.)
│   ├── hooks/            # TanStack Query & SSE streaming hooks
│   ├── lib/              # Formatters, icons, and utilities
│   ├── mocks/            # MSW (Mock Service Worker) handlers & legal test data
│   └── types/            # Strict TypeScript domain interfaces
├── alembic/              # Database migrations
├── docker-compose.yml    # Docker services (API + Ollama)
└── package.json          # Frontend scripts and dependencies
```

---

## Quickstart

### 1. Frontend (React 18 + Vite)

The frontend includes a built-in Mock Service Worker (MSW) so it can run immediately without requiring local backend/Ollama services.

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server (MSW mock enabled by default)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- `VITE_USE_MOCKS=true` runs with realistic mock cases (*Harrison v. Meridian Corp*, *DataBreach 2024*).
- `VITE_USE_MOCKS=false` connects to the live FastAPI backend at `http://localhost:8000/api/v1`.

### 2. Backend (FastAPI + Ollama)

```bash
# Setup Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -e .[test]

# Start local Ollama models
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# Run FastAPI server
uvicorn app.main:app --reload
```

The interactive OpenAPI docs are accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Docker (Full Stack)

```bash
docker compose up --build
```

Pull Ollama models inside the container:
```bash
docker compose exec ollama ollama pull llama3.1:8b
docker compose exec ollama ollama pull nomic-embed-text
```

---

## Key Features & Pages

1. **Case Management Dashboard** (`/cases`): Register, edit, and organize cases with real-time status chips and dual grid/list views.
2. **Evidence Repository & Uploader** (`/cases/:id/evidence`): Drag-and-drop multi-file upload, SHA-256 cryptographic integrity verification, and duplicate flags.
3. **Evidence Viewer** (`/cases/:id/evidence/:id`): Deep-linkable multi-format exhibit preview (PDF pages, email headers, chat bubbles, audio waveforms), text chunks, and append-only chain of custody log.
4. **AI Evidence Assistant** (`/cases/:id/chat`): SSE-streamed conversational AI strictly grounded in verified exhibits with interactive citation chips `[1]` and source inspector panel.
5. **Timeline Chronology** (`/cases/:id/timeline`): Vertical chronological reconstruction grouped by date with precision tags (exact/approximate) and source document links.
6. **Entity Relationship Graph** (`/cases/:id/entities`): Interactive network visualization connecting actors, corporate entities, communications, and locations with entity deduplication/merging.
7. **Inconsistency Review Queue** (`/cases/:id/inconsistencies`): Side-by-side contradiction cards with source links, severity tags, and reviewer note fields.
8. **Duplicate Detection** (`/cases/:id/duplicates`): Matched duplicate and near-duplicate groups with similarity scoring and side-by-side comparison.
9. **Investigation Summary Brief** (`/cases/:id/summary`): Structured executive legal brief with key people, dates, events, inconsistencies, and Markdown/PDF export.
10. **Command Palette** (`⌘K` / `Ctrl+K`): Global instant search across all cases, evidence chunks, metadata, and transcripts.

---

## Available Scripts

- `npm run dev`: Starts the Vite development server with hot-module reloading.
- `npm run build`: Type-checks and compiles production frontend into `dist/`.
- `npm run test`: Runs Vitest test suite.
- `npm run preview`: Previews the production build locally.
