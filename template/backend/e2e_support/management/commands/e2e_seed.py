"""Local-only factory bridge for isolated E2E tests; never installed in production."""

import json
import os
import sys

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.forms.models import model_to_dict

from api.factories import EntryFactory

# An explicit list rather than importing whatever name the plan contains: tests
# reach exactly the factories the backend itself uses, and nothing else.
FACTORIES = {"Entry": EntryFactory}


def serialize(obj) -> dict:
    """Renders a model for the calling test suite.

    Anything JSON cannot hold on its own (datetimes above all) becomes a string;
    the tests compare against what the browser shows anyway.
    """
    fields = {
        name: value
        if isinstance(value, int | float | bool | type(None))
        else str(value)
        for name, value in model_to_dict(obj).items()
    }
    return {**fields, "pk": obj.pk, "str": str(obj)}


def resolve(value, created_by_name: dict):
    """Replaces {"$ref": "name"} with the object created earlier under that name.

    A name refers to the object when the entry created one, otherwise to the
    list; "name.0" picks a single one out of a batch. It resolves to the real
    instance rather than a primary key, so a factory's SubFactory is overridden
    instead of firing as well.
    """
    if isinstance(value, dict) and "$ref" in value:
        reference = value["$ref"]
        name, _, index = reference.partition(".")
        if name not in created_by_name:
            raise CommandError(f"unknown reference {reference!r}")
        objects = created_by_name[name]
        if index:
            return objects[int(index)]
        if len(objects) != 1:
            raise CommandError(
                f"reference {reference!r} points at {len(objects)} objects - "
                f"use {reference}.0 to pick one"
            )
        return objects[0]
    if isinstance(value, dict):
        return {key: resolve(item, created_by_name) for key, item in value.items()}
    if isinstance(value, list):
        return [resolve(item, created_by_name) for item in value]
    return value


class Command(BaseCommand):
    help = "Seed the database for an end-to-end test run (reads a JSON plan on stdin)"

    def handle(self, *args, **options):
        # Belt and braces: the app is not installed in production, but if someone
        # adds it there by hand the command still refuses.
        if os.getenv("PRODUCTION"):
            raise CommandError("e2e_seed refuses to run with PRODUCTION set")

        try:
            plan = json.load(sys.stdin)
        except json.JSONDecodeError as error:
            raise CommandError(f"seed plan is not valid JSON: {error}") from error

        if plan.get("flush"):
            # Every test starts on empty tables - the same guarantee the backend
            # tests run under.
            call_command("flush", "--noinput", verbosity=0)

        created_by_name: dict[str, list] = {}
        created: list[list[dict]] = []

        for item in plan.get("create", []):
            name = item.get("factory")
            if name not in FACTORIES:
                raise CommandError(
                    f"unknown factory {name!r}, available: {', '.join(sorted(FACTORIES))}"
                )
            kwargs = resolve(item.get("kwargs", {}), created_by_name)
            objects = FACTORIES[name].create_batch(item.get("count", 1), **kwargs)

            if item.get("name"):
                created_by_name[item["name"]] = objects
            created.append([serialize(obj) for obj in objects])

        self.stdout.write(
            json.dumps(
                {
                    "created": created,
                    "named": {
                        name: [serialize(obj) for obj in objects]
                        for name, objects in created_by_name.items()
                    },
                }
            )
        )
