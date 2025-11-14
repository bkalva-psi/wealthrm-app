import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeProfiling from '../knowledge-profiling';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { createMockFetch, mockKPQuestions } from './test-helpers';

global.fetch = vi.fn();

describe('Knowledge Profiling Module - Agent D Test Cases', () => {
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

  // TC-KP-001: Knowledge Profiling Page Load
  describe('TC-KP-001: Knowledge Profiling Page Load', () => {
    it('should load assessment page and display questions', async () => {
      global.fetch = createMockFetch({});

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText(/knowledge profiling/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify no errors in console (checking that component rendered successfully)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  // TC-KP-002: Answer Questions
  describe('TC-KP-002: Answer Questions', () => {
    it('should allow answering all questions and persist answers', async () => {
      global.fetch = createMockFetch({});

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Answer first question
      const beginnerOption = screen.getByLabelText(/beginner/i);
      fireEvent.click(beginnerOption);
      expect(beginnerOption).toBeChecked();

      // Navigate to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      // Answer second question
      const yearsOption = screen.getByLabelText(/1-5 years/i);
      fireEvent.click(yearsOption);
      expect(yearsOption).toBeChecked();

      // Navigate back to verify answer persisted
      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
        const checkedOption = screen.getByLabelText(/beginner/i) as HTMLInputElement;
        expect(checkedOption.checked).toBe(true);
      });
    });
  });

  // TC-KP-003: Question Navigation
  describe('TC-KP-003: Question Navigation', () => {
    it('should navigate between questions correctly', async () => {
      global.fetch = createMockFetch({});

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Answer and go to next
      fireEvent.click(screen.getByLabelText(/beginner/i));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      // Go back
      fireEvent.click(screen.getByRole('button', { name: /previous/i }));

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Verify progress updates
      expect(screen.getByText(/question/i)).toBeInTheDocument();
    });
  });

  // TC-KP-004: Submit Assessment
  describe('TC-KP-004: Submit Assessment', () => {
    it('should submit assessment and display results', async () => {
      const mockResult = {
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

      global.fetch = createMockFetch({
        kpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Answer all required questions
      fireEvent.click(screen.getByLabelText(/beginner/i));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText(/1-5 years/i));
      fireEvent.click(screen.getByRole('button', { name: /submit assessment/i }));

      await waitFor(() => {
        expect(screen.getByText(/knowledge profile result/i)).toBeInTheDocument();
      });

      // Verify results display
      expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    });
  });

  // TC-KP-005: Score Calculation
  describe('TC-KP-005: Score Calculation', () => {
    it('should calculate score correctly based on answers', async () => {
      const mockResult = {
        id: 1,
        client_id: 1,
        total_score: 6, // 3 (Advanced) + 3 (More than 5 years)
        max_possible_score: 9,
        percentage_score: 66.7,
        knowledge_level: 'Intermediate',
        is_complete: true,
        completed_at: new Date().toISOString(),
        categoryBreakdown: [
          {
            category: 'Experience',
            categoryName: 'Experience',
            score: 6,
            maxScore: 9,
            percentage: 66.7,
            questionCount: 2,
          },
        ],
      };

      global.fetch = createMockFetch({
        kpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Select Advanced (weightage 3)
      fireEvent.click(screen.getByLabelText(/advanced/i));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      // Select More than 5 years (weightage 3)
      fireEvent.click(screen.getByLabelText(/more than 5 years/i));
      fireEvent.click(screen.getByRole('button', { name: /submit assessment/i }));

      await waitFor(() => {
        expect(screen.getByText(/knowledge profile result/i)).toBeInTheDocument();
      });

      // Verify score breakdown displays
      expect(screen.getByText(/66\.7%/i)).toBeInTheDocument();
    });
  });

  // TC-KP-006: Incomplete Assessment Validation
  describe('TC-KP-006: Incomplete Assessment Validation', () => {
    it('should prevent submission when required questions are unanswered', async () => {
      global.fetch = createMockFetch({
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Don't answer first question, try to submit
      const submitButton = screen.getByRole('button', { name: /submit assessment/i });
      expect(submitButton).toBeDisabled();

      // Answer first but not second
      fireEvent.click(screen.getByLabelText(/beginner/i));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      // Try to submit without answering second question
      const submitButton2 = screen.getByRole('button', { name: /submit assessment/i });
      expect(submitButton2).toBeDisabled();
    });
  });

  // TC-KP-007: Client-Specific Assessment
  describe('TC-KP-007: Client-Specific Assessment', () => {
    it('should link assessment to client and save results', async () => {
      const mockResult = {
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

      global.fetch = createMockFetch({
        kpResult: mockResult,
        clientId: 1,
      });

      window.location.hash = '#/knowledge-profiling?clientId=1';

      renderWithProviders(<KnowledgeProfiling />);

      await waitFor(() => {
        expect(screen.getByText('What is your investment experience?')).toBeInTheDocument();
      });

      // Complete assessment
      fireEvent.click(screen.getByLabelText(/beginner/i));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('How long have you been investing?')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText(/1-5 years/i));
      fireEvent.click(screen.getByRole('button', { name: /submit assessment/i }));

      await waitFor(() => {
        expect(screen.getByText(/knowledge profile result/i)).toBeInTheDocument();
      });

      // Verify results are linked to client (check that clientId was used in API call)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kp/responses'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"client_id":1'),
        })
      );
    });
  });
});

