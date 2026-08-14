# Release Process

This document describes how releases are tracked for this repository.

## Changelog

The `CHANGELOG.md` file at the repository root is maintained automatically.

- Every merge to the default branch triggers the **Update Changelog** workflow.
- The workflow collects merged pull request commits since the last changelog update,
  categorizes them under the `## [Unreleased]` section, and opens a pull request with
  the proposed changes.
- Category mapping:
  - `feat:` commits are listed under **Added**
  - `fix:` and `perf:` commits are listed under **Changed**
  - other conventional-commit types are listed under **Changed**

## Versioning

Releases follow [Semantic Versioning](https://semver.org/). When preparing a release,
move the entries from `## [Unreleased]` into a new versioned section and update the
version heading.
