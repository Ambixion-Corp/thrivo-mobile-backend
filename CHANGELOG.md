# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries are grouped by release. An `Unreleased` section at the top tracks
changes since the last tagged release and is updated automatically: a pull
request is opened on every merge to update it (see
`.github/workflows/update-changelog.yml`).

## [Unreleased]

### Changed

- grant write permission to changelog workflow ([#17](https://github.com/Ambixion-Corp/thrivo-mobile-backend/pull/17))
- fetch full git history so changelog generator can find last CHANGELOG.md commit ([#15](https://github.com/Ambixion-Corp/thrivo-mobile-backend/pull/15))
- add release process documentation ([#14](https://github.com/Ambixion-Corp/thrivo-mobile-backend/pull/14))

## [1.0.0] - initial

### Added
- Initial commit and backend bootstrap.
- CI setup: GitHub Actions, CodeQL, Dependabot (`.github/workflows`).
- CODEOWNERS configuration.
- Dependency updates (Dependabot): sqlite3 5.1.7 to 6.0.1, @types/node to
  26.1.2, @types/sqlite3 to 5.1.0, dotenv to 17.4.2, bcryptjs type bump.

[Unreleased]: https://github.com/Ambixion-Corp/thrivo-mobile-backend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Ambixion-Corp/thrivo-mobile-backend/releases/tag/v1.0.0