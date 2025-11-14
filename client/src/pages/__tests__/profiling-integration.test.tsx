import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import KnowledgeProfiling from '../knowledge-profiling';
import RiskProfiling from '../risk-profiling';
import { createMockFetch } from './test-helpers';

global.fetch = vi.fn();

describe('Profiling Integration Tests - Agent D', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    window.location.hash = '';
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


  // TC-INT-001: Profiling to Client Integration
  describe('TC-INT-001: Profiling to Client Integration', () => {
    it('should integrate KP and RP profiles with client and display correctly', async () => {
      const mockKPResult = {
        id: 1,
        client_id: 1,
        total_score: 25,
        max_possible_score: 45,
        percentage_score: 55.6,
        knowledge_level: 'Intermediate',
        is_complete: true,
        completed_at: new Date().toISOString(),
        categoryBreakdown: [],
      };

      const mockRPResult = {
        id: 1,
        client_id: 1,
        rp_score: 40,
        max_possible_score: 75,
        percentage_score: 53.3,
        final_category: 'Moderate',
        base_category: 'Moderate',
        kp_score: 25,
        knowledge_level: 'Intermediate',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          adjustment: 'neutral',
          adjustmentReason: 'Knowledge level is Intermediate - no adjustment applied',
        },
      };

      // Test KP integration
      global.fetch = createMockFetch({
        kpResult: mockKPResult,
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      const { unmount: unmountKP } = renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/knowledge profile result/i)).toBeInTheDocument();
      });

      // Verify KP data displays
      expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
      expect(screen.getByText(/55\.6%/i)).toBeInTheDocument();

      unmountKP();

      // Test RP integration
      vi.clearAllMocks();
      global.fetch = createMockFetch({
        rpResult: mockRPResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify RP data displays with KP integration
      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
      expect(screen.getByText(/40/i)).toBeInTheDocument();

      // Verify both profiles are linked to the same client
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rp/results/1'),
        expect.any(Object)
      );
    });

    it('should update client record when profiles are completed', async () => {
      const mockKPResult = {
        id: 1,
        client_id: 1,
        total_score: 30,
        knowledge_level: 'Intermediate',
        is_complete: true,
        completed_at: new Date().toISOString(),
      };

      const mockRPResult = {
        id: 1,
        client_id: 1,
        rp_score: 45,
        final_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
      };

      // Verify that when KP is completed, it's saved to client
      global.fetch = createMockFetch({
        kpResult: mockKPResult,
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      const { unmount } = renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/knowledge profile result/i)).toBeInTheDocument();
      });

      // Verify API was called to save results
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kp/results/1'),
        expect.any(Object)
      );

      unmount();

      // Verify that when RP is completed, it's saved to client
      vi.clearAllMocks();
      global.fetch = createMockFetch({
        rpResult: mockRPResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify API was called to save results
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rp/results/1'),
        expect.any(Object)
      );
    });
  });

  // TC-INT-002: Profiling to Portfolio Recommendations
  describe('TC-INT-002: Profiling to Portfolio Recommendations', () => {
    it('should show portfolio recommendations matching risk category', async () => {
      const mockRPResult = {
        id: 1,
        client_id: 1,
        rp_score: 50,
        max_possible_score: 75,
        percentage_score: 66.7,
        final_category: 'Moderately Aggressive',
        base_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          adjustment: 'neutral',
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockRPResult,
        rpQuestions: [{ id: 1, question_text: 'Test question', options: [] }],
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify risk category is displayed
      expect(screen.getByText(/moderately aggressive/i)).toBeInTheDocument();

      // Verify portfolio recommendations section exists
      expect(screen.getByText(/portfolio recommendations/i)).toBeInTheDocument();

      // Verify recommendation details match risk category
      // Moderately Aggressive should show:
      // - Expected Return: 12-15%
      // - Volatility: Moderate-High
      // - Equity Allocation: 60-70%
      // - Debt Allocation: 30-40%
      expect(screen.getByText(/expected return/i)).toBeInTheDocument();
      expect(screen.getByText(/volatility/i)).toBeInTheDocument();
      expect(screen.getByText(/equity allocation/i)).toBeInTheDocument();
      expect(screen.getByText(/debt allocation/i)).toBeInTheDocument();
    });

    it('should adjust recommendations based on combined KP and RP scores', async () => {
      const mockRPResult = {
        id: 1,
        client_id: 1,
        rp_score: 30, // Base: Moderate
        kp_score: 10, // Basic KP - reduces to Conservative
        final_category: 'Conservative',
        base_category: 'Moderate',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          adjustment: 'reduced',
          adjustmentReason: 'Knowledge level is Basic - risk category reduced for safety',
          knowledgeLevel: 'Basic',
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockRPResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify final category is Conservative (reduced from Moderate due to Basic KP)
      expect(screen.getByText(/conservative/i)).toBeInTheDocument();

      // Verify recommendations match Conservative category:
      // - Expected Return: 6-8%
      // - Volatility: Low
      // - Equity Allocation: 20-30%
      // - Debt Allocation: 70-80%
      expect(screen.getByText(/portfolio recommendations/i)).toBeInTheDocument();
    });

    it('should show combined assessment information when both KP and RP are completed', async () => {
      const mockRPResult = {
        id: 1,
        client_id: 1,
        rp_score: 50,
        kp_score: 35,
        final_category: 'Aggressive',
        base_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          adjustment: 'increased',
          adjustmentReason: 'Knowledge level is Advanced - risk category increased as client can handle higher risk',
          knowledgeLevel: 'Advanced',
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockRPResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify combined assessment info is displayed
      expect(screen.getByText(/combined assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/risk profiling.*rp.*50/i)).toBeInTheDocument();
      expect(screen.getByText(/knowledge profiling.*kp.*35/i)).toBeInTheDocument();
    });
  });
});

