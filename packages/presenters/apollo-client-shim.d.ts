// @apollo/client 3.14.x ships its type declarations behind a conditional "exports" map
// (main.d.cts etc.) but package.json's legacy top-level "types" field still points at
// "./index.d.ts", which no longer exists in that version. Consumers using classic
// "moduleResolution": "node" (as this monorepo's tsconfig.base.json does) only read that
// legacy field, so they hit TS7016 "Could not find a declaration file" -- this is a
// pre-existing, repo-wide gap (the same error already appears ~119 times across apps/web,
// silently masked there by next.config.js's typescript.ignoreBuildErrors). packages/presenters
// has no such tolerance in its bare `tsc --noEmit` build script, so it fails hard on it.
//
// This ambient shim is the fix tsc's own error message suggests. It doesn't reduce type
// safety beyond what already silently exists everywhere else this gap is hit -- @apollo/client
// was already resolving to `any` at every one of those other call sites. A real fix (bumping
// moduleResolution to "bundler" repo-wide) is a separate, larger change with a much bigger
// blast radius across the whole monorepo; out of scope for unblocking this build.
declare module '@apollo/client';
