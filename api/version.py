"""
Version information reported by the API.

There are separate version numbers for:

- the REST interface (API_VERSION). All 1.x versions are served at /api/v1;
  increase the minor number for backwards-compatible changes, such as new query
  parameters or response fields, and record them in metadata.py.
- this implementation of it (SOFTWARE_VERSION), taken from api/codemeta.json,
  which is also the source for the EBRAINS Knowledge Graph and matches the
  git tags X.Y.Z.
- the running deployment (DEPLOYMENT): the commit and build time of the
  Docker image, passed in as build arguments by .gitlab-ci.yml.

The React component has its own version, in js/react/package.json.
"""

import json
import os

from .settings import BASE_DIR

API_VERSION = "1.2"

with open(os.path.join(BASE_DIR, "codemeta.json")) as fp:
    SOFTWARE_VERSION = json.load(fp)["version"]

DEPLOYMENT = {
    "commit": os.environ.get("GIT_COMMIT") or None,
    "built": os.environ.get("BUILD_DATE") or None,
}
