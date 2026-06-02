// Vitest workspace — discovers per-package configs so `pnpm test` at the
// root runs every package's suite. Add more packages here as they grow
// tests; each package owns its own vitest.config.ts so environment and
// setup files stay local to the code under test.
export default ["packages/*"];
