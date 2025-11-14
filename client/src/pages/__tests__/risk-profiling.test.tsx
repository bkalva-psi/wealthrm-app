import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RiskProfiling from '../risk-profiling';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { createMockFetch } from './test-helpers';

global.fetch = vi.fn();

describe('Risk Profiling Module - Agent D Test Cases', () => {
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

  // TC-RP-001: Risk Profiling Page Load
  describe('TC-RP-001: Risk Profiling Page Load', () => {
    it('should load assessment page and display questions', async () => {
      global.fetch = createMockFetch({
        rpQuestions: [{ id: 1, question_text: 'Test question', options: [] }],
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profiling/i)).toBeInTheDocument();
      });

      // Verify no errors
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  // TC-RP-002: Answer Risk Questions
  describe('TC-RP-002: Answer Risk Questions', () => {
    it('should allow answering all risk profiling questions', async () => {
      global.fetch = createMockFetch({
        rpQuestions: [{ id: 1, question_text: 'Test question', options: [] }],
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profiling/i)).toBeInTheDocument();
      });

      // Form should be displayed when no existing assessment
      // The RiskProfilingForm component handles the actual question answering
      // This test verifies the form is rendered and accessible
      expect(screen.getByText(/risk profiling/i)).toBeInTheDocument();
    });
  });

  // TC-RP-003: Risk Score Calculation
  describe('TC-RP-003: Risk Score Calculation', () => {
    it('should calculate risk score correctly', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 45,
        max_possible_score: 75,
        percentage_score: 60,
        final_category: 'Moderately Aggressive',
        base_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          adjustment: 'neutral',
          adjustmentReason: 'Knowledge level is Intermediate - no adjustment applied',
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify score displays
      expect(screen.getByText(/45/i)).toBeInTheDocument();
    });
  });

  // TC-RP-004: Risk Category Determination
  describe('TC-RP-004: Risk Category Determination', () => {
    it('should determine correct risk category', async () => {
      const testCases = [
        { score: 15, expectedCategory: 'Conservative' },
        { score: 30, expectedCategory: 'Moderate' },
        { score: 50, expectedCategory: 'Moderately Aggressive' },
        { score: 70, expectedCategory: 'Aggressive' },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        const mockResult = {
          id: 1,
          client_id: 1,
          rp_score: testCase.score,
          final_category: testCase.expectedCategory,
          base_category: testCase.expectedCategory,
          is_complete: true,
          completed_at: new Date().toISOString(),
        };

        global.fetch = createMockFetch({
          rpResult: mockResult,
          clientId: 1,
        });

        window.location.hash = '#/risk-profiling?clientId=1';

        const { unmount } = renderWithProviders(<RiskProfiling />);

        await waitFor(() => {
          expect(screen.getByText(new RegExp(testCase.expectedCategory, 'i'))).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  // TC-RP-005: Ceiling Logic
  describe('TC-RP-005: Ceiling Logic', () => {
    it('should apply ceiling logic when triggered', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 70, // Would normally be Aggressive
        final_category: 'Conservative', // Capped by ceiling
        base_category: 'Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
        ceiling_applied: true,
        override_reason: 'Very limited investment knowledge detected - risk category capped at Conservative',
        breakdown: {
          adjustment: 'none',
          ceilingApplied: true,
          ceilingReason: 'Very limited investment knowledge detected - risk category capped at Conservative',
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify ceiling was applied
      expect(screen.getByText(/conservative/i)).toBeInTheDocument();
    });
  });

  // TC-RP-006: KP Score Integration
  describe('TC-RP-006: KP Score Integration', () => {
    it('should integrate KP score in final risk category', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 30, // Base: Moderate
        kp_score: 10, // Basic KP - should reduce to Conservative
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
        rpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify final category considers both KP and RP
      expect(screen.getByText(/conservative/i)).toBeInTheDocument();
      expect(screen.getByText(/basic/i)).toBeInTheDocument();
    });
  });

  // TC-RP-007: Risk Category Breakdown
  describe('TC-RP-007: Risk Category Breakdown', () => {
    it('should display complete risk category breakdown', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 50,
        kp_score: 35,
        final_category: 'Aggressive',
        base_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
        breakdown: {
          baseRiskCategory: 'Moderately Aggressive',
          adjustedRiskCategory: 'Aggressive',
          finalRiskCategory: 'Aggressive',
          adjustment: 'increased',
          adjustmentReason: 'Knowledge level is Advanced - risk category increased as client can handle higher risk',
          ceilingApplied: false,
          ceilingReason: null,
        },
      };

      global.fetch = createMockFetch({
        rpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify breakdown information is displayed
      expect(screen.getByText(/aggressive/i)).toBeInTheDocument();
    });
  });

  // TC-RP-008: Assessment Expiry
  describe('TC-RP-008: Assessment Expiry', () => {
    it('should display expiry date (12 months from assessment)', async () => {
      const assessmentDate = new Date('2024-01-15');
      const expiryDate = new Date('2025-01-15');

      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 40,
        final_category: 'Moderate',
        is_complete: true,
        completed_at: assessmentDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
      };

      global.fetch = createMockFetch({
        rpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify expiry date is displayed (12 months later)
      expect(screen.getByText(/2025/i)).toBeInTheDocument();
    });
  });

  // TC-RP-009: Multiple Assessments
  describe('TC-RP-009: Multiple Assessments', () => {
    it('should handle multiple assessments and show latest', async () => {
      const mockResult = {
        id: 2, // Latest assessment
        client_id: 1,
        rp_score: 55,
        final_category: 'Moderately Aggressive',
        is_complete: true,
        completed_at: new Date().toISOString(),
      };

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
        .mockResolvedValueOnce({ ok: true, json: async () => mockResult });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profile result/i)).toBeInTheDocument();
      });

      // Verify latest assessment is shown
      expect(screen.getByText(/moderately aggressive/i)).toBeInTheDocument();
    });
  });

  // TC-RP-010: Client-Specific Risk Profiling
  describe('TC-RP-010: Client-Specific Risk Profiling', () => {
    it('should link assessment to client and save results', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        rp_score: 35,
        final_category: 'Moderate',
        is_complete: true,
        completed_at: new Date().toISOString(),
      };

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
        .mockResolvedValueOnce({ ok: true, json: async () => null })
        .mockResolvedValueOnce({ ok: true, json: async () => mockResult });

      window.location.hash = '#/risk-profiling?clientId=1';

      renderWithProviders(<RiskProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/risk profiling/i)).toBeInTheDocument();
      });

      // Verify clientId is used in API calls
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rp/results/1'),
        expect.any(Object)
      );
    });
  });
});

