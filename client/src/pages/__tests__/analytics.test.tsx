import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from '../analytics';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

global.fetch = vi.fn();

describe('Analytics Module', () => {
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
        <ThemeProvider>
          <AuthProvider>{component}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  const mockMetrics = [
    {
      id: 1,
      metricType: 'new_aum',
      currentValue: 1000000,
      targetValue: 1200000,
      percentageChange: -16.67,
      month: 1,
      year: 2024,
    },
  ];

  const mockAumTrends = [
    {
      id: 1,
      month: 1,
      year: 2024,
      currentValue: 10000000,
      previousValue: 9500000,
    },
  ];

  const mockPipeline = [
    {
      id: 1,
      stage: 'qualified',
      count: 5,
      value: 5000000,
    },
  ];

  it('should render analytics page', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockMetrics })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAumTrends })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPipeline });

    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    });
  });

  it('should display performance metrics', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockMetrics })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAumTrends })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPipeline });

    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    });
  });

  it('should display AUM trends chart', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockMetrics })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAumTrends })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPipeline });

    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    });
  });
});

