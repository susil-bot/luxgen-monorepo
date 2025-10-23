import { Fetcher } from './Fetcher';
import { Transformer } from './Transformer';
import { WorkflowContext } from './WorkflowContext';

/**
 * PhaseSet contains the phases that are executed on the server.
 * This code should not be in client bundles.
 */
export class PhaseSet {
  public fetchers: Fetcher[];
  public transformers: Transformer[];

  constructor(fetchers: Fetcher[] = [], transformers: Transformer[] = []) {
    this.fetchers = fetchers;
    this.transformers = transformers;
  }

  /**
   * Execute all phases in the correct order
   * @param workflowContext - The workflow context
   */
  public async execute(workflowContext: WorkflowContext): Promise<void> {
    // Execute fetchers first
    await this.executeFetchers(workflowContext);
    
    // Then execute transformers
    await this.executeTransformers(workflowContext);
  }

  /**
   * Execute all fetchers
   * @param workflowContext - The workflow context
   */
  private async executeFetchers(workflowContext: WorkflowContext): Promise<void> {
    for (const fetcher of this.fetchers) {
      try {
        const result = await fetcher.fetch(workflowContext);
        workflowContext.fetched[fetcher.path] = result;
      } catch (error) {
        console.error(`Error in fetcher ${fetcher.path}:`, error);
        throw error;
      }
    }
  }

  /**
   * Execute all transformers
   * @param workflowContext - The workflow context
   */
  private async executeTransformers(workflowContext: WorkflowContext): Promise<void> {
    for (const transformer of this.transformers) {
      try {
        const result = await transformer.transform(workflowContext);
        workflowContext.transformed[transformer.path] = result;
      } catch (error) {
        console.error(`Error in transformer ${transformer.path}:`, error);
        throw error;
      }
    }
  }

  /**
   * Add a fetcher to the phase set
   * @param fetcher - The fetcher to add
   * @returns new PhaseSet with the added fetcher
   */
  public addFetcher(fetcher: Fetcher): PhaseSet {
    return new PhaseSet([...this.fetchers, fetcher], this.transformers);
  }

  /**
   * Add a transformer to the phase set
   * @param transformer - The transformer to add
   * @returns new PhaseSet with the added transformer
   */
  public addTransformer(transformer: Transformer): PhaseSet {
    return new PhaseSet(this.fetchers, [...this.transformers, transformer]);
  }

  /**
   * Prepend another phase set to this one
   * @param phaseSet - The phase set to prepend
   * @returns new PhaseSet with prepended phases
   */
  public prepend(phaseSet: PhaseSet): PhaseSet {
    return new PhaseSet(
      [...phaseSet.fetchers, ...this.fetchers],
      [...phaseSet.transformers, ...this.transformers]
    );
  }

  /**
   * Append another phase set to this one
   * @param phaseSet - The phase set to append
   * @returns new PhaseSet with appended phases
   */
  public append(phaseSet: PhaseSet): PhaseSet {
    return new PhaseSet(
      [...this.fetchers, ...phaseSet.fetchers],
      [...this.transformers, ...phaseSet.transformers]
    );
  }

  /**
   * Get all fetcher paths
   * @returns array of fetcher paths
   */
  public getFetcherPaths(): string[] {
    return this.fetchers.map(fetcher => fetcher.path);
  }

  /**
   * Get all transformer paths
   * @returns array of transformer paths
   */
  public getTransformerPaths(): string[] {
    return this.transformers.map(transformer => transformer.path);
  }

  /**
   * Check if the phase set has any phases
   * @returns true if the phase set has phases
   */
  public isEmpty(): boolean {
    return this.fetchers.length === 0 && this.transformers.length === 0;
  }

  /**
   * Get the total number of phases
   * @returns total number of phases
   */
  public getPhaseCount(): number {
    return this.fetchers.length + this.transformers.length;
  }
}
