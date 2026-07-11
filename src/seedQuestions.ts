import { Question } from './types';

export const seedQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Can you tell me about yourself and your background in software engineering?',
    type: 'hr',
    jobRole: 'Software Engineer',
    difficulty: 'easy',
    idealAnswer: 'I am a software engineer with experience building web applications. I specialize in full-stack development using frameworks like React and Node.js. In my previous role, I worked on scaling backend APIs, optimizing database queries, and improving user interface performance.',
    keywords: ['software', 'experience', 'React', 'Node.js', 'backend', 'APIs']
  },
  {
    id: 'q2',
    text: 'What are the main differences between relational databases and non-relational databases, and when would you choose one over the other?',
    type: 'technical',
    jobRole: 'Software Engineer',
    difficulty: 'medium',
    idealAnswer: 'Relational databases store data in structured tables with defined schemas and relationships, supporting ACID transactions. Non-relational databases store unstructured or semi-structured data (like documents, key-values, or graphs) and offer high scalability. I would choose relational for complex transactional systems like banking, and non-relational for rapid growth, unstructured content, or horizontal scalability.',
    keywords: ['relational', 'schemas', 'ACID', 'transactions', 'scalability', 'document', 'SQL', 'NoSQL']
  },
  {
    id: 'q3',
    text: 'Describe how a REST API works. What are some of the key HTTP methods and status codes?',
    type: 'technical',
    jobRole: 'Software Engineer',
    difficulty: 'easy',
    idealAnswer: 'REST APIs are stateless, client-server architectures that use standard HTTP protocols to interact with resources. Key methods include GET to retrieve data, POST to create, PUT to update, and DELETE to remove. Common status codes are 200 OK for success, 201 Created, 400 Bad Request, 401 Unauthorized, and 500 Server Error.',
    keywords: ['REST', 'HTTP', 'stateless', 'GET', 'POST', 'PUT', 'DELETE', 'status codes', 'resources']
  },
  {
    id: 'q4',
    text: 'Explain the concept of "Closures" in JavaScript and provide a practical use case.',
    type: 'technical',
    jobRole: 'Software Engineer',
    difficulty: 'medium',
    idealAnswer: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In JavaScript, closures are created every time a function is created, at function creation time. A practical use case is data privacy, where closures are used to create private variables and methods that cannot be accessed directly from the outside.',
    keywords: ['closure', 'lexical environment', 'function', 'privacy', 'variables', 'scope']
  },
  {
    id: 'q5',
    text: 'You have a drawer with 10 red socks and 10 blue socks. If you close your eyes and pull socks out one by one, what is the minimum number of socks you must pull to guarantee you have a matching pair?',
    type: 'aptitude',
    jobRole: 'Software Engineer',
    difficulty: 'easy',
    idealAnswer: 'The minimum number of socks you must pull is 3. Since there are only 2 colors (red and blue), by the Pigeonhole Principle, pulling 3 socks ensures that at least 2 of them must be the same color, guaranteeing a matching pair.',
    keywords: ['3', 'colors', 'Pigeonhole', 'pair', 'guarantee']
  },
  {
    id: 'q6',
    text: 'Why do you want to work as a Data Analyst, and what tools do you typically use for data wrangling and visualization?',
    type: 'hr',
    jobRole: 'Data Analyst',
    difficulty: 'easy',
    idealAnswer: 'I am passionate about turning raw data into actionable business insights that drive decisions. I regularly use SQL for querying data, Python (with pandas and NumPy) for data wrangling, and tools like Tableau, Power BI, or matplotlib for creating clear and interactive dashboards.',
    keywords: ['insights', 'decisions', 'SQL', 'Python', 'pandas', 'Tableau', 'Power BI', 'dashboards']
  },
  {
    id: 'q7',
    text: 'What is the purpose of a JOIN in SQL? Explain the differences between an INNER JOIN, LEFT JOIN, and outer JOIN.',
    type: 'technical',
    jobRole: 'Data Analyst',
    difficulty: 'easy',
    idealAnswer: 'SQL JOINs are used to combine rows from two or more tables based on a related column. An INNER JOIN returns records that have matching values in both tables. A LEFT JOIN returns all records from the left table and matched records from the right. A FULL OUTER JOIN returns all records when there is a match in either left or right table.',
    keywords: ['JOIN', 'combine', 'INNER JOIN', 'LEFT JOIN', 'tables', 'matching', 'values']
  },
  {
    id: 'q8',
    text: 'How do you handle missing or corrupt data in a dataset during the preprocessing phase?',
    type: 'technical',
    jobRole: 'Data Analyst',
    difficulty: 'medium',
    idealAnswer: 'Handling missing data depends on its nature and quantity. If the missingness is random and small, I might drop those rows. Alternatively, I can impute the values using mean, median, or mode for numerical data, or forward/backward fill for time series. For categorical data, I can use a default category like "Unknown" or predict missing values using algorithms.',
    keywords: ['preprocessing', 'impute', 'mean', 'median', 'drop', 'rows', 'imputation', 'fill']
  },
  {
    id: 'q9',
    text: 'What is A/B testing, and how would you set up a statistical hypothesis test to determine if a new webpage layout increases click-through rates?',
    type: 'technical',
    jobRole: 'Data Analyst',
    difficulty: 'hard',
    idealAnswer: 'A/B testing is a randomized experimentation process where two versions of a webpage are compared. To test a new layout, I define a Null Hypothesis (no change in click-through rate) and an Alternative Hypothesis. I randomly split traffic, calculate sample size for statistical power, collect click data, and perform a two-sample t-test or z-test to see if the p-value is below our significance level (typically 0.05).',
    keywords: ['A/B testing', 'Hypothesis', 'Null', 'Alternative', 'z-test', 't-test', 'p-value', 'significance']
  },
  {
    id: 'q10',
    text: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    type: 'aptitude',
    jobRole: 'Data Analyst',
    difficulty: 'medium',
    idealAnswer: 'The ball costs $0.05 (or 5 cents). If the ball costs x, the bat costs x + $1.00. Together: x + (x + 1.00) = 1.10 => 2x + 1.00 = 1.10 => 2x = 0.10 => x = 0.05.',
    keywords: ['0.05', '5 cents', 'algebra', 'equation', 'cost']
  },
  {
    id: 'q11',
    text: 'What sparked your interest in AI and Machine Learning, and how do you keep up with the latest advancements in the field?',
    type: 'hr',
    jobRole: 'AI/ML Engineer',
    difficulty: 'easy',
    idealAnswer: 'My interest in AI stems from its potential to solve complex real-world problems through learned patterns rather than hard-coded logic. I keep up with advancements by reading research papers on arXiv, attending conferences like NeurIPS and CVPR, participating in Kaggle competitions, and following tech blogs.',
    keywords: ['AI', 'Machine Learning', 'advancements', 'arXiv', 'papers', 'research', 'Kaggle']
  },
  {
    id: 'q12',
    text: 'Explain the difference between supervised, unsupervised, and reinforcement learning, with examples for each.',
    type: 'technical',
    jobRole: 'AI/ML Engineer',
    difficulty: 'easy',
    idealAnswer: 'Supervised learning uses labeled training data (e.g., classifying emails as spam). Unsupervised learning works with unlabeled data to find hidden structures or clusters (e.g., customer segmentation). Reinforcement learning trains agents to make sequential decisions by rewarding good actions and penalizing bad ones (e.g., training a self-driving car or game-playing bot).',
    keywords: ['supervised', 'unsupervised', 'reinforcement', 'labeled', 'unlabeled', 'clusters', 'agent', 'reward']
  },
  {
    id: 'q13',
    text: 'What is overfitting in machine learning models? How do you diagnose it and what are some common techniques to prevent it?',
    type: 'technical',
    jobRole: 'AI/ML Engineer',
    difficulty: 'medium',
    idealAnswer: 'Overfitting occurs when a model learns noise in the training data rather than the underlying patterns, leading to high training accuracy but poor test accuracy. I diagnose it by tracking training vs validation loss. To prevent it, I use techniques like cross-validation, regularization (L1/L2), dropout in neural networks, simplifying the model architecture, or adding more training data.',
    keywords: ['overfitting', 'validation', 'loss', 'noise', 'regularization', 'dropout', 'cross-validation', 'L1', 'L2']
  },
  {
    id: 'q14',
    text: 'Describe how the "Self-Attention" mechanism works in Transformer models and why it is superior to RNNs/LSTMs for NLP tasks.',
    type: 'technical',
    jobRole: 'AI/ML Engineer',
    difficulty: 'hard',
    idealAnswer: 'Self-attention allows the model to associate each word in an input sequence with every other word, assigning attention weights representing their relative importance. It is superior to RNNs/LSTMs because it processes all tokens in parallel, enabling much faster training, and avoids the vanishing gradient problem, allowing the capture of long-range dependencies across the text.',
    keywords: ['attention', 'self-attention', 'Transformer', 'RNNs', 'LSTMs', 'parallel', 'long-range', 'dependencies']
  },
  {
    id: 'q15',
    text: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
    type: 'aptitude',
    jobRole: 'AI/ML Engineer',
    difficulty: 'easy',
    idealAnswer: 'It would take 5 minutes. If 5 machines make 5 widgets in 5 minutes, it means each machine takes exactly 5 minutes to make 1 widget. Therefore, 100 machines operating in parallel will make 100 widgets in that same 5-minute interval.',
    keywords: ['5 minutes', 'parallel', 'machine', 'widget', '5']
  }
];
