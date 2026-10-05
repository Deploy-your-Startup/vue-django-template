from api.models import Entry


def list_entries():
    return list(Entry.objects.order_by("id"))


def create_entry(title: str) -> Entry:
    return Entry.objects.create(title=title)
