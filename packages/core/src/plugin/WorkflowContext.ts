/**
 * WorkflowContext contains the state and data that flows through the workflow phases.
 * It provides access to fetched data, transformed data, and other workflow state.
 */
export class WorkflowContext {
  public fetched: Record<string, any> = {};
  public transformed: Record<string, any> = {};
  public tenant?: string;
  public user?: any;
  public request?: any;
  public response?: any;
  public metadata: Record<string, any> = {};

  constructor(initialData: Partial<WorkflowContext> = {}) {
    this.fetched = initialData.fetched || {};
    this.transformed = initialData.transformed || {};
    this.tenant = initialData.tenant;
    this.user = initialData.user;
    this.request = initialData.request;
    this.response = initialData.response;
    this.metadata = initialData.metadata || {};
  }

  /**
   * Get fetched data by path
   * @param path - The path to the fetched data
   * @returns The fetched data or undefined
   */
  public getFetched(path: string): any {
    return this.fetched[path];
  }

  /**
   * Set fetched data by path
   * @param path - The path to set
   * @param data - The data to set
   */
  public setFetched(path: string, data: any): void {
    this.fetched[path] = data;
  }

  /**
   * Get transformed data by path
   * @param path - The path to the transformed data
   * @returns The transformed data or undefined
   */
  public getTransformed(path: string): any {
    return this.transformed[path];
  }

  /**
   * Set transformed data by path
   * @param path - The path to set
   * @param data - The data to set
   */
  public setTransformed(path: string, data: any): void {
    this.transformed[path] = data;
  }

  /**
   * Get data from either fetched or transformed data
   * @param path - The path to the data
   * @param preferTransformed - Whether to prefer transformed data over fetched data
   * @returns The data or undefined
   */
  public getData(path: string, preferTransformed: boolean = true): any {
    if (preferTransformed && this.transformed[path] !== undefined) {
      return this.transformed[path];
    }
    return this.fetched[path];
  }

  /**
   * Check if data exists at a path
   * @param path - The path to check
   * @param preferTransformed - Whether to check transformed data first
   * @returns True if data exists
   */
  public hasData(path: string, preferTransformed: boolean = true): boolean {
    if (preferTransformed) {
      return this.transformed[path] !== undefined || this.fetched[path] !== undefined;
    }
    return this.fetched[path] !== undefined;
  }

  /**
   * Get all fetched data paths
   * @returns Array of fetched data paths
   */
  public getFetchedPaths(): string[] {
    return Object.keys(this.fetched);
  }

  /**
   * Get all transformed data paths
   * @returns Array of transformed data paths
   */
  public getTransformedPaths(): string[] {
    return Object.keys(this.transformed);
  }

  /**
   * Get all data paths (both fetched and transformed)
   * @returns Array of all data paths
   */
  public getAllPaths(): string[] {
    return [...this.getFetchedPaths(), ...this.getTransformedPaths()];
  }

  /**
   * Set metadata
   * @param key - The metadata key
   * @param value - The metadata value
   */
  public setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Get metadata
   * @param key - The metadata key
   * @returns The metadata value or undefined
   */
  public getMetadata(key: string): any {
    return this.metadata[key];
  }

  /**
   * Check if metadata exists
   * @param key - The metadata key
   * @returns True if metadata exists
   */
  public hasMetadata(key: string): boolean {
    return this.metadata[key] !== undefined;
  }

  /**
   * Get all metadata keys
   * @returns Array of metadata keys
   */
  public getMetadataKeys(): string[] {
    return Object.keys(this.metadata);
  }

  /**
   * Clone the workflow context
   * @returns New workflow context instance
   */
  public clone(): WorkflowContext {
    return new WorkflowContext({
      fetched: { ...this.fetched },
      transformed: { ...this.transformed },
      tenant: this.tenant,
      user: this.user,
      request: this.request,
      response: this.response,
      metadata: { ...this.metadata },
    });
  }

  /**
   * Merge another workflow context into this one
   * @param other - The other workflow context to merge
   * @param overwrite - Whether to overwrite existing data
   */
  public merge(other: WorkflowContext, overwrite: boolean = false): void {
    if (overwrite) {
      this.fetched = { ...this.fetched, ...other.fetched };
      this.transformed = { ...this.transformed, ...other.transformed };
      this.metadata = { ...this.metadata, ...other.metadata };
    } else {
      Object.keys(other.fetched).forEach(key => {
        if (this.fetched[key] === undefined) {
          this.fetched[key] = other.fetched[key];
        }
      });
      Object.keys(other.transformed).forEach(key => {
        if (this.transformed[key] === undefined) {
          this.transformed[key] = other.transformed[key];
        }
      });
      Object.keys(other.metadata).forEach(key => {
        if (this.metadata[key] === undefined) {
          this.metadata[key] = other.metadata[key];
        }
      });
    }
  }

  /**
   * Clear all data
   */
  public clear(): void {
    this.fetched = {};
    this.transformed = {};
    this.metadata = {};
  }

  /**
   * Get a summary of the workflow context
   * @returns Summary object
   */
  public getSummary(): {
    fetchedCount: number;
    transformedCount: number;
    metadataCount: number;
    tenant?: string;
    user?: any;
  } {
    return {
      fetchedCount: Object.keys(this.fetched).length,
      transformedCount: Object.keys(this.transformed).length,
      metadataCount: Object.keys(this.metadata).length,
      tenant: this.tenant,
      user: this.user,
    };
  }
}
