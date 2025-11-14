import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from '../products';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

global.fetch = vi.fn();

describe('Products Module', () => {
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

  const mockProducts = [
    {
      id: 1,
      name: 'Equity Fund',
      productCode: 'EQ001',
      category: 'Mutual Funds',
      description: 'A diversified equity fund',
      keyFeatures: ['Diversification', 'Long-term growth'],
      minInvestment: '₹5000',
      riskLevel: 'High',
      isOpenForSubscription: true,
      featured: true,
      tags: ['equity', 'growth'],
      regulatoryApprovals: ['SEBI'],
    },
    {
      id: 2,
      name: 'Debt Fund',
      productCode: 'DEBT001',
      category: 'Mutual Funds',
      description: 'A conservative debt fund',
      keyFeatures: ['Stable returns', 'Low risk'],
      minInvestment: '₹10000',
      riskLevel: 'Low',
      isOpenForSubscription: true,
      featured: false,
      tags: ['debt', 'conservative'],
      regulatoryApprovals: ['SEBI'],
    },
  ];

  it('should render products page', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts });

    renderWithProviders(<Products />);

    await waitFor(() => {
      expect(screen.getByText(/products/i)).toBeInTheDocument();
    });
  });

  it('should display product cards', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts });

    renderWithProviders(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Equity Fund')).toBeInTheDocument();
      expect(screen.getByText('Debt Fund')).toBeInTheDocument();
    });
  });

  it('should filter products by search', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts });

    renderWithProviders(<Products />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search products/i);
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'Equity' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Equity Fund')).toBeInTheDocument();
      expect(screen.queryByText('Debt Fund')).not.toBeInTheDocument();
    });
  });

  it('should handle empty products list', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithProviders(<Products />);

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });
});

