import { supabase, TestType, ScoreRecord, LeaderboardRecord } from './supabase';
import { generateFingerprint, generateAnonymousId } from './fingerprint';

// 表名常量
const SCORES = 'scores';

/**
 * 提交测试分数
 * @param testType 测试类型
 * @param result 测试结果
 * @param metadata 额外的元数据
 */
export async function submitScore(
  testType: TestType,
  result: number,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const fingerprint = await generateFingerprint();
    const anonymousId = generateAnonymousId();
    
    // 检查10分钟内是否已提交过分数
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: recentScores } = await supabase
      .from('scores')
      .select('id')
      .eq('fingerprint', fingerprint)
      .eq('test_type', testType)
      .gte('created_at', tenMinutesAgo)
      .limit(1);
    
    if (recentScores && recentScores.length > 0) {
      throw new Error('请等待10分钟后再次提交分数');
    }
    
    // 提交新分数
    const { error } = await supabase
      .from('scores')
      .insert({
        test_type: testType,
        result,
        fingerprint,
        anonymous_id: anonymousId,
        metadata,
      });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('提交分数失败:', error);
    throw error;
  }
}

/**
 * 获取排行榜数据
 */
export const getLeaderboard = async (
  testType: TestType,
  limit: number = 10
): Promise<LeaderboardRecord[]> => {
  const { data, error } = await supabase
    .from(SCORES)
    .select('*')
    .eq('test_type', testType)
    .order('result', { ascending: testType === TestType.REACTION })
    .limit(limit);

  if (error) {
    console.error('获取排行榜失败:', error);
    throw new Error('获取排行榜失败');
  }

  // 转换为LeaderboardRecord格式并添加排名
  const leaderboardData: LeaderboardRecord[] = (data || []).map((record, index) => ({
    id: record.id,
    test_type: record.test_type,
    result: record.result,
    anonymous_id: record.anonymous_id,
    created_at: new Date(record.created_at).getTime(),
    rank: index + 1,
    metadata: record.metadata,
  }));

  return leaderboardData;
};

/**
 * 获取用户在特定测试中的最佳成绩
 * @param testType 测试类型
 * @param fingerprint 用户指纹
 */
export async function getUserBestScore(
  testType: TestType,
  fingerprint: string
): Promise<ScoreRecord | null> {
  try {
    const isAscending = testType === TestType.REACTION;
    
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('test_type', testType)
      .eq('fingerprint', fingerprint)
      .order('result', { ascending: isAscending })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('获取用户最佳成绩失败:', error);
    return null;
  }
}

/**
 * 获取用户在排行榜中的排名
 * @param testType 测试类型
 * @param result 用户成绩
 */
export async function getUserRank(
  testType: TestType,
  result: number
): Promise<number> {
  try {
    const isAscending = testType === TestType.REACTION;
    const operator = isAscending ? 'lt' : 'gt';
    
    const { count, error } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('test_type', testType)
      [operator]('result', result);
    
    if (error) {
      throw error;
    }
    
    return (count || 0) + 1;
  } catch (error) {
    console.error('获取用户排名失败:', error);
    return 0;
  }
}

/**
 * 获取测试统计信息
 * @param testType 测试类型
 */
export async function getTestStats(testType: TestType): Promise<{
  totalPlayers: number;
  averageScore: number;
  bestScore: number;
}> {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('result')
      .eq('test_type', testType);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return {
        totalPlayers: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }
    
    const results = data.map(item => item.result);
    const totalPlayers = results.length;
    const averageScore = results.reduce((sum, score) => sum + score, 0) / totalPlayers;
    
    const isAscending = testType === TestType.REACTION;
    const bestScore = isAscending 
      ? Math.min(...results)
      : Math.max(...results);
    
    return {
      totalPlayers,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
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