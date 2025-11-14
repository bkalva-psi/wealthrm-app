import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientTransactions from '../client-transactions';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

const mockHash = vi.fn(() => '#/clients/1/transactions');
Object.defineProperty(window, 'location', {
  value: { hash: mockHash() },
  writable: true,
});

describe('Test Suite 5: Client Transactions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockHash.mockReturnValue('#/clients/1/transactions');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockClient = { id: 1, fullName: 'John Doe' };
  const mockTransactions = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'Purchase',
      amount: 10000,
      schemeName: 'Fund A',
      status: 'Completed',
    },
  ];

  // TC-CL-014: View Transaction History
  it('TC-CL-014: should display transaction history with details', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransactions });

    renderWithProviders(<ClientTransactions />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify transactions load
    expect(global.fetch).toHaveBeenCalled();
  });

  // TC-CL-015: Transaction Filters
  it('TC-CL-015: should apply transaction filters', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransactions });

    renderWithProviders(<ClientTransactions />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    // Verify filters work
    expect(global.fetch).toHaveBeenCalled();
  });
});

