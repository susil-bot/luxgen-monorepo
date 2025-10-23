### Table Of Contents

-   [`Plugins`](#plugins)
    -   [PhaseSet](#phaseset)
-   [Types Of `Plugins`](#types-of-plugins)
-   [Working With `Plugins`](#working-with-plugins)

# `Plugins`

A Plugin defines a vertical slice of the application. The cross-sections of this
slice are either `Phases` or a `React.Component`.

## Plugin Properties

```ts
class Plugin {
    component?: ComponentType;
    name: string;
    phaseSet: PhaseSet;
}
```

A `Plugin` has three properties: `component`, `name`, `phaseSet`.

The `component` is a React component. If the `Plugin` is used as a
[Presenter](#presenters), then the `component` property is used to render
a page view.

### Phases

`Phases` are containers for operations that take place during different points
in the `Workflow` or on the `Page`.

Some `Phases` occur only on the server, these are part of the `PhaseSet`.

`Phasers` are the constituent members of the `Phases`. In general, `Phasers` are
functions that either return or resolve a value that updates some target context.
Currently, Verso plugins only support `fetch` and `transform` phasers.

#### Result Availability

Results produced by prior phases are available in subsequent phases.

Below you can see what results are available for each `Phase`.

| Phase Name | Available Results |
| ---------- | ----------------- |
| Fetch      |                   |
| Transform  | Fetch             |

This filtering happens in order to:

-   Prevent leakage of private configuration values.
-   Reduce payload size.

## PhaseSet

The `PhaseSet` phases are only executed on the server. **This Code should
not be in client bundles**.

### Fetchers

```ts
interface Fetcher {
    path: string;
    fetch: (workflowContext: WorkflowContext) => Promise<any>;
}
```

`Fetchers` define network interactions. They have two members
`path` and `fetch`. The `path` defines where the result of the `fetch` function will be stored.

If a fetcher is defined as follows:

```ts
const recentWorkFetcher = {
    path: 'recentWork',
    fetch: (workflowContext) => copilotSDK.getTheRecentWork()
};
```

The result of `copilotSDK.getTheRecentWork` will be available during the Trasform phase at
`workflowContext.fetched.recentWork`.

### Transformers

```ts
interface Transformer {
    path: string;
    transform: (workflowContext: WorkflowContext) => Promise<any> | any;
}
```

`Transformers` define operations that change the shape or format of data.
They have two members `path` and `transform`. The `path` defines where the result of the
`transform` function will be stored.

If a `Transformer` is defined as follows:

```jsx
const topSearchResults = {
  path: 'searchResults',
  transform: (workflowContext) => workflowContext.fetched.searchResults.slice(0, 5);
}
```

The first 5 search result of will be available to the phases in the client state
at `workflowContext.transformed.searchResults`.

# Types of Plugins

`Plugins` all take the same shape (described above), but they can play different
roles.

## Presenters

`Presenters` are associated with specific routes on content types.
Examples of `Presenters`:

-   Identifier (See [Collection](#other-plugins))
-   Bundle
-   Search

`Presenters` are combined with `Tenants` to create a route handler.

### Presenter Properties

-   `name` - used to used to identify a plugin for matching its client-side JS bundle and debugging. Should match the directory path of the presenter and its `client.entry.ts` file. **Example:** `presenter-articles`.
-   `component` - the `component` of a `Presenter` is used to create the Page that will be rendered.
-   `PhaseSet` - These `Phasers` are used normally

## Other `Plugins`

Other plugins can be shared between `Tenants`, `Presenters`, or `Collections`.
Examples of these are:

-   `plugin-head`: this is the html `<head/>`
-   `plugin-navigation`: the site header. `Tenants` overide configuration for this plugin,
    but the React component and default configuration is contained in the shared plugin.

# Working With Plugins

## Extending Plugins

Prepending and appending phaseSets is the mechanism for combining plugins, so that multiple
plugins can operate within the same `Workflow` and `Page`.

The `Plugin#prependPhaseSets` and `Plugin#appendPhaseSets` methods can be found in the Plugin object (`src/core/Plugin.ts`).

Below is the signature for the instance methods on `Plugin`

```jsx
  /**
   * Create a new plugin by prepending phase sets to the current plugin's.
   *
   * @param plugins - plugins to prepend phase sets of
   * @returns new plugin with passed plugins' phase sets prepeneded to the current
   */
  public prependPhaseSets (plugins: Plugin[]): Plugin {}

  /**
   * Create a new plugin by appending phase sets to the current plugin's.
   *
   * @param plugins - plugins to append phase sets of
   * @returns new plugin with passed plugins' phase sets appeneded to the current
   */
  public appendPhaseSets (plugins: Plugin[]): Plugin {}
```

The resulting plugin is defined as follows:

| Property Name | result                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------- |
| name          | the `name` of the `primary` `Plugin`                                                      |
| component     | the `component` of the `primary` `Plugin`                                                 |
| serverPhases  | the phasers are concatenated. When there is a conflict the right most phaser is preffered |

_phaser conflict_ - When the `path` attribute of two `phasers` are identical.
This applies to `Fetchers` and `Transformers`.
