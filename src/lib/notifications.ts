import { toast } from "@/hooks/use-toast";

export const notify = {
  // ── Errors by HTTP status ──
  error: {
    forbidden: () =>
      toast({
        variant: "destructive",
        title: "Доступ запрещён",
        description: "У вас нет прав на выполнение этого действия.",
      }),

    unauthorized: () =>
      toast({
        variant: "destructive",
        title: "Требуется аутентификация",
        description: "Пожалуйста, войдите снова для продолжения.",
      }),


    serverError: () =>
      toast({
        variant: "destructive",
        title: "Ошибка сервера",
        description: "Произошла неожиданная ошибка. Пожалуйста, попробуйте снова.",
      }),

    networkError: () =>
      toast({
        variant: "destructive",
        title: "Ошибка соединения",
        description: "Не удаётся связаться с сервером. Проверьте подключение.",
      }),

    timeout: () =>
      toast({
        variant: "destructive",
        title: "Тайм-аут запроса",
        description: "Запрос занял слишком много времени. Пожалуйста, попробуйте снова.",
      }),

    validation: (description: string) =>
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description,
      }),

    generic: (description?: string) =>
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: description ?? "Что-то пошло не так. Пожалуйста, попробуйте снова.",
      }),
  },
};
