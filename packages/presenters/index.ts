/**
 * @luxgen/presenters
 *
 * There is intentionally no barrel export of every feature presenter here.
 * Consumers import a specific feature's presenter directly, e.g.:
 *
 *   import { useSearchPresenter } from '@luxgen/presenters/search';
 *
 * This keeps each app's bundle scoped to the presenters it actually uses,
 * and matches the existing `@luxgen/ui/<Component>` subpath convention
 * already used elsewhere in this repo (plain filesystem resolution via the
 * npm workspace symlink -- no package.json "exports" map needed).
 *
 * See README.md for the presenter layer's internal file structure and
 * docs/CROSS_PLATFORM_RESTRUCTURE.md for why this package exists and how
 * apps/web and apps/mobile are meant to share it.
 */
export {};
