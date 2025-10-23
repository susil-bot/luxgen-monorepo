import { Plugin } from './Plugin';
import { Presenter } from './Presenter';
import { WorkflowContext } from './WorkflowContext';

/**
 * PluginRegistry manages the registration and execution of plugins.
 * It provides methods to register plugins, find matching presenters, and execute workflows.
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private presenters: Map<string, Presenter> = new Map();
  private sharedPlugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin
   * @param plugin - The plugin to register
   */
  public registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Register a presenter
   * @param presenter - The presenter to register
   */
  public registerPresenter(presenter: Presenter): void {
    this.presenters.set(presenter.name, presenter);
  }

  /**
   * Register a shared plugin
   * @param plugin - The shared plugin to register
   */
  public registerSharedPlugin(plugin: Plugin): void {
    this.sharedPlugins.set(plugin.name, plugin);
  }

  /**
   * Get a plugin by name
   * @param name - The plugin name
   * @returns The plugin or undefined
   */
  public getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get a presenter by name
   * @param name - The presenter name
   * @returns The presenter or undefined
   */
  public getPresenter(name: string): Presenter | undefined {
    return this.presenters.get(name);
  }

  /**
   * Get a shared plugin by name
   * @param name - The shared plugin name
   * @returns The shared plugin or undefined
   */
  public getSharedPlugin(name: string): Plugin | undefined {
    return this.sharedPlugins.get(name);
  }

  /**
   * Find a presenter that matches the given route and content type
   * @param route - The route to match
   * @param contentType - The content type to match
   * @param tenant - The tenant to match (optional)
   * @returns The matching presenter or undefined
   */
  public findPresenter(route: string, contentType: string, tenant?: string): Presenter | undefined {
    for (const presenter of this.presenters.values()) {
      if (presenter.matches(route, contentType, tenant)) {
        return presenter;
      }
    }
    return undefined;
  }

  /**
   * Get all plugins
   * @returns Array of all plugins
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all presenters
   * @returns Array of all presenters
   */
  public getAllPresenters(): Presenter[] {
    return Array.from(this.presenters.values());
  }

  /**
   * Get all shared plugins
   * @returns Array of all shared plugins
   */
  public getAllSharedPlugins(): Plugin[] {
    return Array.from(this.sharedPlugins.values());
  }

  /**
   * Execute a workflow with the given context
   * @param workflowContext - The workflow context
   * @param pluginNames - Optional array of plugin names to execute
   * @returns Promise that resolves when the workflow is complete
   */
  public async executeWorkflow(
    workflowContext: WorkflowContext,
    pluginNames?: string[]
  ): Promise<void> {
    const pluginsToExecute = pluginNames 
      ? pluginNames.map(name => this.getPlugin(name)).filter(Boolean) as Plugin[]
      : this.getAllPlugins();

    for (const plugin of pluginsToExecute) {
      await plugin.execute(workflowContext);
    }
  }

  /**
   * Execute a presenter workflow
   * @param presenter - The presenter to execute
   * @param workflowContext - The workflow context
   * @param sharedPluginNames - Optional array of shared plugin names to include
   * @returns Promise that resolves when the workflow is complete
   */
  public async executePresenterWorkflow(
    presenter: Presenter,
    workflowContext: WorkflowContext,
    sharedPluginNames?: string[]
  ): Promise<void> {
    // Execute shared plugins first
    if (sharedPluginNames) {
      for (const pluginName of sharedPluginNames) {
        const sharedPlugin = this.getSharedPlugin(pluginName);
        if (sharedPlugin) {
          await sharedPlugin.execute(workflowContext);
        }
      }
    }

    // Execute the presenter's phases
    await presenter.execute(workflowContext);
  }

  /**
   * Get plugins by category
   * @param category - The category to filter by
   * @returns Array of plugins in the category
   */
  public getPluginsByCategory(category: string): Plugin[] {
    return this.getAllPlugins().filter(plugin => 
      plugin.name.includes(category)
    );
  }

  /**
   * Get presenters by content type
   * @param contentType - The content type to filter by
   * @returns Array of presenters for the content type
   */
  public getPresentersByContentType(contentType: string): Presenter[] {
    return this.getAllPresenters().filter(presenter => 
      presenter.contentType === contentType
    );
  }

  /**
   * Get presenters by tenant
   * @param tenant - The tenant to filter by
   * @returns Array of presenters for the tenant
   */
  public getPresentersByTenant(tenant: string): Presenter[] {
    return this.getAllPresenters().filter(presenter => 
      presenter.tenant === tenant
    );
  }

  /**
   * Remove a plugin
   * @param name - The plugin name to remove
   * @returns True if the plugin was removed
   */
  public removePlugin(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Remove a presenter
   * @param name - The presenter name to remove
   * @returns True if the presenter was removed
   */
  public removePresenter(name: string): boolean {
    return this.presenters.delete(name);
  }

  /**
   * Remove a shared plugin
   * @param name - The shared plugin name to remove
   * @returns True if the shared plugin was removed
   */
  public removeSharedPlugin(name: string): boolean {
    return this.sharedPlugins.delete(name);
  }

  /**
   * Clear all plugins
   */
  public clearPlugins(): void {
    this.plugins.clear();
  }

  /**
   * Clear all presenters
   */
  public clearPresenters(): void {
    this.presenters.clear();
  }

  /**
   * Clear all shared plugins
   */
  public clearSharedPlugins(): void {
    this.sharedPlugins.clear();
  }

  /**
   * Clear all registrations
   */
  public clear(): void {
    this.clearPlugins();
    this.clearPresenters();
    this.clearSharedPlugins();
  }

  /**
   * Get registry statistics
   * @returns Statistics object
   */
  public getStats(): {
    pluginCount: number;
    presenterCount: number;
    sharedPluginCount: number;
    totalCount: number;
  } {
    return {
      pluginCount: this.plugins.size,
      presenterCount: this.presenters.size,
      sharedPluginCount: this.sharedPlugins.size,
      totalCount: this.plugins.size + this.presenters.size + this.sharedPlugins.size,
    };
  }
}
