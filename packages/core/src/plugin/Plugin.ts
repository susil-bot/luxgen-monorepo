import { ComponentType } from 'react';
import { PhaseSet } from './PhaseSet';
import { WorkflowContext } from './WorkflowContext';

/**
 * Plugin defines a vertical slice of the application.
 * The cross-sections of this slice are either Phases or a React.Component.
 */
export class Plugin {
  public component?: ComponentType;
  public name: string;
  public phaseSet: PhaseSet;

  constructor(name: string, phaseSet: PhaseSet, component?: ComponentType) {
    this.name = name;
    this.phaseSet = phaseSet;
    this.component = component;
  }

  /**
   * Create a new plugin by prepending phase sets to the current plugin's.
   *
   * @param plugins - plugins to prepend phase sets of
   * @returns new plugin with passed plugins' phase sets prepended to the current
   */
  public prependPhaseSets(plugins: Plugin[]): Plugin {
    const combinedPhaseSet = plugins.reduce((acc, plugin) => {
      return acc.prepend(plugin.phaseSet);
    }, this.phaseSet);

    return new Plugin(this.name, combinedPhaseSet, this.component);
  }

  /**
   * Create a new plugin by appending phase sets to the current plugin's.
   *
   * @param plugins - plugins to append phase sets of
   * @returns new plugin with passed plugins' phase sets appended to the current
   */
  public appendPhaseSets(plugins: Plugin[]): Plugin {
    const combinedPhaseSet = plugins.reduce((acc, plugin) => {
      return acc.append(plugin.phaseSet);
    }, this.phaseSet);

    return new Plugin(this.name, combinedPhaseSet, this.component);
  }

  /**
   * Execute the plugin's phase set with the given workflow context
   * @param workflowContext - The workflow context
   * @returns Promise that resolves when all phases are complete
   */
  public async execute(workflowContext: WorkflowContext): Promise<void> {
    await this.phaseSet.execute(workflowContext);
  }

  /**
   * Check if the plugin has a component (is a Presenter)
   * @returns true if the plugin has a component
   */
  public isPresenter(): boolean {
    return this.component !== undefined;
  }

  /**
   * Get the plugin's display name for debugging
   * @returns formatted display name
   */
  public getDisplayName(): string {
    return `Plugin(${this.name})`;
  }

  /**
   * Clone the plugin with new properties
   * @param overrides - Properties to override
   * @returns new plugin instance
   */
  public clone(overrides: Partial<Pick<Plugin, 'name' | 'component' | 'phaseSet'>> = {}): Plugin {
    return new Plugin(
      overrides.name ?? this.name,
      overrides.phaseSet ?? this.phaseSet,
      overrides.component ?? this.component
    );
  }
}
