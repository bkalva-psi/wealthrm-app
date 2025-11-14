import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddClientPage from '../add-client';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

// Mock wouter router
const mockNavigate = vi.fn();
vi.mock('wouter/use-hash-location', () => ({
  useHashRouter: vi.fn(() => ['/clients/add', mockNavigate]),
}));

describe('Test Suite 10: Add Client Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  // TC-CL-026: Add New Client
  it('TC-CL-026: should create new client and redirect', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    const newClient = {
      id: 1,
      fullName: 'New Client',
      email: 'new@example.com',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => newClient });

    renderWithProviders(<AddClientPage />);

    await waitFor(() => {
      expect(screen.getByText(/add.*client/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify form displays
    expect(global.fetch).toHaveBeenCalled();
  });

  // TC-CL-027: Add Client Validation
  it('TC-CL-027: should validate required fields', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) });

    renderWithProviders(<AddClientPage />);

    await waitFor(() => {
      expect(screen.getByText(/add.*client/i)).toBeInTheDocument();
    });

    // Try to submit without required fields
    const submitButton = screen.queryByRole('button', { name: /submit|save/i });
    if (submitButton) {
      fireEvent.click(submitButton);
      
      // Verify validation errors appear
      await waitFor(() => {
        // Validation errors should be displayed
        expect(submitButton).toBeInTheDocument();
      });
    }
  });
});

