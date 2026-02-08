# DNR Domain Redirector - Firefox Extension

Automatically redirect HTTP/HTTPS requests from one domain to another while preserving all URL components (path, query parameters, hash).

## Features

- ✓ Automatic domain redirection with exact domain matching
- ✓ Support for multiple redirect rules
- ✓ Preserves all URL components (pathname, search, hash)
- ✓ User-friendly interface for managing rules
- ✓ Domain validation and duplicate detection
- ✓ Uses Manifest V3 and declarativeNetRequest API
- ✓ No data collection - completely private

## Installation

### From addons.mozilla.org
Enter "DNR Domain Redirector" at addons.mozilla.org

### For Development
1. Open Firefox
2. Navigate to: `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Select the `manifest.json` file

## Usage

### Adding a Redirect Rule

1. Click the extension icon in the toolbar
2. Enter the **Source Domain** (without protocol): e.g., `example.com`
3. Enter the **Target Domain** (with protocol): e.g., `http://test.local`
4. Click **"Add Rule"**

### Examples

**Example 1: Basic redirect**
- Rule: `example.com` → `http://test.local`
- Result: `https://example.com/page?id=123` → `http://test.local/page?id=123`

**Example 2: Protocol change**
- Rule: `oldsite.com` → `https://newsite.com`
- Result: `http://oldsite.com/contact#form` → `https://newsite.com/contact#form`

### Important Notes

**Exact Domain Matching:**
- The extension works only with exact domain matches (no subdomains)
- `example.com` will be redirected
- `www.example.com` will NOT be redirected
- Create separate rules for each subdomain if needed

**Protocols:**
- **Source Domain:** No protocol required (matches both HTTP and HTTPS)
- **Target Domain:** Protocol required (`http://` or `https://`)

## Permissions Explanation

This extension requires the following permissions:

- **declarativeNetRequest**: To intercept and redirect requests based on your rules
- **declarativeNetRequestWithHostAccess**: To access domain information for matching
- **storage**: To save your redirect rules locally in your browser
- **host_permissions (<all_urls>)**: To match any domain you configure for redirection

**Privacy:** This extension does NOT collect, transmit, or store any personal data. All redirect rules are saved locally in your browser. See [PRIVACY.md](PRIVACY.md) for details.

## Technical Details

- **Manifest Version:** 3
- **API:** declarativeNetRequest
- **Storage:** browser.storage.local (local only)
- **Rule Limit:** Up to 5000 dynamic rules (Firefox limitation)
- **Minimum Firefox Version:** 140.0

## Troubleshooting

### Redirect Not Working
1. Verify the rule is displayed in the list
2. Check for typos in the domain name
3. Open browser console (Ctrl+Shift+J) and check for errors
4. Try reloading the extension

### Infinite Redirect Loop
- Ensure the target domain doesn't redirect back to the source
- Check that source and target domains are different

## Development

### View Active Rules
In browser console:
```javascript
browser.declarativeNetRequest.getDynamicRules().then(console.log)
```

## License

This extension is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Privacy

See [PRIVACY.md](PRIVACY.md) for our privacy policy.

## Support

For issues or questions, please open an issue on GitHub:
https://github.com/0xa1/firefox-domain-redirector

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

