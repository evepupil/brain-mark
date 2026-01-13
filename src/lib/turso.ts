import { createClient, Client } from '@libsql/client';

// =============================================
// Turso 数据库客户端配置
// 使用 libSQL 协议连接到 Turso 云数据库
// =============================================

/**
 * 创建 Turso 数据库客户端实例
 * 仅在服务端使用，客户端通过 API Routes 访问
 */
const createTursoClient = (): Client => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // 开发环境检查配置
  if (!url) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置');
  }

  return createClient({
    url,
    authToken,
  });
};

// 导出数据库客户端单例（仅服务端使用）
export const db = createTursoClient();

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

/**
 * 生成 UUID
 * 用于生成数据库记录的唯一ID
 */
export function generateUUID(): string {
  // 使用 crypto API 生成 UUID (Node.js 环境)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: 手动生成 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 安全解析 JSON 字符串
 * @param jsonString JSON 字符串或 null
 * @returns 解析后的对象或 undefined
 */
export function parseMetadata(jsonString: string | null): Record<string, unknown> | undefined {
  if (!jsonString) return undefined;
  try {
    return JSON.parse(jsonString);
  } catch {
    return undefined;
  }
}
