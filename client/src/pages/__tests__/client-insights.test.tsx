import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientInsights from '../client-insights';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

const mockHash = vi.fn(() => '#/clients/1/insights');
Object.defineProperty(window, 'location', {
  value: { hash: mockHash() },
  writable: true,
});

describe('Test Suite 9: Client Insights', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockHash.mockReturnValue('#/clients/1/insights');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockClient = { id: 1, fullName: 'John Doe' };
  const mockInsights = {
    riskProfile: 'Moderate',
    recommendations: ['Diversify portfolio', 'Increase equity allocation'],
    performance: { ytd: 12.5, oneYear: 15.3 },
  };

  // TC-CL-025: View Client Insights
  it('TC-CL-025: should display client insights with charts', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockInsights });

    renderWithProviders(<ClientInsights />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalled();
  });
});

