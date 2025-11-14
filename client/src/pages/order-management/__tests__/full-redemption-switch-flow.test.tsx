/**
 * Full Redemption/Full Switch Read-only Flow Tests
 * Tests the read-only display of Full Redemption and Full Switch orders
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderBook from '../components/order-book';
import FullSwitchRedemptionPanel from '../components/full-switch-redemption-panel';
import { apiRequest } from '@/lib/queryClient';
import { Order, FullSwitchData, FullRedemptionData } from '../types/order.types';

// Mock API
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('Full Redemption/Full Switch Read-only Flow', () => {
  let queryClient: QueryClient;

  const mockFullSwitchOrder: Order = {
    id: 1,
    modelOrderId: 'MO-20241215-FS001',
    clientId: 1,
    orderFormData: {
      cartItems: [
        {
          id: '1',
          productId: 1,
          schemeName: 'Source Scheme',
          transactionType: 'Full Switch',
          amount: 100000,
          nav: 25.50,
          units: 3921.5686,
          closeAc: true,
        },
      ],
      transactionMode: { mode: 'Physical' },
      nominees: [],
      optOutOfNomination: false,
      fullSwitchData: {
        sourceScheme: 'Source Scheme',
        targetScheme: 'Target Scheme',
        units: 3921.5686,
        closeAc: true,
      },
      fullRedemptionData: null,
    },
    status: 'Pending Approval',
    submittedAt: new Date().toISOString(),
  };

  const mockFullRedemptionOrder: Order = {
    id: 2,
    modelOrderId: 'MO-20241215-FR001',
    clientId: 1,
    orderFormData: {
      cartItems: [
        {
          id: '2',
          productId: 2,
          schemeName: 'Redemption Scheme',
          transactionType: 'Full Redemption',
          amount: 50000,
          nav: 30.00,
          units: 1666.6667,
          closeAc: true,
        },
      ],
      transactionMode: { mode: 'Email' },
      nominees: [],
      optOutOfNomination: false,
      fullSwitchData: null,
      fullRedemptionData: {
        schemeName: 'Redemption Scheme',
        units: 1666.6667,
        amount: 50000,
        closeAc: true,
      },
    },
    status: 'Pending Approval',
    submittedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('TC-FRS-001: Should display Full Switch order details in read-only mode', async () => {
    vi.mocked(apiRequest).mockImplementation((method, url) => {
      if (method === 'GET' && url === '/api/order-management/orders') {
        return Promise.resolve([mockFullSwitchOrder]);
      }
      if (method === 'GET' && url === '/api/order-management/orders/1') {
        return Promise.resolve({
          json: async () => mockFullSwitchOrder,
        });
      }
      return Promise.resolve([]);
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrderBook />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('MO-20241215-FS001')).toBeInTheDocument();
    });

    // Click View Details
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);

    // Verify Full Switch panel is displayed
    await waitFor(() => {
      expect(screen.getByText(/full switch details/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Source Scheme')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Target Scheme')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Y')).toBeInTheDocument(); // Close AC
    });

    // Verify special flags are displayed
    // Use getAllByText since "Close Account" appears multiple times (label and in special flags)
    const closeAccountTexts = screen.getAllByText(/close account/i);
    expect(closeAccountTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/bypass min validations/i)).toBeInTheDocument();
  });

  it('TC-FRS-002: Should display Full Redemption order details in read-only mode', async () => {
    vi.mocked(apiRequest).mockImplementation((method, url) => {
      if (method === 'GET' && url === '/api/order-management/orders') {
        return Promise.resolve([mockFullRedemptionOrder]);
      }
      if (method === 'GET' && url === '/api/order-management/orders/2') {
        return Promise.resolve({
          json: async () => mockFullRedemptionOrder,
        });
      }
      return Promise.resolve([]);
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrderBook />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('MO-20241215-FR001')).toBeInTheDocument();
    });

    // Click View Details
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);

    // Verify Full Redemption panel is displayed
    await waitFor(() => {
      expect(screen.getByText(/full redemption details/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Redemption Scheme')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Y')).toBeInTheDocument(); // Close AC
    });

    // Verify special flags are displayed
    // Use getAllByText since "Close Account" appears multiple times (label and in special flags)
    const closeAccountTexts = screen.getAllByText(/close account/i);
    expect(closeAccountTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/bypass min validations/i)).toBeInTheDocument();
  });

  it('TC-FRS-003: Should display all Full Switch fields as read-only', () => {
    const fullSwitchData: FullSwitchData = {
      sourceScheme: 'Source Scheme',
      targetScheme: 'Target Scheme',
      units: 3921.5686,
      closeAc: true,
    };

    render(<FullSwitchRedemptionPanel type="switch" data={fullSwitchData} />);

    // Verify all fields are read-only
    const sourceInput = screen.getByDisplayValue('Source Scheme');
    const targetInput = screen.getByDisplayValue('Target Scheme');
    const unitsInput = screen.getByDisplayValue('3921.5686');
    const closeAcInput = screen.getByDisplayValue('Y');

    expect(sourceInput).toHaveAttribute('readonly');
    expect(targetInput).toHaveAttribute('readonly');
    expect(unitsInput).toHaveAttribute('readonly');
    expect(closeAcInput).toHaveAttribute('readonly');

    // Verify Read Only badge is displayed
    expect(screen.getByText(/read only/i)).toBeInTheDocument();
  });

  it('TC-FRS-004: Should display all Full Redemption fields as read-only', () => {
    const fullRedemptionData: FullRedemptionData = {
      schemeName: 'Redemption Scheme',
      units: 1666.6667,
      amount: 50000,
      closeAc: true,
    };

    render(<FullSwitchRedemptionPanel type="redemption" data={fullRedemptionData} />);

    // Verify all fields are read-only
    const schemeInput = screen.getByDisplayValue('Redemption Scheme');
    const unitsInput = screen.getByDisplayValue('1666.6667');
    const amountInput = screen.getByDisplayValue(/₹50,000/);
    const closeAcInput = screen.getByDisplayValue('Y');

    expect(schemeInput).toHaveAttribute('readonly');
    expect(unitsInput).toHaveAttribute('readonly');
    expect(amountInput).toHaveAttribute('readonly');
    expect(closeAcInput).toHaveAttribute('readonly');

    // Verify Read Only badge is displayed
    expect(screen.getByText(/read only/i)).toBeInTheDocument();
  });

  it('TC-FRS-005: Should show special flags for Full Switch', () => {
    const fullSwitchData: FullSwitchData = {
      sourceScheme: 'Source Scheme',
      targetScheme: 'Target Scheme',
      units: 3921.5686,
      closeAc: true,
    };

    render(<FullSwitchRedemptionPanel type="switch" data={fullSwitchData} />);

    // Verify special flags section
    expect(screen.getByText(/special flags/i)).toBeInTheDocument();
    // Use getAllByText since "Close Account" appears multiple times (label and in special flags)
    const closeAccountTexts = screen.getAllByText(/close account/i);
    expect(closeAccountTexts.length).toBeGreaterThan(0);
    // Text is "Bypass Min Validations: Enabled" - verify key words appear
    // Use getAllByText since "bypass" and "validations" appear in both the flag label and description text
    const bypassTexts = screen.getAllByText(/bypass/i);
    expect(bypassTexts.length).toBeGreaterThan(0);
    const validationsTexts = screen.getAllByText(/validations/i);
    expect(validationsTexts.length).toBeGreaterThan(0);
  });

  it('TC-FRS-006: Should show special flags for Full Redemption', () => {
    const fullRedemptionData: FullRedemptionData = {
      schemeName: 'Redemption Scheme',
      units: 1666.6667,
      amount: 50000,
      closeAc: true,
    };

    render(<FullSwitchRedemptionPanel type="redemption" data={fullRedemptionData} />);

    // Verify special flags section
    expect(screen.getByText(/special flags/i)).toBeInTheDocument();
    // Use getAllByText since "Close Account" appears multiple times (label and in special flags)
    const closeAccountTexts = screen.getAllByText(/close account/i);
    expect(closeAccountTexts.length).toBeGreaterThan(0);
    // Text is "Bypass Min Validations: Enabled" - verify key words appear
    // Use getAllByText since "bypass" and "validations" appear in both the flag label and description text
    const bypassTexts = screen.getAllByText(/bypass/i);
    expect(bypassTexts.length).toBeGreaterThan(0);
    const validationsTexts = screen.getAllByText(/validations/i);
    expect(validationsTexts.length).toBeGreaterThan(0);
  });
});

