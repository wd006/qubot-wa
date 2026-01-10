# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/wd006/qubot-wa/compare/v2.3.0...v3.0.0) (2026-01-10)


### ⚠ BREAKING CHANGES

* **core:** The 'src/config.js' file structure has been altered.
The flat 'AI' object is replaced with nested 'AI.LLM' and 'AI.MEDIA'
objects. Existing configurations must be updated to the new schema.
Additionally, new environment variables (HF_KEY, POLLINATIONS_KEY) are
now required to utilize the specific image providers fully.

* **core:** overhaul AI layer & add media gen ([bf9cefa](https://github.com/wd006/qubot-wa/commit/bf9cefa2e06fe8ed91ddb6ad665bc4289c803ad9))

## [2.3.0](https://github.com/wd006/qubot-wa/compare/v2.2.0...v2.3.0) (2026-01-10)


### Features

* **actions:** implement basic AI image generation ([a708b69](https://github.com/wd006/qubot-wa/commit/a708b69d6e0fc615518a16cf5f4ad00e53eba069))
* **actions:** implement img-to-sticker generation ([1f19a28](https://github.com/wd006/qubot-wa/commit/1f19a28fcad863f0cf4f3cf9c6b662d40adb0eec))
* **repl:** add 'clear' command to clean terminal ([7caa9cc](https://github.com/wd006/qubot-wa/commit/7caa9cc774ef817fb1d7c9d4303211db407bb827))
* **utils:** implement advanced structured logger ([ce8319e](https://github.com/wd006/qubot-wa/commit/ce8319e1b27a8ae2bcd0668810b3f8da11d871dd))

## [2.2.0](https://github.com/wd006/qubot-wa/compare/v2.1.0...v2.2.0) (2026-01-04)


### Features

* **core:** context parsing & critical logic fixes ([b121e00](https://github.com/wd006/qubot-wa/commit/b121e0062304a49f45e69e4262e538ea4b53fb20))

## [2.1.0](https://github.com/wd006/qubot-wa/compare/v2.0.0...v2.1.0) (2026-01-03)


### Features

* **ai:** advanced contextual prompt engineering ([a1d1c47](https://github.com/wd006/qubot-wa/commit/a1d1c4701d23ed4d753c65dfb82bc465be11a1d8))

## [2.0.0](https://github.com/wd006/qubot-wa/compare/v1.2.0...v2.0.0) (2026-01-03)


### ⚠ BREAKING CHANGES

* **core:** The config.js structure has been changed.
- Configuration Overhaul: The 'src/config.js' structure has been
  completely reorganized to support multiple AI providers.
- Action Required: Old configuration files are NOT compatible. Please
  update your config to match the new 'AI: { ... }' object structure.

### Features

* **core:** reactions, Mistral AI, refactoring ([24a780f](https://github.com/wd006/qubot-wa/commit/24a780f0895ae275cbf2de2d509cdd51833f4edd))

## [1.2.0](https://github.com/wd006/qubot-wa/compare/v1.1.0...v1.2.0) (2026-01-02)


### Features

* **l10n:** Implement localization system for multi-language support ([f99d9ae](https://github.com/wd006/qubot-wa/commit/f99d9ae870ccf35ee5905139f1df48c10690794d))

## [1.1.0](https://github.com/wd006/qubot-wa/compare/v0.1.0...v1.1.0) (2026-01-02)


### Features

* **actions:** implement hybrid action and command system ([a228f79](https://github.com/wd006/qubot-wa/commit/a228f7935fc5d7a5a366bd4fca6b61ab61a5735c))
* **repl:** add support for REPL terminal commands ([0867f6f](https://github.com/wd006/qubot-wa/commit/0867f6fe146bf9cebfd29475cd46fd44436d4dcc))
