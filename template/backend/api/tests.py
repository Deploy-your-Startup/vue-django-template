from django.test import TransactionTestCase
from fastapi.testclient import TestClient

from api.factories import EntryFactory
from project.asgi import app


class HealthTests(TransactionTestCase):
    def test_health_endpoint(self):
        # GIVEN an empty database and the real ASGI application
        client = TestClient(app)

        # WHEN the API health endpoint is requested
        response = client.get("/api/health")

        # THEN the application responds successfully
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_public_entries_use_persisted_data(self):
        # GIVEN
        entry = EntryFactory.create(title="A first idea")
        # WHEN
        response = TestClient(app).get("/api/entries")
        # THEN
        self.assertEqual(response.json(), [{"id": entry.pk, "title": "A first idea"}])

    def test_private_write_requires_proxy_header(self):
        # GIVEN
        client = TestClient(app)
        # WHEN
        response = client.post("/private_api/entries", json={"title": "An idea"})
        # THEN
        self.assertEqual(response.status_code, 401)
        self.assertEqual(client.get("/api/entries").json(), [])

    def test_proxy_authenticated_write_is_publicly_readable(self):
        # GIVEN: trusted proxy has already verified the token
        client = TestClient(app)
        # WHEN
        response = client.post(
            "/private_api/entries",
            headers={"Authorization": "Bearer test-proxy-token"},
            json={"title": "An idea"},
        )
        # THEN
        self.assertEqual(response.status_code, 201)
        self.assertEqual(client.get("/api/entries").json(), [response.json()])
