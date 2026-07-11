export interface TestCase {
  input: string;        // String representation of parameters, e.g. "[2, 7, 11, 15], 9"
  expected: any;        // Expected value, e.g. [0, 1]
  paramValues: any[];   // Parsed parameters to call the function with
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starterCode: {
    javascript: string;
    python: string;
  };
  testCases: TestCase[];
}

export const codingChallenges: CodingChallenge[] = [
  {
    id: 'code_two_sum',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

### Example 1:
**Input:** nums = [2, 7, 11, 15], target = 9
**Output:** [0, 1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2:
**Input:** nums = [3, 2, 4], target = 6
**Output:** [1, 2]`,
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    testCases: [
      {
        input: '[2, 7, 11, 15], 9',
        expected: [0, 1],
        paramValues: [[2, 7, 11, 15], 9]
      },
      {
        input: '[3, 2, 4], 6',
        expected: [1, 2],
        paramValues: [[3, 2, 4], 6]
      },
      {
        input: '[3, 3], 6',
        expected: [0, 1],
        paramValues: [[3, 3], 6]
      }
    ]
  },
  {
    id: 'code_valid_parentheses',
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
**Input:** s = "()"
**Output:** true

### Example 2:
**Input:** s = "()[]{}"
**Output:** true

### Example 3:
**Input:** s = "(]"
**Output:** false`,
    difficulty: 'easy',
    category: 'Stacks',
    starterCode: {
      javascript: `function isValid(s) {
  // Write your code here
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`,
      python: `def is_valid(s):
    # Write your code here
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            return False
    return len(stack) == 0`
    },
    testCases: [
      {
        input: '"()"',
        expected: true,
        paramValues: ["()"]
      },
      {
        input: '"()[]{}"',
        expected: true,
        paramValues: ["()[]{}"]
      },
      {
        input: '"(]"',
        expected: false,
        paramValues: ["(]"]
      },
      {
        input: '"([)]"',
        expected: false,
        paramValues: ["([)]"]
      }
    ]
  },
  {
    id: 'code_is_palindrome',
    title: 'Palindrome Number',
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.

### Example 1:
**Input:** x = 121
**Output:** true

### Example 2:
**Input:** x = -121
**Output:** false (Reads -121 as 121- from right to left)`,
    difficulty: 'easy',
    category: 'Math',
    starterCode: {
      javascript: `function isPalindrome(x) {
  // Write your code here
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}`,
      python: `def is_palindrome(x):
    # Write your code here
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`
    },
    testCases: [
      {
        input: '121',
        expected: true,
        paramValues: [121]
      },
      {
        input: '-121',
        expected: false,
        paramValues: [-121]
      },
      {
        input: '10',
        expected: false,
        paramValues: [10]
      }
    ]
  }
];
