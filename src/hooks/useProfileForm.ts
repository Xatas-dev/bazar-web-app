import { useState, useEffect } from "react";
import { useUser, useUpdateProfile } from "@/hooks/useUser";

interface ProfileFormData {
  displayName: string;
}

export function useProfileForm() {
  const { user, isLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ displayName: formData.displayName });
  };

  return {
    user,
    isLoading,
    formData,
    handleChange,
    handleSubmit,
    isPending: updateProfileMutation.isPending,
  };
}
