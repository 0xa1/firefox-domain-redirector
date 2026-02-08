# Changelog

## [1.0.0] - 2025-02-08

### Added
- Initial release
- Automatic domain redirection using declarativeNetRequest API
- Support for multiple redirect rules
- Exact domain matching (no subdomain support)
- Preservation of URL paths, query parameters, and hash fragments
- User-friendly options page for managing redirect rules
- Domain validation and duplicate detection
- Support for both HTTP and HTTPS protocols
- Real-time rule updates without extension reload
- Manifest V3 compatibility
- Minimum Firefox version: 140.0

### Features
- Add redirect rules through intuitive UI
- Delete rules with one click
- Visual feedback for rule operations
- Empty state display when no rules exist
- Responsive design for various screen sizes
- Accessible UI with ARIA labels

### Privacy
- No data collection or transmission
- All data stored locally using browser.storage.local
- No external network requests
- No analytics or tracking
