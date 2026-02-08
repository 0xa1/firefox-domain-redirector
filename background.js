// Background script for managing dynamic redirect rules using declarativeNetRequest

/**
 * Loads redirect rules from storage
 * @returns {Promise<Array>} Array of rule objects
 */
async function loadRulesFromStorage() {
  try {
    const result = await browser.storage.local.get('rules');
    return result.rules || [];
  } catch (error) {
    console.error('Error loading rules from storage:', error);
    return [];
  }
}

/**
 * Builds a regex pattern for the source domain (exact match, both http/https)
 * @param {string} sourceDomain - The source domain (e.g., "aaa.com")
 * @returns {string} Regex pattern
 */
function buildRegexPattern(sourceDomain) {
  // Remove protocol if present
  let domain = sourceDomain.replace(/^https?:\/\//, '');
  // Remove trailing slash
  domain = domain.replace(/\/$/, '');
  // Escape dots for regex
  const escapedDomain = domain.replace(/\./g, '\\.');
  // Build pattern: match http OR https, exact domain, capture rest
  return `^https?://${escapedDomain}(.*)`;
}

/**
 * Normalizes target domain to ensure it has a protocol
 * @param {string} targetDomain - The target domain
 * @returns {string} Normalized target domain with protocol
 */
function normalizeTargetDomain(targetDomain) {
  // If already has protocol, remove trailing slash and return
  if (targetDomain.startsWith('http://') || targetDomain.startsWith('https://')) {
    return targetDomain.replace(/\/$/, '');
  }
  // Default to http
  return 'http://' + targetDomain.replace(/\/$/, '');
}

/**
 * Converts a redirect rule to declarativeNetRequest format
 * @param {Object} rule - Rule object with id, sourceDomain, targetDomain
 * @returns {Object} declarativeNetRequest rule
 */
function buildRedirectRule(rule) {
  const regexFilter = buildRegexPattern(rule.sourceDomain);
  const normalizedTarget = normalizeTargetDomain(rule.targetDomain);

  return {
    id: rule.id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution: `${normalizedTarget}\\1`
      }
    },
    condition: {
      regexFilter: regexFilter,
      resourceTypes: [
        "main_frame",
        "sub_frame",
        "xmlhttprequest",
        "stylesheet",
        "script",
        "image",
        "font",
        "object",
        "media",
        "other"
      ]
    }
  };
}

/**
 * Updates dynamic rules in declarativeNetRequest
 * @param {Array} rules - Array of redirect rules
 */
async function updateDynamicRules(rules) {
  try {
    // Get existing dynamic rules
    const existingRules = await browser.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);

    // Build new rules
    const newRules = rules.map(rule => buildRedirectRule(rule));

    // Update rules: remove all existing, add new ones
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: newRules
    });

    console.log(`Dynamic rules updated. Added ${newRules.length} rules.`);
    console.log('Rules:', newRules);
  } catch (error) {
    console.error('Error updating dynamic rules:', error);
  }
}

/**
 * Main function to rebuild all redirect rules
 */
async function rebuildRules() {
  console.log('Rebuilding redirect rules...');
  const rules = await loadRulesFromStorage();
  console.log(`Loaded ${rules.length} rules from storage:`, rules);
  await updateDynamicRules(rules);
}

// Initialize rules on extension startup
rebuildRules();

// Listen for storage changes and rebuild rules
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.rules) {
    console.log('Rules changed in storage, rebuilding...');
    rebuildRules();
  }
});

console.log('Domain Redirector extension background script loaded.');
