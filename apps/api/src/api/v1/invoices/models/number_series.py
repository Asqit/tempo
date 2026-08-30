from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class NumberSeries(Base):
    __tablename__ = "number_series"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE")
    )
    counter: Mapped[int] = mapped_column(default=0)
    format_template: Mapped[str] = mapped_column(
        String(50), default="TEMPO-{year}-{counter:04d}"
    )
