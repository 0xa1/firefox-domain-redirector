// Options page logic for managing redirect rules

/**
 * Loads all redirect rules from storage
 * @returns {Promise<Array>} Array of rule objects
 */
async function loadRules() {
  try {
    const result = await browser.storage.local.get('rules');
    const rules = result.rules || [];
    renderRulesList(rules);
    return rules;
  } catch (error) {
    console.error('Error loading rules:', error);
    showStatus('Error loading rules', 'error');
    return [];
  }
}

/**
 * Renders the list of rules in the UI
 * @param {Array} rules - Array of rule objects
 */
function renderRulesList(rules) {
  const rulesList = document.getElementById('rules-list');
  const emptyState = document.getElementById('empty-state');

  // Clear existing content
  rulesList.innerHTML = '';

  if (rules.length === 0) {
    rulesList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  rulesList.style.display = 'block';
  emptyState.style.display = 'none';

  // Create rule elements
  rules.forEach(rule => {
    const ruleElement = document.createElement('div');
    ruleElement.className = 'rule-item';
    ruleElement.innerHTML = `
      <div class="rule-content">
        <span class="rule-source">${escapeHtml(rule.sourceDomain)}</span>
        <span class="rule-arrow">→</span>
        <span class="rule-target">${escapeHtml(rule.targetDomain)}</span>
      </div>
      <button class="btn-delete" data-rule-id="${rule.id}" aria-label="Удалить правило">
        ❌
      </button>
    `;

    // Attach delete event listener
    const deleteBtn = ruleElement.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => deleteRule(rule.id));
    deleteBtn.setAttribute('aria-label', 'Delete rule');

    rulesList.appendChild(ruleElement);
  });
}

/**
 * Adds a new redirect rule
 * @param {Event} event - Form submit event
 */
async function addRule(event) {
  event.preventDefault();

  const sourceInput = document.getElementById('source-domain');
  const targetInput = document.getElementById('target-domain');

  const sourceDomain = sourceInput.value.trim();
  const targetDomain = targetInput.value.trim();

  // Validate source domain
  const sourceValidation = validateDomain(sourceDomain, true);
  if (!sourceValidation.valid) {
    showStatus(sourceValidation.error, 'error');
    sourceInput.focus();
    return;
  }

  // Validate target domain
  const targetValidation = validateDomain(targetDomain, false);
  if (!targetValidation.valid) {
    showStatus(targetValidation.error, 'error');
    targetInput.focus();
    return;
  }

  // Normalize domains for comparison
  const normalizedSource = normalizeDomain(sourceDomain);
  const normalizedTarget = normalizeDomain(targetDomain);

  // Check if source equals target
  if (normalizedSource === normalizedTarget) {
    showStatus('Source and target domains must be different', 'error');
    return;
  }

  // Load existing rules
  const existingRules = await loadRules();

  // Check for duplicate source domain
  if (checkDuplicateSource(normalizedSource, existingRules)) {
    showStatus('Rule for this domain already exists', 'error');
    return;
  }

  // Generate unique ID
  const ruleId = generateRuleId(existingRules);

  // Create new rule object
  const newRule = {
    id: ruleId,
    sourceDomain: normalizedSource,
    targetDomain: targetDomain.trim()
  };

  // Add to rules array
  const updatedRules = [...existingRules, newRule];

  // Save to storage
  try {
    await browser.storage.local.set({ rules: updatedRules });

    // Clear form inputs
    sourceInput.value = '';
    targetInput.value = '';

    // Reload and render rules list
    await loadRules();

    showStatus('Rule added successfully', 'success');
  } catch (error) {
    console.error('Error saving rule:', error);
    showStatus('Error saving rule', 'error');
  }
}

/**
 * Deletes a redirect rule by ID
 * @param {number} ruleId - The ID of the rule to delete
 */
async function deleteRule(ruleId) {
  try {
    // Load existing rules
    const result = await browser.storage.local.get('rules');
    const existingRules = result.rules || [];

    // Filter out the rule with matching ID
    const updatedRules = existingRules.filter(rule => rule.id !== ruleId);

    // Save updated rules to storage
    await browser.storage.local.set({ rules: updatedRules });

    // Reload and render rules list
    await loadRules();

    showStatus('Rule deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting rule:', error);
    showStatus('Error deleting rule', 'error');
  }
}

/**
 * Validates a domain string
 * @param {string} domain - The domain to validate
 * @param {boolean} isSource - Whether this is a source domain (no protocol required)
 * @returns {Object} Validation result with valid flag and error message
 */
function validateDomain(domain, isSource) {
  if (!domain) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  // Remove protocol for validation
  let cleanDomain = domain.replace(/^https?:\/\//, '');
  cleanDomain = cleanDomain.replace(/\/$/, '');

  if (!cleanDomain) {
    return { valid: false, error: 'Invalid domain format' };
  }

  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

  if (!domainRegex.test(cleanDomain)) {
    return { valid: false, error: 'Invalid domain format. Use format: example.com' };
  }

  // For target domain, check if protocol is present
  if (!isSource && !domain.startsWith('http://') && !domain.startsWith('https://')) {
    return {
      valid: false,
      error: 'Target domain must include protocol (http:// or https://)'
    };
  }

  return { valid: true };
}

/**
 * Normalizes a domain for comparison
 * @param {string} domain - The domain to normalize
 * @returns {string} Normalized domain
 */
function normalizeDomain(domain) {
  // Remove protocol
  let normalized = domain.replace(/^https?:\/\//, '');
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  // Lowercase
  normalized = normalized.toLowerCase();
  return normalized;
}

/**
 * Checks if a source domain already exists in rules
 * @param {string} sourceDomain - The normalized source domain
 * @param {Array} existingRules - Array of existing rules
 * @returns {boolean} True if duplicate exists
 */
function checkDuplicateSource(sourceDomain, existingRules) {
  return existingRules.some(rule =>
    normalizeDomain(rule.sourceDomain) === sourceDomain
  );
}

/**
 * Generates a unique rule ID
 * @param {Array} existingRules - Array of existing rules
 * @returns {number} Unique rule ID
 */
function generateRuleId(existingRules) {
  if (existingRules.length === 0) return 1;
  const maxId = Math.max(...existingRules.map(r => r.id));
  return maxId + 1;
}

/**
 * Shows a status message to the user
 * @param {string} message - The message to display
 * @param {string} type - Message type: 'success' or 'error'
 */
function showStatus(message, type) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = `status-message status-${type}`;
  statusElement.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load and display existing rules
  loadRules();

  // Attach form submit handler
  const form = document.getElementById('add-rule-form');
  form.addEventListener('submit', addRule);
});
