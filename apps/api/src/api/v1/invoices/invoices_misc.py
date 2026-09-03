from enum import Enum


class InvoiceStatus(Enum):
    DRAFT = "draft"

    ISSUED = "issued"
    """issued is finished invoice, can't be edited"""

    PAID = "paid"
    """issued but marked as paid"""

    CANCELLED = "cancelled"
