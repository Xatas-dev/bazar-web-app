import { useState, useEffect } from "react";
import { useUser, useUpdateProfile } from "@/hooks/useUser";

interface ProfileFormData {
  userName: string;
  firstName: string;
  lastName: string;
}

export function useProfileForm() {
  const { user, isLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    userName: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
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
