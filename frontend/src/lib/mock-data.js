const avatar = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const questions = [
  {
    id: "q1",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    tags: ["Array", "Hash Table"],
    acceptance: 52.4,
    solved: true,
    example: { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
  },
  {
    id: "q2",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    tags: ["String", "Sliding Window"],
    acceptance: 34.1,
    solved: false,
    example: { input: 's = "abcabcbb"', output: "3" },
  },
  {
    id: "q3",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    tags: ["Array", "Binary Search"],
    acceptance: 38.7,
    locked: true,
    example: { input: "nums1 = [1,3], nums2 = [2]", output: "2.0" },
  },
  {
    id: "q4",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    tags: ["Stack", "String"],
    acceptance: 41.2,
    solved: true,
    example: { input: 's = "()[]{}"', output: "true" },
  },
  {
    id: "q5",
    title: "Merge Intervals",
    difficulty: "Medium",
    description:
      "Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return an array of the non-overlapping intervals.",
    tags: ["Array", "Sorting"],
    acceptance: 46.9,
    example: { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
  },
  {
    id: "q6",
    title: "Word Ladder",
    difficulty: "Hard",
    description:
      "Given two words beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    tags: ["BFS", "Graph"],
    acceptance: 36.3,
    example: { input: '"hit" -> "cog"', output: "5" },
  },
  {
    id: "q7",
    title: "Reverse Linked List",
    difficulty: "Easy",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    tags: ["Linked List", "Recursion"],
    acceptance: 73.8,
    solved: true,
    example: { input: "1 -> 2 -> 3 -> 4 -> 5", output: "5 -> 4 -> 3 -> 2 -> 1" },
  },
  {
    id: "q8",
    title: "LRU Cache",
    difficulty: "Medium",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations in O(1) average time complexity.",
    tags: ["Design", "Hash Table"],
    acceptance: 42.1,
    example: { input: "capacity = 2", output: "see operations" },
  },
  {
    id: "q9",
    title: "Number of Islands",
    difficulty: "Medium",
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    tags: ["DFS", "BFS", "Matrix"],
    acceptance: 56.0,
    example: { input: "grid 4x5", output: "3" },
  },
  {
    id: "q10",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    tags: ["Array", "Two Pointers", "Stack"],
    acceptance: 59.4,
    locked: true,
    example: { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
  },
  {
    id: "q11",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day. Maximize your profit by choosing a single day to buy and a different day in the future to sell.",
    tags: ["Array", "DP"],
    acceptance: 54.2,
    solved: true,
    example: { input: "[7,1,5,3,6,4]", output: "5" },
  },
  {
    id: "q12",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    tags: ["Tree", "BFS"],
    acceptance: 64.5,
    example: { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
  },
];

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

export const currentUser = {
  name: "Alex Morgan",
  handle: "@alexm",
  avatar: avatar("Alex Morgan"),
  bio: "Full-stack engineer. Loves clean code, algorithms, and pair programming.",
  stats: { solved: 142, sessions: 38, streak: 12 },
};

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

export const STARTER_CODE = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solve(nums, target) {
  // Write your solution here
  return [];
}
`,
  typescript: `function solve(nums: number[], target: number): number[] {
  // Write your solution here
  return [];
}
`,
  python: `from typing import List

class Solution:
    def solve(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        return []
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`,
  java: `import java.util.*;

class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`,
};
