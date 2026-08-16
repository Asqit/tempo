# Tempo — Reports & Invoice Spec

Status: Draft v1
Scope: Reports (live + saved) a jejich vztah k budoucímu Invoice systému

---

## 1. Koncept

Dvě oddělené entity, které spolu **nesouvisí přes FK constraint** — invoice může, ale nemusí vzniknout z reportu.

| Entita           | Persistence       | Účel                                                |
| ---------------- | ----------------- | --------------------------------------------------- |
| **Live Report**  | žádná (query)     | rychlá analýza dat v UI                             |
| **Saved Report** | frozen snapshot   | archivovaný timesheet, důkazní materiál pro klienta |
| **Invoice**      | frozen, separátní | finální fakturační dokument                         |

---

## 2. Live Report (query, no persistence)

```
GET /reports?from=&to=&client_id=&project_id=&billable=
```

- Počítá se on-the-fly z `TimeEntry`
- Nic se nezapisuje do DB
- Response: agregovaná data (hours, earnings, entries list)

**Filtry:**

- `from` / `to` (povinné — časový rozsah)
- `client_id` (volitelné)
- `project_id` (volitelné)
- `billable: true|false` (volitelné)

---

## 3. Saved Report (freeze snapshot)

Vzniká akcí "Save" nad live reportem. Server **znovu spustí query** a zamrazí výsledek.

### Tabulky

```python
class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"))
    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)

    name: Mapped[str] = mapped_column(String(128))          # bylo 32 — moc těsné
    description: Mapped[str] = mapped_column(String(512))    # bylo 64 — moc těsné

    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    status: Mapped[str] = mapped_column(String(16), default="finalized")  # draft | finalized | stale
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    snapshots: Mapped[list["ReportEntrySnapshot"]] = relationship(
        cascade="all, delete-orphan"
    )


class ReportEntrySnapshot(Base):
    __tablename__ = "report_entry_snapshots"
    __table_args__ = (
        UniqueConstraint("report_id", "time_entry_id", name="uq_report_entry"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))

    # Nullable — snapshot přežije i smazání originálu
    time_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("time_entries.id", ondelete="SET NULL"), nullable=True
    )
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )

    # Frozen fields
    description: Mapped[str] = mapped_column(String(256))
    duration_minutes: Mapped[int]
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    billable: Mapped[bool] = mapped_column(default=True)
    rate: Mapped[int | None]        # v haléřích/centech, frozen at snapshot time
    amount: Mapped[int | None]      # rate * duration, precomputed a frozen
```

### Poznámky k designu

- **`rate` + `amount` musí být frozen** — jinak nejde report/timesheet použít jako podklad pro fakturaci ani jako důvěryhodný dokument pro klienta.
- **`project_id` v snapshotu** — jinak se ztrácí kontext při smazání/přesunu projektu.
- **`UniqueConstraint(report_id, time_entry_id)`** — brání duplicitě entry v jednom reportu.
- **`status: stale`** — vlajka pro "originální data se od uložení změnila" (viz refresh flow níže).

---

## 4. Refresh / staleness detekce

Explicitní `PUT /reports/{id}/refresh` endpoint zatím **není** — zjišťujeme jen, jestli je report stale.

### Detekční mechanismus: set diff (ne checksum)

```python
def check_staleness(report: Report) -> dict:
    current_entries = query_same_filters(
        report.period_start, report.period_end,
        report.client_id, ...  # + project/billable filtry uložené na reportu
    )

    old_ids = {s.time_entry_id for s in report.snapshots if s.time_entry_id}
    new_ids = {e.id for e in current_entries}

    added = new_ids - old_ids
    removed = old_ids - new_ids

    # modified = entries, které v obou setech jsou, ale updated_at > report.created_at
    modified = {
        e.id for e in current_entries
        if e.id in old_ids and e.updated_at > report.created_at
    }

    return {"added": added, "removed": removed, "modified": modified}
```

**Proč set diff, ne checksum:** checksum jen řekne "něco se změnilo", set diff rovnou dá UI-ready data pro "3 přidány, 1 odebrána, 2 upraveny" dialog.

**Kdy se volá:** lazy, při otevření saved reportu (ne cron/background job — zatím netřeba).

### Refresh flow (otevřená otázka — TBD při implementaci)

Možnosti k rozhodnutí:

- (a) Report je navždy immutable, refresh = vytvoří se nový Report
- (b) Refresh přepíše snapshoty in-place, `status` se resetuje na `finalized`
- (c) Konflikt UI: user vidí diff, vybere co promítnout

→ **Rozhodnutí odloženo**, není blokující pro MVP (stačí zobrazit "stale" badge).

---

## 5. Invoice (separátní entita)

- **Nezávislá na Report/ReportEntrySnapshot** — žádný FK vztah
- Vzniká buď manuálně, nebo z reportu **zkopírováním dat na frontendu** (uživatel klikne "Generate Invoice" z reportu → data se pošlou jako payload pro `POST /invoices`)
- Jakmile existuje, žije úplně nezávisle — editace time entries, projektů, ani reportů ji nijak neovlivní

_(Detailní schema Invoice — TBD, samostatná spec)_

---

## 6. Otevřené otázky pro další iteraci

- [ ] Refresh flow rozhodnutí (viz sekce 4)
- [ ] Invoice ↔ Report copy payload — přesný formát
- [ ] PDF export pro saved report (timesheet pro klienta)
- [ ] Draft vs finalized status — kdy se saved report dá ještě editovat?
