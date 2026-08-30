# IssuedInvoice (Samotný Doklad)
# 1. ClientID
# 2. Date of issue
# 3. Date of maturity
# 4. Date of taxing
# 5. payment option
# 6. currency + Exchange rate
# 7. current status: draft, issued, paid, overdue, cancelled
# 8. document number: from NumberSeries (legal requirement!)


# IssuedInvoiceItem (Položka faktury)
# 1. name
# 2. unit price
# 3. amount
# 4. unit
# 5. VAT rate
# -- optionally values directly collected from time-entries

# NumerSeries (číselná řada)
# 1. prefix + format + counter, per-workspace
# -- MUST BE IN ORDER, TRANSACTIONAL LOCKING IS REQUIRED!!!
