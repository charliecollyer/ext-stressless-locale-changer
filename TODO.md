# TODO

## Publish automatically to the Microsoft Edge Add-ons store

**Status:** not started

Set up automatic publishing of this extension to the Microsoft Edge Add-ons store using a GitHub Action.

### Context

- I use Microsoft Edge, not Chrome. The extension lives in `stressless-switcher/` (Manifest V3, plain JS, no build step).
- I want to publish it as a **hidden** listing on the Edge Add-ons store, which is free.
- I want to avoid anything that costs money.

### What I want

1. **A GitHub Actions workflow** in `.github/workflows/` that:
   - [ ] runs when I push a version tag (e.g. `v1.2.0`)
   - [ ] runs `npm test` first and stops if the tests fail
   - [ ] checks that the tag matches the `"version"` in `stressless-switcher/manifest.json`
   - [ ] zips the contents of `stressless-switcher/` (with `manifest.json` at the root of the zip)
   - [ ] uploads the zip with the Microsoft Edge Add-ons publishing API and submits it for review
   - [ ] reads all credentials from GitHub repository secrets, never hard-coded

2. **Check the API docs first.** Before writing the workflow, check the current Microsoft Edge Add-ons publishing API docs so the endpoints and auth method are up to date. Tell me if anything has changed from what you expected.

3. **A short step-by-step guide** for someone non-technical, in a new file `docs/PUBLISHING.md`, covering:
   - [ ] registering a free developer account in Microsoft Partner Center
   - [ ] doing the first submission by hand, if the API can only update an existing listing
   - [ ] setting the listing to hidden
   - [ ] getting the API credentials and adding them as GitHub secrets (with the exact secret names the workflow uses)
   - [ ] how to release an update: bump the version in `manifest.json`, commit, tag, push

4. **README link.** Add a link to the new guide in `README.md`.

### How to pick this up

Start a new session and say: "Do the Edge Add-ons publishing task in TODO.md." Remove this section from the file (or tick everything off) when it's done.
