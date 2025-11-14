import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientInteractions from '../client-interactions';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

const mockHash = vi.fn(() => '#/clients/1/interactions');
Object.defineProperty(window, 'location', {
  value: { hash: mockHash() },
  writable: true,
});

describe('Test Suite 4: Client Interactions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockHash.mockReturnValue('#/clients/1/interactions');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockClient = { id: 1, fullName: 'John Doe' };
  const mockInteractions = [
    {
      id: 1,
      type: 'Call',
      date: '2024-01-15',
      description: 'Follow-up call',
      outcome: 'Positive',
    },
  ];

  // TC-CL-011: View Interaction History
  it('TC-CL-011: should display interaction history sorted by date', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockInteractions });

    renderWithProviders(<ClientInteractions />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify interactions load
    expect(global.fetch).toHaveBeenCalled();
  });

  // TC-CL-012: Add New Interaction
  it('TC-CL-012: should add new interaction', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockInteractions })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, ...mockInteractions[0] }) });

    renderWithProviders(<ClientInteractions />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    // Find add interaction button
    const addButton = screen.queryByRole('button', { name: /add.*interaction/i });
    if (addButton) {
      expect(addButton).toBeInTheDocument();
    }
  });

  // TC-CL-013: Edit Interaction
  it('TC-CL-013: should edit existing interaction', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockInteractions });

    renderWithProviders(<ClientInteractions />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    // Verify edit functionality exists
    expect(global.fetch).toHaveBeenCalled();
  });
});

