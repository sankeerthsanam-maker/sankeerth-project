# Sankeeproject instructions

- Keep all project installations, runtimes, binaries, dependencies, model weights, tooling, and project-managed caches inside `/Volumes/EXTERNAL_US/sankeeproject`.
- Use `.local/runtimes`, `.local/tools`, and `.local/caches` for project-local installations and caches. Dependencies may live in package-local `node_modules` directories within this project.
- Inspect installer behavior and set explicit external paths before installing. If an installation cannot stay inside this project, stop and explain the limitation.
- Do not modify HOME, CODEX_HOME, global shell profiles, or unrelated app storage. Existing system tools can be invoked without installing replacements.
- Stop project operations if the external drive is unavailable; do not fall back to internal storage.
- The user approved application implementation and necessary project-local tool installation. Preserve the established folder structure and use reusable components.
- Keep the embeddable widget independent of the demo storefront. Shared code must not import from apps or the widget.
- Keep browser speech APIs behind the voice feature boundary and mock shopping behavior explicit.
- Distinguish planned features from implemented and verified behavior in documentation.
