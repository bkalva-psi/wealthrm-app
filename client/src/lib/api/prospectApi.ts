import { Prospect } from "@shared/schema";
import { apiRequest } from "../queryClient";

/**
 * Prospect API service
 * This service provides methods to interact with prospect data through APIs.
 * It can be easily replaced with another implementation for different banks
 * without changing the consuming components.
 */
export interface ProspectApiService {
  getProspects(): Promise<Prospect[]>;
  getProspect(id: number): Promise<Prospect | undefined>;
  getProspectsByStage(stage: string): Promise<Prospect[]>;
  createProspect(prospectData: Omit<Prospect, "id" | "createdAt">): Promise<Prospect>;
  updateProspect(id: number, prospectData: Partial<Omit<Prospect, "id" | "createdAt">>): Promise<Prospect>;
  deleteProspect(id: number): Promise<boolean>;
}

/**
 * Default implementation that uses the current API endpoints
 */
export class DefaultProspectApiService implements ProspectApiService {
  async getProspects(): Promise<Prospect[]> {
    return apiRequest('/api/prospects');
  }

  async getProspect(id: number): Promise<Prospect | undefined> {
    return apiRequest(`/api/prospects/${id}`);
  }

  async getProspectsByStage(stage: string): Promise<Prospect[]> {
    return apiRequest(`/api/prospects/stage/${stage}`);
  }

  async createProspect(prospectData: Omit<Prospect, "id" | "createdAt">): Promise<Prospect> {
    return apiRequest('/api/prospects', {
      method: 'POST',
      body: JSON.stringify(prospectData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async updateProspect(id: number, prospectData: Partial<Omit<Prospect, "id" | "createdAt">>): Promise<Prospect> {
    return apiRequest(`/api/prospects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(prospectData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async deleteProspect(id: number): Promise<boolean> {
    return apiRequest(`/api/prospects/${id}`, {
      method: 'DELETE'
    });
  }
}

// Export a singleton instance of the default implementation
// This can be replaced with a different implementation if needed
let prospectApiService: ProspectApiService = new DefaultProspectApiService();

/**
 * Allows replacing the API service implementation
 * This is useful for switching between different bank API implementations
 * @param newImplementation The new API service implementation
 */
export function setProspectApiService(newImplementation: ProspectApiService) {
  prospectApiService = newImplementation;
}

/**
 * Returns the current API service implementation
 */
export function getProspectApiService(): ProspectApiService {
  return prospectApiService;
}

// Export a convenience object that forwards to the current implementation
export const prospectApi = {
  getProspects: () => prospectApiService.getProspects(),
  getProspect: (id: number) => prospectApiService.getProspect(id),
  getProspectsByStage: (stage: string) => prospectApiService.getProspectsByStage(stage),
  createProspect: (prospectData: Omit<Prospect, "id" | "createdAt">) => prospectApiService.createProspect(prospectData),
  updateProspect: (id: number, prospectData: Partial<Omit<Prospect, "id" | "createdAt">>) => prospectApiService.updateProspect(id, prospectData),
  deleteProspect: (id: number) => prospectApiService.deleteProspect(id),
};