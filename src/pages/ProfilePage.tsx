import { useState, useEffect } from "react";
import { useUser, useUpdateProfile } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
        onSuccess: () => {
             // Toast or feedback
             console.log("Profile updated");
             // If you have a toast component installed:
             // toast({ title: "Profile updated successfully" });
        },
        onError: (err) => {
            console.error("Failed to update profile", err);
        }
    });
  };

  if (isLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
      return <div className="p-8">Please log in.</div>;
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={user.userPic || ""} />
                  <AvatarFallback>{user.userName?.substring(0,2).toUpperCase() || "??"}</AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Username</Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Username"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                  />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
