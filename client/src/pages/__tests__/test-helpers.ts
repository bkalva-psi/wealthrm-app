import { vi } from 'vitest';

export const mockUser = {
  id: 1,
  username: 'rm1@primesoft.net',
  fullName: 'Test User',
  role: 'RM',
};

export const mockKPQuestions = [
  {
    id: 1,
    question_text: 'What is your investment experience?',
    question_category: 'Experience',
    question_type: 'single_choice',
    display_order: 1,
    is_required: true,
    options: [
      { id: 1, option_text: 'Beginner', option_value: 'beginner', weightage: 1, display_order: 1 },
      { id: 2, option_text: 'Intermediate', option_value: 'intermediate', weightage: 2, display_order: 2 },
      { id: 3, option_text: 'Advanced', option_value: 'advanced', weightage: 3, display_order: 3 },
    ],
  },
  {
    id: 2,
    question_text: 'How long have you been investing?',
    question_category: 'Experience',
    question_type: 'single_choice',
    display_order: 2,
    is_required: true,
    options: [
      { id: 4, option_text: 'Less than 1 year', option_value: 'lt1', weightage: 1, display_order: 1 },
      { id: 5, option_text: '1-5 years', option_value: '1-5', weightage: 2, display_order: 2 },
      { id: 6, option_text: 'More than 5 years', option_value: 'gt5', weightage: 3, display_order: 3 },
    ],
  },
  {
    id: 3,
    question_text: 'What is your understanding of mutual funds?',
    question_category: 'investment_basics',
    question_type: 'single_choice',
    display_order: 3,
    is_required: false,
    options: [
      { id: 7, option_text: 'No knowledge', option_value: 'none', weightage: 1, display_order: 1 },
      { id: 8, option_text: 'Basic understanding', option_value: 'basic', weightage: 2, display_order: 2 },
      { id: 9, option_text: 'Good understanding', option_value: 'good', weightage: 3, display_order: 3 },
    ],
  },
];

export function createMockFetch(options: {
  kpQuestions?: any[];
  kpResult?: any;
  rpResult?: any;
  rpQuestions?: any[];
  clientId?: number;
}) {
  const {
    kpQuestions = mockKPQuestions,
    kpResult = null,
    rpResult = null,
    rpQuestions = [],
    clientId,
  } = options;

  return vi.fn().mockImplementation((url: string, config?: any) => {
    // Auth endpoint
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ user: mockUser }),
      });
    }

    // Knowledge Profiling endpoints
    if (url.includes('/api/kp/questionnaire')) {
      return Promise.resolve({
        ok: true,
        json: async () => kpQuestions,
      });
    }

    if (url.includes('/api/kp/results/')) {
      if (kpResult === null) {
        return Promise.resolve({
          status: 404,
          json: async () => null,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => kpResult,
      });
    }

    if (url.includes('/api/kp/responses')) {
      return Promise.resolve({
        ok: true,
        json: async () => kpResult || { id: 1, client_id: clientId, is_complete: true },
      });
    }

    // Risk Profiling endpoints
    if (url.includes('/api/rp/results/')) {
      if (rpResult === null) {
        return Promise.resolve({
          status: 404,
          json: async () => null,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => rpResult,
      });
    }

    if (url.includes('/api/rp/questions')) {
      return Promise.resolve({
        ok: true,
        json: async () => rpQuestions,
      });
    }

    if (url.includes('/api/rp/submit')) {
      return Promise.resolve({
        ok: true,
        json: async () => rpResult || { id: 1, client_id: clientId, is_complete: true },
      });
    }

    // Default response
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
}

