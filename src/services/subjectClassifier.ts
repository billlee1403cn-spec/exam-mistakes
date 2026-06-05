export type Subject = 'politics' | 'math' | 'english' | 'specialty'

interface ClassificationResult {
  subject: Subject
  confidence: number
  scores: Record<Subject, number>
}

const MATH_KEYWORDS = [
  '极限', '导数', '积分', '微分', '矩阵', '向量', '概率', '统计',
  '方程', '函数', '数列', '不等式', '几何', '定理', '证明',
  '求解', '线性', '代数', '几何', '三角', '恒等', '变换',
  '坐标', '抛物线', '椭圆', '双曲线', '正弦', '余弦', '正切',
  'sin', 'cos', 'tan', 'log', 'ln', '∑', '∫', 'π',
  'f(x)', 'x+y', 'y=', 'x=', 'dx', 'dy',
]

const POLITICS_KEYWORDS = [
  '马克思', '唯物', '辩证', '认识论', '毛中特', '毛泽东', '中国特色',
  '社会主义', '资本主义', '改革', '开放', '本质', '规律', '实践',
  '真理', '矛盾', '历史', '阶级', '革命', '生产力', '生产关系',
  '经济基础', '上层建筑', '意识形态', '党的', '习近平', '新时代',
  '中国梦', '现代化', '法治', '民主', '专政', '马克思主义',
  '实事求是', '群众路线', '独立自主', '核心价值观',
]

const ENGLISH_KEYWORDS = [
  'vocabulary', 'grammar', 'reading', 'comprehension', 'translate',
  'passage', 'essay', 'composition', 'sentence', 'paragraph',
  'pronunciation', 'spelling', 'vocab', 'phrase', 'clause',
  'tense', 'preposition', 'conjunction', 'article', 'adverb',
  'adjective', 'noun', 'verb', 'pronoun', 'plural', 'singular',
  'fill in the blank', 'multiple choice', 'cloze', 'error correction',
  'writing', 'listening', 'speaking', 'translation',
]

const MATH_WEAK = ['计算', '求值', '化简', '解', '公式', '证明题', '应用题', '最大值', '最小值', '取值范围', '单调', '奇偶', '周期']
const POLITICS_WEAK = ['简答', '论述', '分析', '结合', '材料', '意义', '作用', '为什么', '如何理解', '怎样', '关系', '区别', '联系']

export function classifySubject(text: string): ClassificationResult {
  const lower = text.toLowerCase()
  const scores: Record<Subject, number> = { math: 0, politics: 0, english: 0, specialty: 0 }

  for (const kw of MATH_KEYWORDS) { if (lower.includes(kw.toLowerCase())) scores.math += 3 }
  for (const kw of POLITICS_KEYWORDS) { if (lower.includes(kw.toLowerCase())) scores.politics += 3 }
  for (const kw of ENGLISH_KEYWORDS) { if (lower.includes(kw.toLowerCase())) scores.english += 3 }
  for (const kw of MATH_WEAK) { if (lower.includes(kw)) scores.math += 1 }
  for (const kw of POLITICS_WEAK) { if (lower.includes(kw)) scores.politics += 1 }

  const digitCount = (text.match(/\d/g) || []).length
  const mathSymbols = (text.match(/[=+\-*/^(){}[\]<>√∫∑π∞]/g) || []).length
  if (digitCount > 5) scores.math += 1
  if (mathSymbols > 3) scores.math += 2
  if (digitCount > 15) scores.math += 1

  const totalChars = text.length
  const asciiChars = (text.match(/[a-zA-Z\s.,;:'"?!@#$%^&*()\-=/\\[\]{}<>~`]/g) || []).length
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  if (totalChars > 0) {
    const asciiRatio = asciiChars / totalChars
    if (asciiRatio > 0.6) scores.english += 2
    if (asciiRatio > 0.8) scores.english += 1
    if (chineseChars > 50 && scores.politics > 0) scores.politics += 1
  }

  let maxSubject: Subject = 'specialty'
  let maxScore = 0
  for (const [subj, score] of Object.entries(scores)) {
    if (score > maxScore) { maxScore = score; maxSubject = subj as Subject }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  return { subject: maxSubject, confidence: totalScore > 0 ? maxScore / totalScore : 0, scores }
}

export function getSubjectLabelCN(s: Subject): string {
  return { politics: '政治', math: '数学', english: '英语', specialty: '专业课' }[s]
}
