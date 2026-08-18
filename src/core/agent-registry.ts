import { IAgent } from '../types/agent.types';

export class AgentRegistry {
  private agents: Map<string, IAgent<any, any>> = new Map();

  public register(agent: IAgent<any, any>): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID "${agent.id}" is already registered.`);
    }
    this.agents.set(agent.id, agent);
  }

  public get<TInput = any, TOutput = any>(idOrName: string): IAgent<TInput, TOutput> | undefined {
    if (this.agents.has(idOrName)) {
      return this.agents.get(idOrName) as IAgent<TInput, TOutput>;
    }
    for (const agent of this.agents.values()) {
      if (agent.name === idOrName) {
        return agent as IAgent<TInput, TOutput>;
      }
    }
    return undefined;
  }

  public has(idOrName: string): boolean {
    return this.get(idOrName) !== undefined;
  }

  public getAll(): IAgent<any, any>[] {
    return Array.from(this.agents.values());
  }

  public unregister(idOrName: string): boolean {
    const agent = this.get(idOrName);
    if (agent) {
      return this.agents.delete(agent.id);
    }
    return false;
  }

  public clear(): void {
    this.agents.clear();
  }
}

export const defaultAgentRegistry = new AgentRegistry();
