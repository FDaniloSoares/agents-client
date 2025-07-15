import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateQuestionAPIRequest } from './types/create-question-request';
import type { CreateQuestionAPIResponse } from './types/create-question-response';

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

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-questions', roomId] });
    },
  });
}
