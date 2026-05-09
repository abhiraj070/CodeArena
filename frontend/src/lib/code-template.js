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



  python: `def solve():
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
