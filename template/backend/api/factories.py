import factory

from api.models import Entry


class EntryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Entry

    title = factory.Sequence(lambda number: f"Example {number}")
