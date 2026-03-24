/**
 * TOOL CONFIGURATION
 *
 * Update these values for each new tool.
 * This is the single source of truth for tool-specific settings.
 */

export const TOOL_CONFIG = {
  /** Display name of the tool (e.g. "JSON Formatter") */
  name: 'Word Counter',

  /** Short tagline (e.g. "Format and validate JSON instantly") */
  tagline: 'Count words, characters & sentences instantly',

  /** Full URL of the deployed tool */
  url: 'https://free-word-counter.codama.dev/',

  /** localStorage key prefix to avoid collisions between tools */
  storagePrefix: 'codama-word-counter',
} as const
