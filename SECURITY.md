# Security Policy

## Supported branch

Security fixes are applied to `main`. Deployments should be built only from reviewed commits whose required GitHub checks have passed.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue. Contact the repository owner privately with:

- affected route or component
- reproduction steps
- expected and actual behavior
- impact assessment
- suggested remediation, when available

Do not include production credentials, customer data, access tokens, private blob URLs, or database exports in reports.

## Production security requirements

Production must not start with example or missing secrets. At minimum:

- use Node.js 22
- use a 64-byte or stronger random JWT secret
- store the admin password as a bcrypt hash
- use a dedicated least-privilege database user
- keep `.env` outside version control and restrict its permissions
- use exact production origins for CORS
- run the dependency audit and security regression suite before deployment
- rotate credentials immediately after suspected exposure

## Secret rotation

When rotating a secret:

1. Generate the replacement using a cryptographically secure source.
2. Update the deployment secret store without committing the value.
3. restart or redeploy all application instances.
4. invalidate existing sessions when rotating authentication secrets.
5. verify health, login, database, upload, enquiry, and newsletter flows.
6. revoke the old credential after all instances use the replacement.

## Incident response

For a suspected incident:

1. Restrict access or disable the affected route.
2. Preserve relevant logs without copying secrets or personal data.
3. Rotate potentially exposed credentials.
4. identify the first affected deployment and affected records.
5. patch the root cause with a regression test.
6. verify the fix in production and document follow-up actions.
