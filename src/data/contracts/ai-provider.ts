export interface AIProvider {
  generateJson(system: string, prompt: string): Promise<unknown>;
}
