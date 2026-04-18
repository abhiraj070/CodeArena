import { useState } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { currentUser } from "@/lib/mock-data.js";

export default function ProfilePage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{currentUser.name}</h1>
              <p className="text-sm text-muted-foreground">{currentUser.handle}</p>
              <p className="mt-2 max-w-xl text-sm text-foreground">{currentUser.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit profile</Button>
              <Button>Share</Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Questions solved" value={currentUser.stats.solved} />
          <Stat label="Sessions joined" value={currentUser.stats.sessions} />
          <Stat label="Day streak" value={currentUser.stats.streak} />
        </div>

        <Card className="mt-6 p-6">
          <h2 className="mb-3 text-base font-semibold">Recent activity</h2>
          <ul className="divide-y divide-border text-sm">
            <li className="flex justify-between py-2.5">
              <span>Solved "Two Sum"</span>
              <span className="text-muted-foreground">2h ago</span>
            </li>
            <li className="flex justify-between py-2.5">
              <span>Paired with Maya Chen on "LRU Cache"</span>
              <span className="text-muted-foreground">Yesterday</span>
            </li>
            <li className="flex justify-between py-2.5">
              <span>Started "Word Ladder"</span>
              <span className="text-muted-foreground">3d ago</span>
            </li>
          </ul>
        </Card>
      </main>

      <ChatSidebar open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
