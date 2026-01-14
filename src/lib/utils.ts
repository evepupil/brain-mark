import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并Tailwind CSS类名
 * 使用clsx和tailwind-merge来处理条件类名和冲突解决
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化数字显示
 * 添加千位分隔符
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * 格式化时间显示
 * 将毫秒转换为可读格式
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 格式化测试结果
 * 根据测试类型格式化显示结果
 */
export function formatTestResult(testType: string, result: number): string {
  switch (testType) {
    case 'reaction':
      return `${result}ms`;
    case 'memory':
    case 'visual':
    case 'sequence':
      return `${result}位`;
    case 'typing':
      return `${result} WPM`;
    case 'chimp':
      return `${result}个数字`;
    case 'aim':
    case 'stroop':
      return `${result}分`;
    default:
      return result.toString();
  }
}

/**
 * 获取测试结果的颜色等级
 * 根据结果好坏返回对应的颜色类名
 */
export function getResultColor(testType: string, result: number): string {
  // 这里可以根据实际的分数区间来定义颜色
  // 暂时使用简单的逻辑
  switch (testType) {
    case 'reaction':
      if (result < 200) return 'text-green-600';
      if (result < 300) return 'text-yellow-600';
      return 'text-red-600';
    case 'memory':
    case 'visual':
    case 'sequence':
      if (result >= 10) return 'text-green-600';
      if (result >= 5) return 'text-yellow-600';
      return 'text-red-600';
    case 'typing':
      if (result >= 60) return 'text-green-600';
      if (result >= 30) return 'text-yellow-600';
      return 'text-red-600';
    case 'chimp':
      if (result >= 10) return 'text-green-600';
      if (result >= 6) return 'text-yellow-600';
      return 'text-red-600';
    case 'aim':
      if (result >= 100) return 'text-green-600';
      if (result >= 60) return 'text-yellow-600';
      return 'text-red-600';
    case 'stroop':
      if (result >= 100) return 'text-green-600';
      if (result >= 60) return 'text-yellow-600';
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * 延迟函数
 * 返回一个Promise，在指定时间后resolve
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 随机数生成
 * 生成指定范围内的随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 打乱数组
 * 使用Fisher-Yates算法打乱数组
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 最佳成绩数据类型
 */
export interface BestScore {
  score: number;
  date: string;
  testType: string;
}

/**
 * 所有测试类型的最佳成绩记录
 */
export interface BestScores {
  reaction?: BestScore;
  memory?: BestScore;
  visual?: BestScore;
  sequence?: BestScore;
  typing?: BestScore;
  chimp?: BestScore;
  aim?: BestScore;
  stroop?: BestScore;
}

const BEST_SCORES_KEY = 'brain-mark-best-scores';

/**
 * 获取所有最佳成绩
 * 从localStorage中读取用户的最佳成绩记录
 */
export function getBestScores(): BestScores {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(BEST_SCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading best scores from localStorage:', error);
    return {};
  }
}

/**
 * 获取特定测试类型的最佳成绩
 * @param testType 测试类型
 * @returns 最佳成绩记录或null
 */
export function getBestScore(testType: string): BestScore | null {
  const bestScores = getBestScores();
  return bestScores[testType as keyof BestScores] || null;
}

/**
 * 保存最佳成绩
 * 如果新成绩更好，则更新localStorage中的记录
 * @param testType 测试类型
 * @param score 新成绩
 * @returns 是否创建了新的最佳成绩记录
 */
export function saveBestScore(testType: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const bestScores = getBestScores();
  const currentBest = bestScores[testType as keyof BestScores];
  
  // 判断是否是更好的成绩
  const isBetter = isScoreBetter(testType, score, currentBest?.score);
  
  if (isBetter) {
    const newBestScore: BestScore = {
      score,
      date: new Date().toISOString(),
      testType
    };
    
    const updatedScores = {
      ...bestScores,
      [testType]: newBestScore
    };
    
    try {
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(updatedScores));
      return true;
    } catch (error) {
      console.error('Error saving best score to localStorage:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * 判断新成绩是否比当前最佳成绩更好
 * @param testType 测试类型
 * @param newScore 新成绩
 * @param currentBest 当前最佳成绩
 * @returns 是否更好
 */
export function isScoreBetter(testType: string, newScore: number, currentBest?: number): boolean {
  if (currentBest === undefined) return true;

  switch (testType) {
    case 'reaction':
      // 反应时间：越小越好
      return newScore < currentBest;
    case 'memory':
    case 'visual':
    case 'sequence':
    case 'typing':
    case 'chimp':
    case 'aim':
    case 'stroop':
      // 其他测试：越大越好
      return newScore > currentBest;
    default:
      return newScore > currentBest;
  }
}

/**
 * 清除所有最佳成绩记录
 * 主要用于测试或重置功能
 */
export function clearBestScores(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(BEST_SCORES_KEY);
  } catch (error) {
    console.error('Error clearing best scores from localStorage:', error);
  }
}