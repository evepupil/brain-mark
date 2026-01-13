import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, TestType, LeaderboardRecord, parseMetadata } from '@/lib/turso';

// =============================================
// 排行榜查询 API
// GET /api/leaderboard/[testType]
// =============================================

/**
 * 响应数据类型
 */
interface LeaderboardResponse {
  success: boolean;
  data?: {
    rankings: LeaderboardRecord[];
    stats: {
      totalPlayers: number;
      averageScore: number;
      bestScore: number;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardResponse>
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '请求方法不允许',
    });
  }

  try {
    const { testType } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;

    // 参数验证
    if (!testType || typeof testType !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少测试类型参数',
      });
    }

    // 验证测试类型是否有效
    if (!Object.values(TestType).includes(testType as TestType)) {
      return res.status(400).json({
        success: false,
        error: '无效的测试类型',
      });
    }

    const validTestType = testType as TestType;

    // 根据测试类型决定排序方式
    // reaction 测试: 时间越短越好 (ASC)
    // 其他测试: 分数越高越好 (DESC)
    const orderDirection = validTestType === TestType.REACTION ? 'ASC' : 'DESC';

    // 获取数据库客户端
    const db = getDb();

    // 查询排行榜数据
    const rankingsResult = await db.execute({
      sql: `SELECT * FROM scores
            WHERE test_type = ?
            ORDER BY result ${orderDirection}
            LIMIT ?`,
      args: [validTestType, limit],
    });

    // 转换为 LeaderboardRecord 格式并添加排名
    const rankings: LeaderboardRecord[] = rankingsResult.rows.map((row, index) => ({
      id: row.id as string,
      test_type: row.test_type as TestType,
      result: row.result as number,
      anonymous_id: row.anonymous_id as string,
      created_at: new Date(row.created_at as string).getTime(),
      rank: index + 1,
      metadata: parseMetadata(row.metadata as string | null),
    }));

    // 查询统计数据
    const statsResult = await db.execute({
      sql: `SELECT
              COUNT(*) as total,
              AVG(result) as average,
              ${validTestType === TestType.REACTION ? 'MIN' : 'MAX'}(result) as best
            FROM scores
            WHERE test_type = ?`,
      args: [validTestType],
    });

    const statsRow = statsResult.rows[0];
    const stats = {
      totalPlayers: (statsRow?.total as number) || 0,
      averageScore: statsRow?.average ? Math.round((statsRow.average as number) * 100) / 100 : 0,
      bestScore: (statsRow?.best as number) || 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        rankings,
        stats,
      },
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
}
