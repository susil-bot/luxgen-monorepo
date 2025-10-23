import { WorkflowContext } from './WorkflowContext';

/**
 * Transformer defines operations that change the shape or format of data.
 * They have two members: path and transform.
 * The path defines where the result of the transform function will be stored.
 */
export interface Transformer {
  path: string;
  transform: (workflowContext: WorkflowContext) => Promise<any> | any;
}

/**
 * Create a transformer with the given path and transform function
 * @param path - The path where the result will be stored
 * @param transform - The transform function
 * @returns Transformer instance
 */
export function createTransformer(
  path: string,
  transform: (workflowContext: WorkflowContext) => Promise<any> | any
): Transformer {
  return {
    path,
    transform,
  };
}

/**
 * Create a transformer that slices an array
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param start - Start index
 * @param end - End index
 * @returns Transformer instance
 */
export function createSliceTransformer(
  path: string,
  sourcePath: string,
  start: number,
  end?: number
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    return sourceData.slice(start, end);
  });
}

/**
 * Create a transformer that filters an array
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param filterFn - The filter function
 * @returns Transformer instance
 */
export function createFilterTransformer(
  path: string,
  sourcePath: string,
  filterFn: (item: any) => boolean
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    return sourceData.filter(filterFn);
  });
}

/**
 * Create a transformer that maps an array
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param mapFn - The map function
 * @returns Transformer instance
 */
export function createMapTransformer(
  path: string,
  sourcePath: string,
  mapFn: (item: any) => any
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    return sourceData.map(mapFn);
  });
}

/**
 * Create a transformer that sorts an array
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param sortFn - The sort function
 * @returns Transformer instance
 */
export function createSortTransformer(
  path: string,
  sourcePath: string,
  sortFn: (a: any, b: any) => number
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    return [...sourceData].sort(sortFn);
  });
}

/**
 * Create a transformer that groups an array
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param groupBy - The group by function
 * @returns Transformer instance
 */
export function createGroupTransformer(
  path: string,
  sourcePath: string,
  groupBy: (item: any) => string
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    
    return sourceData.reduce((groups, item) => {
      const key = groupBy(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  });
}

/**
 * Create a transformer that aggregates data
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param aggregateFn - The aggregate function
 * @returns Transformer instance
 */
export function createAggregateTransformer(
  path: string,
  sourcePath: string,
  aggregateFn: (data: any[]) => any
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    if (!Array.isArray(sourceData)) {
      throw new Error(`Source data at ${sourcePath} is not an array`);
    }
    return aggregateFn(sourceData);
  });
}

/**
 * Create a transformer that formats data
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param formatFn - The format function
 * @returns Transformer instance
 */
export function createFormatTransformer(
  path: string,
  sourcePath: string,
  formatFn: (data: any) => any
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    return formatFn(sourceData);
  });
}

/**
 * Create a transformer that combines multiple data sources
 * @param path - The path where the result will be stored
 * @param sourcePaths - The paths to the source data
 * @param combineFn - The combine function
 * @returns Transformer instance
 */
export function createCombineTransformer(
  path: string,
  sourcePaths: string[],
  combineFn: (...data: any[]) => any
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = sourcePaths.map(sourcePath => workflowContext.fetched[sourcePath]);
    return combineFn(...sourceData);
  });
}

/**
 * Create a transformer that validates data
 * @param path - The path where the result will be stored
 * @param sourcePath - The path to the source data
 * @param validationFn - The validation function
 * @returns Transformer instance
 */
export function createValidationTransformer(
  path: string,
  sourcePath: string,
  validationFn: (data: any) => boolean
): Transformer {
  return createTransformer(path, (workflowContext) => {
    const sourceData = workflowContext.fetched[sourcePath];
    const isValid = validationFn(sourceData);
    
    if (!isValid) {
      throw new Error(`Validation failed for data at ${sourcePath}`);
    }
    
    return sourceData;
  });
}
