import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/Navbar.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { useUser } from "@/context/user.context.jsx";

const LANGUAGE_OPTIONS = [
  { value: "cpp", label: "C++" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [chatOpen, setChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: "", message: "" });
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || "cpp");
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
    });
    setSelectedLanguage(user.language || "cpp");
  }, [user]);

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?._id) {
      return;
    }

    setIsSavingProfile(true);
    setProfileFeedback({ type: "", message: "" });

    try {
      const payload = {
        userId: user._id,
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        language: selectedLanguage,
      };

      const response = await axios.patch("/feature/v1/user/profile", payload);
      const updatedUser = response?.data?.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setIsEditing(false);
      setProfileFeedback({ type: "success", message: "Profile updated successfully." });
    } catch (error) {
      setProfileFeedback({
        type: "error",
        message: error?.response?.data?.message || "Unable to update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return null;
  }

  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === (user.language || selectedLanguage))?.label || "C++";
  const avatarFallback = (user.fullName || "User").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePicture} alt={user.fullName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{user.fullName}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="mt-2 text-sm text-muted-foreground">Preferred language: {currentLanguageLabel}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing((prev) => !prev)}>
                {isEditing ? "Cancel" : "Edit profile"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold">Profile details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing ? "Update your account details below." : "Enable edit mode to update your profile information."}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-medium">Full name</p>
              <Input value={formData.fullName} onChange={handleFormChange("fullName")} disabled={!isEditing || isSavingProfile} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Username</p>
              <Input value={formData.username} onChange={handleFormChange("username")} disabled={!isEditing || isSavingProfile} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Email</p>
              <Input type="email" value={formData.email} onChange={handleFormChange("email")} disabled={!isEditing || isSavingProfile} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Preferred language</p>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={!isEditing || isSavingProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-sm font-medium">Bio</p>
            <Textarea value={formData.bio} onChange={handleFormChange("bio")} disabled={!isEditing || isSavingProfile} rows={4} />
          </div>

          {profileFeedback.message ? (
            <p className={`mt-3 text-sm ${profileFeedback.type === "error" ? "text-destructive" : "text-primary"}`}>
              {profileFeedback.message}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={!isEditing || isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>
      </main>

      <ChatSidebar open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
