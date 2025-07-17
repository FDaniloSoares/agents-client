import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateQuestionAPIRequest } from './types/create-question-request';
import type { CreateQuestionAPIResponse } from './types/create-question-response';
import type { GetRoomQuestionsAPIResponse } from './types/get-room-questions-response';

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionAPIRequest) => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'Application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result: CreateQuestionAPIResponse = await response.json();

      return result;
    },

    // Executa no monento que for feta chamada para API
    onMutate({ question }) {
      // atualizar
      const questions = queryClient.getQueryData<GetRoomQuestionsAPIResponse>([
        'get-questions',
        roomId,
      ]);

      const questionsArray = questions ?? [];

      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true,
      };

      queryClient.setQueriesData<GetRoomQuestionsAPIResponse>(
        { queryKey: ['get-questions', roomId] },
        [newQuestion, ...questionsArray]
      );

      return { newQuestion, questions };
    },

    onSuccess: (data, _variable, context) => {
      queryClient.setQueriesData<GetRoomQuestionsAPIResponse>(
        { queryKey: ['get-questions', roomId] },
        (questions) => {
          if (!questions) {
            return questions;
          }

          if (!context.newQuestion) {
            return questions;
          }

          return questions.map((question) => {
            if (question.id === context.newQuestion.id) {
              return {
                ...context.newQuestion,
                id: data.questionId,
                answer: data.answer,
                isGeneratingAnswer: false,
              };
            }
            return question;
          });
        }
      );
    },

    onError: (_error, _variable, context) => {
      if (context?.questions) {
        queryClient.setQueriesData<GetRoomQuestionsAPIResponse>(
          { queryKey: ['get-questions', roomId] },
          context.questions
        );
      }
    },
  });
}
