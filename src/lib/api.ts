import { TestType, LeaderboardRecord } from './turso';
import { generateFingerprint, generateAnonymousId } from './fingerprint';

// =============================================
// 客户端 API 调用函数
// 通过 API Routes 与服务端通信
// =============================================

/**
 * 提交测试分数
 * 通过 POST /api/scores/submit 调用服务端 API
 * @param testType 测试类型
 * @param result 测试结果
 * @param metadata 额外的元数据
 */
export async function submitScore(
  testType: TestType,
  result: number,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    // 生成用户指纹和匿名ID
    const fingerprint = await generateFingerprint();
    const anonymousId = generateAnonymousId();

    // 调用服务端 API 提交分数
    const response = await fetch('/api/scores/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testType,
        result,
        fingerprint,
        anonymousId,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '提交分数失败');
    }
  } catch (error) {
    console.error('提交分数失败:', error);
    throw error;
  }
}

/**
 * 获取排行榜数据
 * 通过 GET /api/leaderboard/[testType] 调用服务端 API
 * @param testType 测试类型
 * @param limit 返回记录数量限制
 */
export const getLeaderboard = async (
  testType: TestType,
  limit: number = 10
): Promise<LeaderboardRecord[]> => {
  try {
    const response = await fetch(`/api/leaderboard/${testType}?limit=${limit}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '获取排行榜失败');
    }

    return data.data?.rankings || [];
  } catch (error) {
    console.error('获取排行榜失败:', error);
    throw new Error('获取排行榜失败');
  }
};

/**
 * 获取测试统计信息
 * 通过 GET /api/leaderboard/[testType] 调用服务端 API
 * @param testType 测试类型
 */
export async function getTestStats(testType: TestType): Promise<{
  totalPlayers: number;
  averageScore: number;
  bestScore: number;
}> {
  try {
    const response = await fetch(`/api/leaderboard/${testType}?limit=1`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '获取统计失败');
    }

    return data.data?.stats || {
      totalPlayers: 0,
      averageScore: 0,
      bestScore: 0,
    };
  } catch (error) {
    console.error('获取测试统计失败:', error);
    return {
      totalPlayers: 0,
      averageScore: 0,
      bestScore: 0,
    };
  }
}
