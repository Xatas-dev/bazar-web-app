import { toast } from "@/hooks/use-toast";

export const notify = {
  // ── Success ──
  success: (description: string) =>
    toast({ title: "Success", description }),

  // ── Errors by HTTP status ──
  error: {
    forbidden: () =>
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You do not have permission to perform this action.",
      }),

    unauthorized: () =>
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in again to continue.",
      }),

    notFound: () =>
      toast({
        variant: "destructive",
        title: "Not found",
        description: "The requested resource could not be found.",
      }),

    serverError: () =>
      toast({
        variant: "destructive",
        title: "Server error",
        description: "An unexpected error occurred. Please try again.",
      }),

    networkError: () =>
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Unable to reach the server. Please check your connection.",
      }),

    timeout: () =>
      toast({
        variant: "destructive",
        title: "Request timeout",
        description: "The request took too long. Please try again.",
      }),

    validation: (description: string) =>
      toast({
        variant: "destructive",
        title: "Validation error",
        description,
      }),

    generic: (description?: string) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: description ?? "Something went wrong. Please try again.",
      }),
  },
};
