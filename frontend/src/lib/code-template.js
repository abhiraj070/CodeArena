const avatar = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  

export const users = [
  { id: "u1", name: "Aarav Sharma", avatar: avatar("Aarav"), online: true, role: "Frontend" },
  { id: "u2", name: "Maya Chen", avatar: avatar("Maya"), online: true, role: "Backend" },
  { id: "u3", name: "Liam Patel", avatar: avatar("Liam"), online: false, role: "Full Stack" },
  { id: "u4", name: "Sofia Rossi", avatar: avatar("Sofia"), online: true, role: "Algorithms" },
  { id: "u5", name: "Noah Kim", avatar: avatar("Noah"), online: false, role: "Systems" },
  { id: "u6", name: "Zara Ahmed", avatar: avatar("Zara"), online: true, role: "ML" },
  { id: "u7", name: "Ethan Brown", avatar: avatar("Ethan"), online: false, role: "iOS" },
  { id: "u8", name: "Priya Iyer", avatar: avatar("Priya"), online: true, role: "DevOps" },
  { id: "u9", name: "Lucas Müller", avatar: avatar("Lucas"), online: false, role: "Security" },
  { id: "u10", name: "Hana Tanaka", avatar: avatar("Hana"), online: true, role: "Frontend" },
];

export const conversations = [
  {
    id: "c1",
    user: users[0],
    lastMessage: "Want to pair on Two Sum?",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Hey! Free for a session?", time: "10:24" },
      { id: "m2", from: "me", text: "Yes — give me 5 minutes.", time: "10:25" },
      { id: "m3", from: "them", text: "Want to pair on Two Sum?", time: "10:26" },
    ],
  },
  {
    id: "c2",
    user: users[1],
    lastMessage: "Sent the session code 🚀",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Sent the session code 🚀", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    user: users[3],
    lastMessage: "Thanks for the help!",
    unread: 0,
    messages: [
      { id: "m1", from: "me", text: "Anytime!", time: "Mon" },
      { id: "m2", from: "them", text: "Thanks for the help!", time: "Mon" },
    ],
  },
];


export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

export const STARTER_CODE = {



  javascript: 
  `function solve(input) {
    //write your code here

}`,



  typescript: 
  `function solve(input: string): string {
    // process input
    return
}`,



  python: `
def solve():
    # your code here
    pass

if __name__ == "__main__":
    solve()
`,



  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
	// your code goes here

}`,



  java: `import java.util.*;

public class Main {
    public static void main() {
        // your code here
    }
}`,
};
