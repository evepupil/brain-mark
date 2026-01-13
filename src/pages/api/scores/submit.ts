import type { NextApiRequest, NextApiResponse } from 'next';
import { db, TestType, generateUUID } from '@/lib/turso';

// =============================================
// 分数提交 API
// POST /api/scores/submit
// =============================================

/**
 * 响应数据类型
 */
interface SubmitResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 请求体数据类型
 */
interface SubmitRequest {
  testType: TestType;
  result: number;
  fingerprint: string;
  anonymousId: string;
  metadata?: Record<string, unknown>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '请求方法不允许',
    });
  }

  try {
    const { testType, result, fingerprint, anonymousId, metadata = {} } = req.body as SubmitRequest;

    // 参数验证
    if (!testType || result === undefined || !fingerprint || !anonymousId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
      });
    }

    // 验证测试类型是否有效
    if (!Object.values(TestType).includes(testType)) {
      return res.status(400).json({
        success: false,
        error: '无效的测试类型',
      });
    }

    // 计算10分钟前的时间 (ISO8601格式)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // 检查10分钟内是否已提交过分数（防刷机制）
    const recentResult = await db.execute({
      sql: `SELECT id FROM scores
            WHERE fingerprint = ?
            AND test_type = ?
            AND created_at >= ?
            LIMIT 1`,
      args: [fingerprint, testType, tenMinutesAgo],
    });

    if (recentResult.rows.length > 0) {
      return res.status(429).json({
        success: false,
        error: '请等待10分钟后再次提交分数',
      });
    }

    // 生成新记录的 UUID
    const id = generateUUID();

    // 提交新分数到数据库
    await db.execute({
      sql: `INSERT INTO scores (id, test_type, result, fingerprint, anonymous_id, metadata)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        testType,
        result,
        fingerprint,
        anonymousId,
        JSON.stringify(metadata),
      ],
    });

    return res.status(200).json({
      success: true,
      message: '分数提交成功',
    });
  } catch (error) {
    console.error('提交分数失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
}
