#!/usr/bin/env node
/*
 * generate-changelog.js
 *
 * Updates the `Unreleased` section of CHANGELOG.md with new entries sourced
 * from commits merged into the default branch since the last CHANGELOG.md
 * update. Designed to be invoked by .github/workflows/update-changelog.yml.
 *
 * The script is GitHub-Actions-aware: when the latest commit was authored by
 * github-actions[bot] it exits early (no-op) to avoid infinite feedback loops
 * caused by the changelog-update PRs this workflow opens.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = process.cwd();
const CHANGELOG_PATH = path.join(REPO_ROOT, 'CHANGELOG.md');
const UNRELEASED_HEADER = '## [Unreleased]';

function git(args, opts = {}) {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
}

function log(message) {
  console.log(`[changelog] ${message}`);
}

// Bail out when this run was triggered by the changelog bot's own commit,
// preventing an infinite merge -> PR -> merge -> PR loop.
function isBotRun() {
  try {
    const author = git(['log', '-1', '--format=%an <%ae>']).trim();
    if (author.includes('github-actions[bot]') || author === 'github-actions[bot]') {
      return true;
    }
  } catch (err) {
    log(`warn: could not read last commit author (${err.message}); continuing.`);
  }
  return false;
}

// Find the most recent commit that modified CHANGELOG.md (any branch history
// visible to us). Returns a full 40-char SHA, or null if none exists yet.
function lastChangelogCommitSha() {
  try {
    const sha = git(['log', '--max-count=1', '--format=%H', '--', 'CHANGELOG.md']).trim();
    return sha || null;
  } catch (err) {
    return null;
  }
}

// Extract PR number from a commit subject line like
// "feat: do a thing (#123)" or "Merge pull request #123 from ...".
function extractPrNumber(subject) {
  const m = subject.match(/#(\d+)/);
  return m ? m[1] : null;
}

// Build a human-readable bullet from a commit subject + optional PR number.
function toBullet(subject) {
  const prNumber = extractPrNumber(subject);
  // Strip the trailing "(#NNN)" / " (#NNN)" / "(#NNN): " noise.
  const cleaned = subject
    .replace(/\s*\(#[0-9]+\)\s*$/, '')
    .replace(/\s*#([0-9]+)\s*$/, '')
    .trim();
  const prefix = classify(cleaned);
  const summary = cleaned.split(':').length > 1 ? cleaned.replace(/^[^:]+:\s*/, '') : cleaned;
  const suffix = prNumber ? ` ([#${prNumber}](https://github.com/${process.env.GITHUB_REPOSITORY}/pull/${prNumber}))` : '';
  return `- ${prefix}${summary}${suffix}`;
}

// Derive an Added/Changed/Removed/Changed label from conventional commit prefix.
function classify(subject) {
  const lower = subject.toLowerCase();
  if (lower.startsWith('feat') ) return '';
  if (lower.startsWith('fix')) return '';
  if (lower.startsWith('docs')) return '';
  if (lower.startsWith('perf')) return '';
  if (lower.startsWith('refactor')) return '';
  if (lower.startsWith('build')) return '';
  return '';
}

// Group bullets into Added / Changed / Removed based on the commit prefix.
function categorize(subject, prNumber) {
  const lower = subject.toLowerCase();
  let group = 'Changed';
  if (lower.startsWith('feat')) group = 'Added';
  else if (lower.startsWith('fix') || lower.startsWith('perf')) group = 'Changed';
  else if (lower.startsWith('refactor') || lower.startsWith('build') || lower.startsWith('chore') || lower.startsWith('deps')) group = 'Changed';
  else if (lower.startsWith('revert')) group = 'Changed';
  else if (lower.includes('dependabot')) group = 'Changed';
  return group;
}

function collectNewEntries() {
  const sinceSha = lastChangelogCommitSha();
  // `git log` prints newest-first. We stop at the last changelog commit.
  const range = sinceSha ? `${sinceSha}..HEAD` : 'HEAD';
  let logOutput;
  try {
    logOutput = git([
      'log',
      '--no-merges',
      '--pretty=format:%s',
      range,
    ]);
  } catch (err) {
    log(`warn: git log failed (${err.message}); assuming no new entries.`);
    return null;
  }

  const lines = logOutput.split('\n').filter((line) => {
    if (!line) return false;
    // Ignore noise: CI, bot housekeeping, and our own changelog PRs.
    const lower = line.toLowerCase();
    if (lower.includes('[skip ci]')) return false;
    return true;
  });

  const entries = { Added: [], Changed: [], Removed: [] };
  for (const subject of lines) {
    const group = categorize(subject, extractPrNumber(subject));
    entries[group].push(toBullet(subject));
  }
  return entries;
}

function hasEntries(entries) {
  return (entries.Added.length + entries.Changed.length + entries.Removed.length) > 0;
}

function buildUnreleasedBlock(entries) {
  const parts = [];
  parts.push('## [Unreleased]');
  parts.push('');
  if (entries.Added.length) {
    parts.push('### Added');
    parts.push('');
    for (const b of entries.Added) parts.push(b);
    parts.push('');
  }
  if (entries.Changed.length) {
    parts.push('### Changed');
    parts.push('');
    for (const b of entries.Changed) parts.push(b);
    parts.push('');
  }
  if (entries.Removed.length) {
    parts.push('### Removed');
    parts.push('');
    for (const b of entries.Removed) parts.push(b);
    parts.push('');
  }
  return parts.join('\n');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceUnreleasedBlock(original, block) {
  // Replace the existing "## [Unreleased]" section up to the next release
  // header. Brackets in the header must be escaped so they match literally.
  const unreleasedRe = new RegExp(
    escapeRegExp(UNRELEASED_HEADER) + '[\\s\\S]*?(?=\\n## \\[)',
  );
  if (unreleasedRe.test(original)) {
    return original.replace(unreleasedRe, () => block);
  }
  // No existing Unreleased header: insert one before the first *release*
  // header (skip an Unreleased header if present and unmatched).
  const firstRelease = original.search(/## \[[0-9]/);
  if (firstRelease === -1) {
    return `${block}\n\n${original}`;
  }
  return `${original.slice(0, firstRelease)}${block}\n\n${original.slice(firstRelease)}`;
}

function main() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    log('ERROR: CHANGELOG.md not found. Create one first.');
    process.exit(1);
  }

  if (isBotRun()) {
    log('Last commit was made by github-actions[bot]; skipping to avoid loops.');
    process.exit(0);
  }

  const entries = collectNewEntries();
  if (!entries || !hasEntries(entries)) {
    log('No new entries since the last CHANGELOG.md update; nothing to do.');
    process.exit(0);
  }

  const original = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const block = buildUnreleasedBlock(entries);
  const updated = replaceUnreleasedBlock(original, block);
  fs.writeFileSync(CHANGELOG_PATH, updated, 'utf8');
  log(`Updated CHANGELOG.md with ${entries.Added.length} Added, ` +
      `${entries.Changed.length} Changed, ` +
      `${entries.Removed.length} Removed entries.`);
  process.exit(0);
}

main();
