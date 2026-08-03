import { loadSession } from '../changeset/session-store';
import { MAX_DIFF_SUMMARY_CHARS } from '../config/limits';

/**
 * Builds a compact, readable summary of a session's staged changes for the Reviewer/PM Tester
 * prompts. Deliberately not a real unified diff (no new diff-library dependency, per this repo's
 * preference for reusing what's already there — see the abandoned-cart automation PR for the
 * same principle) — a line-count delta plus full new content is enough context for an LLM
 * review pass, and the role still has read_file/search_code to dig deeper if needed.
 */
export function buildSessionDiffSummary(sessionId: string): string {
  const session = loadSession(sessionId);
  const paths = Object.keys(session.files);

  if (paths.length === 0) {
    return '(no staged files)';
  }

  const sections: string[] = [];

  for (const filePath of paths) {
    const staged = session.files[filePath];
    if (staged.pendingDelete) {
      sections.push(`### DELETE ${filePath}\n${staged.description || ''}`.trim());
      continue;
    }

    const newLines = staged.content.split('\n').length;
    const oldLines = staged.originalContent ? staged.originalContent.split('\n').length : 0;
    const delta = staged.type === 'new' ? `new file, ${newLines} lines` : `modified, ${oldLines} -> ${newLines} lines`;

    sections.push(
      [
        `### ${staged.type === 'new' ? 'NEW' : 'MODIFIED'} ${filePath} (${delta})`,
        staged.description ? `Description: ${staged.description}` : '',
        '```',
        staged.content,
        '```',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  const full = `Staged files (${paths.length}):\n\n${sections.join('\n\n')}`;

  if (full.length <= MAX_DIFF_SUMMARY_CHARS) return full;

  // Truncate from the end (keep earlier files intact) rather than mid-file, which would produce
  // invalid-looking code the model might mistake for the actual diff.
  return full.slice(0, MAX_DIFF_SUMMARY_CHARS) + `\n\n... [truncated — ${full.length - MAX_DIFF_SUMMARY_CHARS} more characters, use read_file/search_code to see the rest]`;
}
