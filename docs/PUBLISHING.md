# Publishing to the Microsoft Edge Add-ons store

The extension is published as a **hidden** listing on the Edge Add-ons store. Only people with the link can find it, and everyone who installs it gets updates automatically.

There are two parts:

- **One-time setup** (steps 1–5): create the listing by hand and connect it to GitHub.
- **Releasing an update** (step 6): push a version tag and GitHub does the rest.

> Check with your manager or IT before the first submission. The extension uses the Stressless name and logo, and a hidden listing is still on a public store.

---

## 1. Create a Microsoft Partner Center developer account

1. Go to the [Partner Center dashboard for Edge](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd).
2. Sign in with a Microsoft account and follow the steps to register as a Microsoft Edge extension developer. Microsoft's guide: [Register as a Microsoft Edge extension developer](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account).

Use an account you'll keep. If colleagues will rely on the extension, a work account is better than a personal one.

## 2. Make the first submission by hand

The publishing API can only update an existing listing, so the first upload is manual.

1. **Make the zip.** It must contain the files inside `stressless-switcher/`, not the folder itself, so that `manifest.json` is at the top level of the zip. From the repo folder in Terminal:

   ```bash
   cd stressless-switcher && zip -r ../stressless-switcher.zip . -x '.*' && cd ..
   ```

   Or ask Claude: "Make the store zip for the extension."

2. In Partner Center, go to **Microsoft Edge > Overview** and click **Create new extension**. Upload the zip.
3. Fill in each section in the left menu until it shows **Complete**. Partner Center marks which fields are required. Notes:
   - **Store listings:** the name and short description come from `manifest.json`. You'll also need a store logo. The current `icon.png` is 128×128, so you may need a larger version; Partner Center states the size it accepts.
   - **Properties / privacy:** the extension only stores your favourites locally in the browser and doesn't collect or send personal data.

## 3. Set the listing to hidden

In the listing's left menu, go to **Availability**. Under **Visibility**, choose **Hidden**, then click **Save & Continue**. Then click **Publish** to send the first version for review. Review can take up to **7 business days**.

Once it's approved, copy the listing's store URL. That's the link you share with colleagues.

## 4. Get the API credentials

1. In Partner Center, under the Microsoft Edge program, open **Publish API**.
2. If you see **Enable** next to the new experience, click it.
3. Click **Create API credentials**. This can take a few minutes.
4. Note down the **Client ID** and the **API key**. The key is only shown once.
5. Note the key's **Expiry** date shown on that page, and put a reminder in your calendar. When it expires, releases will fail with an "HTTP 401" error until you create a new key and update the GitHub secret.
6. Find the **Product ID**: go to **Microsoft Edge > Overview**, select the extension, and look in the **Extension identity** section. It's a long code like `d34f98f5-f9b7-42b1-bebb-98707202b21d`.

## 5. Add the credentials to GitHub

Never paste these into a chat with Claude or commit them to the repo. Add them on the GitHub website:

1. Open the repo on GitHub and go to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add each of these, using exactly these names:

   | Secret name | Value |
   |---|---|
   | `EDGE_PRODUCT_ID` | The Product ID from step 4 |
   | `EDGE_CLIENT_ID` | The Client ID from step 4 |
   | `EDGE_API_KEY` | The API key from step 4 |

## 6. Release an update

Do this after the first version has been approved.

1. Make your changes and check them in the browser.
2. Raise the `"version"` in `stressless-switcher/manifest.json`, for example from `4.3` to `4.4`. Each release needs a new version number.
3. Commit and push to `main`.
4. Tag the release with the same version, prefixed with `v`, and push the tag:

   ```bash
   git tag v4.4
   ```

   ```bash
   git push origin v4.4
   ```

   Or ask Claude: "Release version 4.4 to the Edge store."

Pushing the tag starts the **Publish to Edge Add-ons** workflow (see the repo's **Actions** tab). It runs the tests, checks the tag matches `manifest.json`, zips the extension, uploads it and submits it for review. If any step fails, nothing is submitted.

After Microsoft approves it (up to 7 business days), Edge updates the extension for everyone who installed it.

### If the workflow fails

| Error | What it means |
|---|---|
| Tag does not match manifest.json version | The tag and the `"version"` in `manifest.json` differ. Fix one and push a new tag. |
| Repository secret ... is not set | A secret from step 5 is missing or misnamed. |
| HTTP 401 | The API key is wrong or has expired. Create a new one (step 4) and update `EDGE_API_KEY`. |
| HTTP 404 | The Product ID is wrong. |
| `InProgressSubmission` | A previous version is still in review. Wait until it's approved, then re-run the workflow from the Actions tab. |
| `NoModulesUpdated` | Nothing changed since the last submission. |
