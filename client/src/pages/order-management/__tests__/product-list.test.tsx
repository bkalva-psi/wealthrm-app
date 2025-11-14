import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductList from '../components/product-list';
import { apiRequest } from '@/lib/queryClient';

// Mock API
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('ProductList Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('TC-OM-001: Should display product list with required columns', async () => {
    const mockProducts = [
      {
        id: 1,
        schemeName: 'Test Scheme 1',
        category: 'Equity',
        nav: 25.50,
        minInvestment: 1000,
        maxInvestment: 1000000,
        rta: 'CAMS',
        riskLevel: 'Moderate',
        isWhitelisted: true,
      },
    ];

    vi.mocked(apiRequest).mockResolvedValue({
      json: async () => mockProducts,
      ok: true,
      status: 200,
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <ProductList onAddToCart={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Scheme 1')).toBeInTheDocument();
      expect(screen.getByText('Equity')).toBeInTheDocument();
      expect(screen.getByText('₹25.50')).toBeInTheDocument();
    });
  });

  it('TC-OM-002: Should add product to cart on click', async () => {
    const mockProducts = [
      {
        id: 1,
        schemeName: 'Test Scheme 1',
        category: 'Equity',
        nav: 25.50,
        minInvestment: 1000,
        maxInvestment: 1000000,
        rta: 'CAMS',
        riskLevel: 'Moderate',
        isWhitelisted: true,
      },
    ];

    const onAddToCart = vi.fn();
    vi.mocked(apiRequest).mockResolvedValue({
      json: async () => mockProducts,
      ok: true,
      status: 200,
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <ProductList onAddToCart={onAddToCart} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Scheme 1')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*test scheme 1.*to cart/i });
    fireEvent.click(addButton);
    
    expect(onAddToCart).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('TC-OM-001: Should show loading skeleton while fetching', () => {
    vi.mocked(apiRequest).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ProductList onAddToCart={vi.fn()} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('product-list-skeleton')).toBeInTheDocument();
  });

  it('TC-OM-001: Should show empty state when no products match filters', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      json: async () => [],
      ok: true,
      status: 200,
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <ProductList onAddToCart={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });
});

