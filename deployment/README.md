# Deployment

This directory contains configuration for building and deploying the Neo Viewer Docker image.

## Dockerfiles

There are three Dockerfiles, one per environment. All use a multi-stage build: Node builds the React demo app first, then the runtime image is assembled.

| File | Environment | Web server | Port | Notes |
|---|---|---|---|---|
| `Dockerfile.dev` | development | Uvicorn only | 8000 | Non-root; satisfies K8s `restricted:latest` PodSecurity |
| `Dockerfile.staging` | staging | Nginx + Supervisor + Uvicorn | 80 | Identical to prod; uses `globals-staging.js` for React build |
| `Dockerfile.prod` | production | Nginx + Supervisor + Uvicorn | 80 | |

### Dev image

Uvicorn serves everything on port 8000 as a non-root user (`appuser`, uid 1000):
- API endpoints under `/api/`
- React demo app under `/react/`
- Homepage and guides at `/`, `/angularjs`, `/guide_*`

Static file directories are configurable via environment variables:

| Variable | Default (relative to `api/`) | Docker value |
|---|---|---|
| `HOMEPAGE_DIR` | `../homepage` | `/home/docker/site/homepage` |
| `REACT_DIR` | `../js/react/demo/build` | `/home/docker/site/react` |

To run locally with static files served through uvicorn:
```bash
HOMEPAGE_DIR=homepage REACT_DIR=js/react/demo/build uvicorn api.main:app --reload
```

### Prod/staging images

Nginx handles static files and proxies `/api` requests to four Uvicorn workers via a Unix socket (`/tmp/uvicorn.sock`). Process supervision is handled by Supervisor.

## Nginx configuration

| File | Used by |
|---|---|
| `nginx-app.conf` | `Dockerfile.prod`, `Dockerfile.staging` |

## Supervisor configuration

`supervisor-app.conf` — used by prod/staging images. Starts Nginx and four Uvicorn workers. Uvicorn workers run as `www-data`.

## Kubernetes

K8s manifests are maintained separately. The dev image satisfies `PodSecurity "restricted:latest"` — run as non-root (`appuser`, uid 1000) with `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`, and `seccompProfile: RuntimeDefault`.

## CI/CD

`.gitlab-ci.yml` (at the repo root) builds and pushes images to `docker-registry.ebrains.eu/neuralactivity/neo-viewer:{dev,staging,prod}` when commits are pushed to the corresponding branches (`development`, `staging`, `main`).

GitHub Actions (`.github/workflows/ebrains.yml`) mirrors branches from GitHub to the EBRAINS GitLab instance, where the CI/CD pipeline runs.
