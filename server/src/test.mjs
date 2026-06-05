import { classifySubject } from './utils/subjectClassifier.js';

const tests = [
  '求函数f(x)=x^2+2x+1在区间[0,3]上的最大值和最小值',
  '简述马克思主义哲学中实践和认识的辩证关系',
  'Fill in the blanks with the correct form of the verbs',
  '这是一道专业课题目，关于计算机组成原理',
];

for (const text of tests) {
  console.log('Input:', text);
  console.log('Result:', JSON.stringify(classifySubject(text)));
  console.log('---');
}
