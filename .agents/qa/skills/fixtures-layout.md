## fixtures-layout

You provide knowledge about how E2E fixtures are organized and used.

- Tests import the extended Playwright `test` and `expect` from the shared fixture.
- The fixture is responsible for loading the unpacked extension and exposing `context` and `extensionId`.
- Prefer reusing the shared fixture patterns when adding or updating tests.
