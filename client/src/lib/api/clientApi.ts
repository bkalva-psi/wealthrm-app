import { Client } from "@shared/schema";
import { apiRequest } from "../queryClient";

/**
 * Client API service
 * This service provides methods to interact with client data through APIs.
 * It can be easily replaced with another implementation for different banks
 * without changing the consuming components.
 */
export interface ClientApiService {
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getRecentClients(limit: number): Promise<Client[]>;
  createClient(clientData: Omit<Client, "id" | "createdAt">): Promise<Client>;
  updateClient(id: number, clientData: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client>;
  deleteClient(id: number): Promise<boolean>;
}

/**
 * Default implementation that uses the current API endpoints
 */
export class DefaultClientApiService implements ClientApiService {
  async getClients(): Promise<Client[]> {
    return apiRequest('/api/clients');
  }

  async getClient(id: number): Promise<Client | undefined> {
    return apiRequest(`/api/clients/${id}`);
  }

  async getRecentClients(limit: number): Promise<Client[]> {
    return apiRequest(`/api/clients/recent?limit=${limit}`);
  }

  async createClient(clientData: Omit<Client, "id" | "createdAt">): Promise<Client> {
    return apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async updateClient(id: number, clientData: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client> {
    return apiRequest(`/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(clientData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async deleteClient(id: number): Promise<boolean> {
    return apiRequest(`/api/clients/${id}`, {
      method: 'DELETE'
    });
  }
}

// Export a singleton instance of the default implementation
// This can be replaced with a different implementation if needed
let clientApiService: ClientApiService = new DefaultClientApiService();

/**
 * Allows replacing the API service implementation
 * This is useful for switching between different bank API implementations
 * @param newImplementation The new API service implementation
 */
export function setClientApiService(newImplementation: ClientApiService) {
  clientApiService = newImplementation;
}

/**
 * Returns the current API service implementation
 */
export function getClientApiService(): ClientApiService {
  return clientApiService;
}

// Export a convenience object that forwards to the current implementation
export const clientApi = {
  getClients: () => clientApiService.getClients(),
  getClient: (id: number) => clientApiService.getClient(id),
  getRecentClients: (limit: number) => clientApiService.getRecentClients(limit),
  createClient: (clientData: Omit<Client, "id" | "createdAt">) => clientApiService.createClient(clientData),
  updateClient: (id: number, clientData: Partial<Omit<Client, "id" | "createdAt">>) => clientApiService.updateClient(id, clientData),
  deleteClient: (id: number) => clientApiService.deleteClient(id),
};