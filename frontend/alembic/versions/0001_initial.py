"""Initial EvidenceIQ schema."""
from alembic import op
import sqlalchemy as sa
revision="0001_initial"; down_revision=None; branch_labels=None; depends_on=None
def upgrade():
    # Runtime startup creates the same metadata for zero-setup SQLite; this migration is the production path.
    from app.core.db import Base
    from app.models import models
    bind=op.get_bind(); Base.metadata.create_all(bind=bind)
def downgrade():
    from app.core.db import Base
    bind=op.get_bind(); Base.metadata.drop_all(bind=bind)
