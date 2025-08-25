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