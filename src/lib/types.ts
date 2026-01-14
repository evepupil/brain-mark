// =============================================
// 类型定义文件
// 可以在客户端和服务端安全导入
// =============================================

// =============================================
// 数据库表名常量
// =============================================
export const TABLES = {
  SCORES: 'scores',
  TEST_TYPES: 'test_types',
} as const;

// =============================================
// 测试类型枚举
// 定义所有支持的认知测试类型
// =============================================
export enum TestType {
  REACTION = 'reaction',   // 反应速度测试
  MEMORY = 'memory',       // 数字记忆测试
  VISUAL = 'visual',       // 视觉记忆测试
  TYPING = 'typing',       // 打字速度测试
  SEQUENCE = 'sequence',   // 序列记忆测试
  CHIMP = 'chimp',         // 黑猩猩测试
}

// =============================================
// 类型定义接口
// =============================================

/**
 * 分数记录接口
 * 定义存储在数据库中的分数记录结构
 */
export interface ScoreRecord {
  id?: string;
  test_type: TestType;
  result: number;
  fingerprint: string;
  anonymous_id: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

/**
 * 排行榜记录接口
 * 定义排行榜展示所需的数据结构
 */
export interface LeaderboardRecord {
  id: string;
  test_type: TestType;
  result: number;
  anonymous_id: string;
  created_at: number;      // 转换为时间戳
  rank: number;            // 排名
  metadata?: {
    timestamp?: number;
    accuracy?: number;
    [key: string]: unknown;
  };
}
