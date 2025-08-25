import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 创建Supabase客户端实例
 * 用于与Supabase数据库进行交互
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表名常量
export const TABLES = {
  SCORES: 'scores',
  TEST_TYPES: 'test_types',
} as const;

// 测试类型枚举
export enum TestType {
  REACTION = 'reaction',
  MEMORY = 'memory',
  VISUAL = 'visual',
  TYPING = 'typing',
  SEQUENCE = 'sequence',
}

// 分数记录接口
export interface ScoreRecord {
  id?: string;
  test_type: TestType;
  result: number;
  fingerprint: string;
  anonymous_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at?: string;
}

// 排行榜记录接口
export interface LeaderboardRecord {
  id: string;
  test_type: TestType;
  result: number;
  anonymous_id: string;
  created_at: number;
  rank: number;
  metadata?: {
    timestamp?: number;
    accuracy?: number;
    [key: string]: any;
  };
}