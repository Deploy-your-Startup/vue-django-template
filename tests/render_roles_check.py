"""GIVEN the real template, WHEN Copier renders, THEN deployment contracts hold."""
from pathlib import Path
import shutil
import sys
import subprocess
import subprocess
from ansible.parsing.dataloader import DataLoader
from ansible.template import Templar, trust_as_template
from ansible.plugins.loader import init_plugin_loader
import tempfile

import copier
import json
import yaml

root = Path(sys.argv[1])
manifest = yaml.safe_load((root / "startup-template.yml").read_text())
assert manifest["schema"] == 1 and manifest["shared_cluster"] is True
assert manifest["authentication"] == "auth0"

with tempfile.TemporaryDirectory() as temporary:
    source = Path(temporary) / "source"
    generated = Path(temporary) / "generated"
    shutil.copytree(root, source, ignore=shutil.ignore_patterns(
        ".git", ".venv", "node_modules", "__pycache__", ".pytest_cache", "dist", ".ruff_cache"))
    copier.run_copy(str(source), str(generated), defaults=True, unsafe=True, quiet=True,
                    data={"project_name": "role-check", "base_domain": "example.com",
                          "github_username": "example", "deploy_ref": "codex/shared-cluster",
                          "kpis_website_id": "8d92b4ec-9a6a-4c50-85e4-b6ea4048f3f8"})
    workflows = list((generated / ".github/workflows").glob("*.yml"))
    callers = [yaml.safe_load(path.read_text()) for path in workflows]
    shared_jobs = [job for workflow in callers for job in workflow.get("jobs", {}).values()
                   if "/deploy-your-startup/" in job.get("uses", "")]
    assert len(shared_jobs) == 3
    assert all(job["uses"].endswith("@codex/shared-cluster") for job in shared_jobs)
    assert not any("§§deploy_your_startup.deploy_ref§§" in path.read_text() for path in workflows)
    # GIVEN a real generated backend, WHEN CI calls the shared harness,
    # THEN coverage is required and the portable instructions define its contract.
    backend_job = next(job for job in shared_jobs if job.get("with", {}).get("service") == "application")
    assert backend_job["with"]["run_e2e"] is True
    assert backend_job["with"]["e2e_shards"] == 2
    assert {item["service"] for item in json.loads(backend_job["with"]["services"])} == {"backend", "frontend"}
    assert backend_job["with"]["run_tests"] is True
    assert backend_job["with"]["require_coverage"] is True
    assert backend_job["with"]["coverage_measured_from"] == "Integration"
    assert "coverage/cobertura.xml" in (generated / "AGENTS.md").read_text()
    assert (generated / "docs/testing.md").is_file()
    assert not (generated / "docs/architecture/0007-coverage-report-contract.md").exists()
    playbook = yaml.safe_load((generated / "deployment/playbook.yml").read_text())
    tasks = [task for play in playbook for task in play.get("tasks", [])]
    copies = [task for task in tasks if task.get("name", "").startswith("copy ")]
    assert copies
    for task in copies:
        assert task["delegate_to"] == "localhost"
        assert task["become"] is False
        assert task["vars"]["ansible_python_interpreter"] == "{{ ansible_playbook_python }}"
    preparation = [task for task in tasks if task.get("import_role", {}).get("name") == "kubernetes-client"]
    assert preparation and preparation[0]["tags"] == "always"
    # GIVEN a rendered project, WHEN deploying backend alone, THEN database,
    # registry and TLS prerequisites are selected before the application.
    backend = next(i for i, task in enumerate(tasks) if task.get("name") == "deploy backend")
    for role in ("docker-secrets", "cert-manager", "postgres"):
        index = next(i for i, task in enumerate(tasks) if task.get("import_role", {}).get("name") == role)
        assert index < backend
        assert "backend" in tasks[index]["tags"].split(",")
    variables = yaml.load((generated / "deployment/group_vars/production.yml").read_text(), Loader=yaml.BaseLoader)
    assert variables["postgres_version"] == "18.6"
    dependency = (generated / "deployment/pyproject.toml").read_text()
    assert 'rev = "b5fd2595b01f58d726fbb91fc3159b2a2546187e"' in dependency
    # GIVEN the rendered deployment, WHEN its real locked CLI is run,
    # THEN SSH access and the cluster ownership guard work.
    subprocess.run(["bash", str(generated / "deployment/tests/ssh-access-integration_test.sh")], check=True)
    print("Real Copier render: pinned CLI, current Postgres and controller copies verified")

    # GIVEN the exact reviewed shared roles, WHEN loading the generated play,
    # THEN OAuth and KPI deployment consume shared roles without local copies.
    revision = (root / "tests/shared-roles.ref").read_text().strip()
    roles = Path(temporary) / "shared"
    subprocess.run(["git", "clone", "--quiet", "https://github.com/Deploy-your-Startup/deploy-template.git", str(roles)], check=True)
    subprocess.run(["git", "-C", str(roles), "checkout", "--quiet", revision], check=True)
    for role, toggle in (("oauth2-proxy", "oauth2_proxy_enabled"), ("kpis", "kpis_enabled")):
        imports = [task for task in tasks if task.get("include_role", {}).get("name") == role]
        assert len(imports) == 1 and imports[0]["tags"] == role
        assert toggle in imports[0]["when"]
        assert not (generated / role / "deployment").exists()
        assert not (generated / "deployment/roles" / role).exists()
        assert not any(task.get("ansible.builtin.copy", {}).get("dest", "").endswith(role) for task in tasks)
    variables = yaml.load((generated / "deployment/group_vars/all.yml").read_text(), Loader=yaml.BaseLoader)
    assert variables["oauth2_proxy_enabled"] == "false" and "oauth_enabled" not in variables
    assert variables["kpis_enabled"] == "false"
    assert variables["kpis_access_mode"] == "password"
    assert variables["kpis_allowed_emails"] == []
    assert variables["kpis_website_id"] == "8d92b4ec-9a6a-4c50-85e4-b6ea4048f3f8"
    for name in ("kpis_db_password", "kpis_app_secret", "kpis_admin_password"):
        production = yaml.load((generated / "deployment/group_vars/production.yml").read_text(), Loader=yaml.BaseLoader)
        assert production[name].startswith("$ANSIBLE_VAULT;")

    # GIVEN a freshly rendered project with its default settings,
    # WHEN executing the generated guards without credentials, THEN both roles
    # skip entirely; enabling KPI with a short password fails before apply.
    guarded = [task for task in tasks if task.get("include_role", {}).get("name") in ("oauth2-proxy", "kpis") or task.get("name") == "Require generated KPI credentials before deployment"]
    play = Path(temporary) / "guard.yml"
    play.write_text(yaml.safe_dump([{"hosts": "localhost", "connection": "local", "gather_facts": False, "vars_files": [str(generated / "deployment/group_vars/all.yml")], "tasks": guarded}]))
    import os
    env = {**os.environ, "ANSIBLE_ROLES_PATH": str(roles / "roles")}
    result = subprocess.run(["ansible-playbook", "-i", "localhost,", str(play)], env=env, capture_output=True, text=True)
    assert result.returncode == 0 and "skipped=3" in result.stdout, result.stdout + result.stderr
    result = subprocess.run(["ansible-playbook", "-i", "localhost,", str(play), "-e", '{"oauth2_proxy_enabled":false,"kpis_enabled":true,"kpis_admin_password":"short"}'], env=env, capture_output=True, text=True)
    assert result.returncode != 0 and "Apply kpis secret" not in result.stdout

    # GIVEN legacy bootstrap has retained a public marker in any KPI field,
    # WHEN KPI deployment is enabled, THEN it stops before executing the role.
    for missing in ("kpis_db_password", "kpis_app_secret", "kpis_admin_password"):
        credentials = {name: "synthetic-integration-secret" for name in
                       ("kpis_db_password", "kpis_app_secret", "kpis_admin_password")}
        credentials[missing] = "UNSET"
        import json
        result = subprocess.run(["ansible-playbook", "-i", "localhost,", str(play), "-e",
                                 json.dumps({"oauth2_proxy_enabled": False, "kpis_enabled": True, **credentials})],
                                env=env, capture_output=True, text=True)
        assert result.returncode != 0 and "Apply kpis secret" not in result.stdout
        assert "synthetic-integration-secret" not in result.stdout + result.stderr
    # GIVEN a generated startup without an enabled OAuth2 Proxy,
    # WHEN its owner selects OAuth KPI access, THEN the real shared role refuses
    # the configuration before any Kubernetes apply or Vault access.
    result = subprocess.run(["ansible-playbook", "-i", "localhost,", str(play), "-e", json.dumps({
        "oauth2_proxy_enabled": False, "kpis_enabled": True, "kpis_access_mode": "oauth2_proxy",
        "kpis_admin_password": "integration-admin-password", "kpis_db_password": "integration-db-password",
        "kpis_app_secret": "integration-secret"})], env=env, capture_output=True, text=True)
    assert result.returncode != 0 and "Apply kpis secret" not in result.stdout

    # GIVEN the generated empty reader list, WHEN the actual shared preflight
    # executes in OAuth mode, THEN access configuration must be explicit.
    guard_variables = yaml.safe_load((roles / "roles/kpis/defaults/main.yml").read_text())
    guard_variables.update({"kpis_access_mode": "oauth2_proxy", "oauth2_proxy_enabled": True,
                            "kpis_allowed_emails": variables["kpis_allowed_emails"],
                            "kpis_website_id": variables["kpis_website_id"],
                            "kpis_admin_password": "synthetic-admin-password",
                            "kpis_db_password": "synthetic-db-password",
                            "kpis_app_secret": "synthetic-app-secret"})
    guard_task = yaml.safe_load((roles / "roles/kpis/tasks/main.yml").read_text())[0]
    guard_play = Path(temporary) / "reader-guard.yml"
    for emails, allowed in (([], False), (["owner@example.com", "analyst+metrics@example.com"], True)):
        guard_variables["kpis_allowed_emails"] = emails
        guard_play.write_text(yaml.safe_dump([{"hosts": "localhost", "connection": "local",
            "gather_facts": False, "vars": guard_variables, "tasks": [guard_task]}]))
        result = subprocess.run(["ansible-playbook", "-i", "localhost,", str(guard_play)],
                                env=env, capture_output=True, text=True)
        assert (result.returncode == 0) is allowed, result.stdout + result.stderr

    # WHEN running the shipped runtime script, THEN strings stay exact and data
    # cannot become executable JavaScript, including quotes and line breaks.
    import json
    runtime = generated / "frontend/kpis-runtime-env.sh"
    hostile = 'https://example.test/";window.injected=true;//\n\\test'
    subprocess.run([str(runtime)], env={**os.environ, "DIST_FOLDER": str(generated / "frontend/public"), "KPIS_SCRIPT_URL": hostile, "KPIS_WEBSITE_ID": variables["kpis_website_id"]}, check=True)
    config = (generated / "frontend/public/config.js").read_text().splitlines()
    assert len(config) == 2
    assert json.loads(config[0].removeprefix("window.KPIS_SCRIPT_URL = ").removesuffix(";")) == hostile

    # WHEN rendering runtime tracking settings, THEN the toggle clears both.
    init_plugin_loader()
    template = (generated / "frontend/deployment/templates/deployment.yml").read_text()
    for enabled in (False, True):
        templar = Templar(loader=DataLoader(), variables={
            "kpis_enabled": enabled, "kpis_website_id": variables["kpis_website_id"],
            "base_domain": "example.com", "kpis_host": "metrics.example.com",
            "k8s_namespace": "sample", "project_name": "role-check",
            "docker_registry_host": "ghcr.io/example", "frontend_version": "test",
            "ansible_date_time": {"iso8601_basic": "20261011T120000"},
        })
        deployment = yaml.safe_load(templar.template(trust_as_template(template)))
        values = {item["name"]: item["value"] for item in deployment["spec"]["template"]["spec"]["containers"][0]["env"]}
        assert values == {"KPIS_SCRIPT_URL": "https://metrics.example.com/script.js" if enabled else "", "KPIS_WEBSITE_ID": variables["kpis_website_id"] if enabled else ""}
    print("Shared auth/KPI roles, executed off-switch, Vault seeds and runtime toggle verified")
