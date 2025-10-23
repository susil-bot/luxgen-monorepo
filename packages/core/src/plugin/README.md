# Plugin System

A comprehensive plugin architecture for the luxgen-monorepo project, implementing the specifications from `plugin.md`.

## Overview

The Plugin System defines a vertical slice of the application where cross-sections are either `Phases` or a `React.Component`. This system enables modular, extensible architecture with server-side rendering support.

## Architecture

### Core Components

- **Plugin**: Base plugin class with component, name, and phaseSet
- **PhaseSet**: Container for server-side phases (fetchers and transformers)
- **Fetcher**: Network interactions and data fetching
- **Transformer**: Data transformation and formatting
- **Presenter**: Route-specific plugins for content rendering
- **WorkflowContext**: State management across phases
- **PluginRegistry**: Plugin management and execution

### Phase Execution Order

1. **Fetch Phase**: Network interactions and data fetching
2. **Transform Phase**: Data transformation and formatting

Results from prior phases are available in subsequent phases, with filtering to prevent leakage and reduce payload size.

## Usage

### Basic Plugin Creation

```typescript
import { Plugin, PhaseSet, createFetcher, createTransformer } from '@luxgen/core';

// Create a simple plugin
const myPlugin = new Plugin(
  'my-plugin',
  new PhaseSet(
    [
      createFetcher('data', async (context) => {
        return { message: 'Hello World' };
      })
    ],
    [
      createTransformer('formattedData', (context) => {
        const data = context.fetched.data;
        return { formatted: data.message.toUpperCase() };
      })
    ]
  )
);
```

### Presenter Plugin

```typescript
import { Presenter, createArticlePresenter } from '@luxgen/core';

// Create an article presenter
const articlePresenter = createArticlePresenter(
  'presenter-articles',
  '/articles/:id',
  ArticleComponent,
  phaseSet
);
```

### Plugin Registry

```typescript
import { PluginRegistry, HeadPlugin, NavigationPlugin } from '@luxgen/core';

// Create registry
const registry = new PluginRegistry();

// Register plugins
registry.registerSharedPlugin(new HeadPlugin());
registry.registerSharedPlugin(new NavigationPlugin());
registry.registerPresenter(articlePresenter);

// Execute workflow
const context = new WorkflowContext({ tenant: 'luxgen' });
await registry.executePresenterWorkflow(articlePresenter, context, ['plugin-head', 'plugin-navigation']);
```

## Fetchers

Fetchers define network interactions and data fetching:

### API Fetcher
```typescript
import { createApiFetcher } from '@luxgen/core';

const apiFetcher = createApiFetcher(
  'userData',
  '/api/users/123',
  { headers: { 'Authorization': 'Bearer token' } }
);
```

### GraphQL Fetcher
```typescript
import { createGraphQLFetcher } from '@luxgen/core';

const graphqlFetcher = createGraphQLFetcher(
  'articles',
  `
    query GetArticles($limit: Int) {
      articles(limit: $limit) {
        id
        title
        content
      }
    }
  `,
  { limit: 10 }
);
```

### Database Fetcher
```typescript
import { createDatabaseFetcher } from '@luxgen/core';

const dbFetcher = createDatabaseFetcher(
  'articles',
  'SELECT * FROM articles WHERE published = true',
  []
);
```

## Transformers

Transformers define data transformation operations:

### Slice Transformer
```typescript
import { createSliceTransformer } from '@luxgen/core';

const topArticles = createSliceTransformer(
  'topArticles',
  'articles',
  0,
  5
);
```

### Filter Transformer
```typescript
import { createFilterTransformer } from '@luxgen/core';

const publishedArticles = createFilterTransformer(
  'publishedArticles',
  'articles',
  (article) => article.published === true
);
```

### Map Transformer
```typescript
import { createMapTransformer } from '@luxgen/core';

const articleSummaries = createMapTransformer(
  'articleSummaries',
  'articles',
  (article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.content.substring(0, 100)
  })
);
```

## Workflow Context

The WorkflowContext manages state across phases:

```typescript
import { WorkflowContext } from '@luxgen/core';

const context = new WorkflowContext({
  tenant: 'luxgen',
  user: { id: '123', name: 'John Doe' },
  request: { path: '/articles/123' }
});

// Access data
const articleData = context.getFetched('articleData');
const transformedData = context.getTransformed('articleMeta');

// Set metadata
context.setMetadata('renderTime', Date.now());
```

## Example Plugins

### Head Plugin
```typescript
import { HeadPlugin } from '@luxgen/core';

const headPlugin = new HeadPlugin();
// Manages HTML head metadata, SEO, and social sharing
```

### Navigation Plugin
```typescript
import { NavigationPlugin } from '@luxgen/core';

const navPlugin = new NavigationPlugin();
// Manages site navigation, breadcrumbs, and user menu
```

### Article Presenter
```typescript
import { ArticlePresenter } from '@luxgen/core';

const articlePresenter = new ArticlePresenter();
// Handles article content rendering with related articles and comments
```

## Plugin Extension

Plugins can be extended by prepending or appending phase sets:

```typescript
// Prepend phases
const extendedPlugin = plugin.prependPhaseSets([otherPlugin]);

// Append phases
const extendedPlugin = plugin.appendPhaseSets([otherPlugin]);
```

## Best Practices

1. **Server-Side Only**: PhaseSet code should not be in client bundles
2. **Error Handling**: Always handle errors in fetchers and transformers
3. **Data Filtering**: Use transformers to filter sensitive data
4. **Performance**: Cache expensive operations in transformers
5. **Testing**: Write tests for all fetchers and transformers

## Testing

```typescript
import { WorkflowContext } from '@luxgen/core';

// Test a plugin
const context = new WorkflowContext();
await plugin.execute(context);

// Assert results
expect(context.getTransformed('formattedData')).toEqual({
  formatted: 'HELLO WORLD'
});
```

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
interface MyPluginProps {
  tenant: string;
  user: User;
  data: MyData;
}

const MyPlugin: Plugin<MyPluginProps> = new Plugin(
  'my-plugin',
  phaseSet,
  MyComponent
);
```

## Migration from Existing Code

To migrate existing code to the plugin system:

1. Identify data fetching operations → Convert to Fetchers
2. Identify data transformations → Convert to Transformers
3. Identify route handlers → Convert to Presenters
4. Identify shared functionality → Convert to shared Plugins

## Performance Considerations

- **Lazy Loading**: Load plugins only when needed
- **Caching**: Cache expensive operations
- **Parallel Execution**: Execute independent phases in parallel
- **Memory Management**: Clean up resources after execution

## Security

- **Data Filtering**: Prevent leakage of sensitive data
- **Input Validation**: Validate all inputs in transformers
- **Access Control**: Implement proper authorization checks
- **Rate Limiting**: Implement rate limiting for external APIs

## Monitoring and Debugging

- **Logging**: Log all phase executions
- **Metrics**: Track performance metrics
- **Error Tracking**: Implement comprehensive error tracking
- **Debug Mode**: Enable debug mode for development

## Future Enhancements

- **Plugin Hot Reloading**: Support for hot reloading during development
- **Plugin Dependencies**: Automatic dependency resolution
- **Plugin Versioning**: Support for plugin versioning
- **Plugin Marketplace**: Centralized plugin distribution
