# Security Policy

## Supported versions

The latest store release(s) and the newest `purpura_chromium.zip` / `purpura_firefox.zip` from Releases are the only supported builds. Fixes land there first; older builds are not patched.

## Reporting a vulnerability

Do not open a public issue. Use **Security → Report a vulnerability** on this repository, which opens a private advisory visible only to maintainers. If that form is not available to you, ask a maintainer on the [Discord](https://discord.gg/TT4sgtEkNV) for a private channel rather than filing publicly.

Please include the Purpura version, browser, the URL you were on, and reproduction steps or a proof of concept. Expect an acknowledgement before any fix ships; coordinated disclosure is appreciated.

## Scope

Purpura runs content scripts on roblox.com and calls Roblox's own APIs using the session the browser already has. The most valuable reports are:

- Anything that lets page content or another extension reach Purpura's privileged APIs or stored settings.
- Session or token handling, request signing, and anything that could leak credentials off-device.
- Injected UI that a page can steer — unescaped HTML, URLs built from untrusted page data, `innerHTML` on remote strings.
- Permission changes, or update/release artifacts that do not match the published checksums.

Out of scope: Roblox account problems, bugs in Roblox itself, and issues that depend on a modified local install.
