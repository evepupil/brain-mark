import { createClient, Client } from '@libsql/client';

// =============================================
// Turso 数据库客户端配置
// 仅在服务端（API Routes）中使用
// =============================================

// 重新导出类型定义，方便 API Routes 导入
export { TestType, TABLES, type ScoreRecord, type LeaderboardRecord } from './types';

let dbInstance: Client | null = null;

/**
 * 获取 Turso 数据库客户端实例（懒加载）
 * 仅在服务端调用时才创建连接
 */
export function getDb(): Client {
  if (dbInstance) {
    return dbInstance;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置');
  }

  dbInstance = createClient({
    url,
    authToken,
  });

  return dbInstance;
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
