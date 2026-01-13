import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import { getLeaderboard, getTestStats } from '../lib/api';
import { TestType, LeaderboardRecord } from '../lib/turso';
import { formatTestResult } from '../lib/utils';
import SEOHead, { pageSEOConfig } from '../components/SEOHead';

interface TestStats {
  totalPlayers: number;
  averageScore: number;
  bestScore: number;
}

/**
 * 排行榜页面组件
 * 显示各项测试的排行榜和统计信息
 */
export default function Leaderboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<TestType>(TestType.REACTION);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 测试类型配置
  const testTypes = [
    {
      type: TestType.REACTION,
      name: '反应速度',
      icon: '⚡',
      color: 'bg-yellow-500',
      unit: 'ms',
    },
    {
      type: TestType.MEMORY,
      name: '数字记忆',
      icon: '🧠',
      color: 'bg-blue-500',
      unit: '位数字',
    },
    {
      type: TestType.VISUAL,
      name: '视觉记忆',
      icon: '👁️',
      color: 'bg-purple-500',
      unit: '等级',
    },
    {
      type: TestType.TYPING,
      name: '打字速度',
      icon: '⌨️',
      color: 'bg-green-500',
      unit: 'WPM',
    },
    {
      type: TestType.SEQUENCE,
      name: '序列记忆',
      icon: '🔢',
      color: 'bg-indigo-500',
      unit: '等级',
    },
  ];

  /**
   * 加载排行榜数据
   */
  const loadLeaderboard = async (testType: TestType) => {
    try {
      setLoading(true);
      setError(null);
      
      const [leaderboardData, statsData] = await Promise.all([
        getLeaderboard(testType, 50), // 获取前50名
        getTestStats(testType),
      ]);
      
      setLeaderboard(leaderboardData);
      setStats(statsData);
    } catch (err) {
      console.error('加载排行榜失败:', err);
      setError('加载排行榜失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理测试类型切换
   */
  const handleTestChange = (testType: TestType) => {
    setSelectedTest(testType);
    router.push(`/leaderboard?test=${testType}`, undefined, { shallow: true });
  };

  /**
   * 获取排名颜色
   */
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-700 bg-gray-50';
  };

  /**
   * 获取排名图标
   */
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  /**
   * 格式化时间戳
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * 初始化页面
   */
  useEffect(() => {
    // 从URL参数获取测试类型
    const testParam = router.query.test as string;
    if (testParam && Object.values(TestType).includes(testParam as TestType)) {
      setSelectedTest(testParam as TestType);
    }
  }, [router.query.test]);

  /**
   * 加载数据
   */
  useEffect(() => {
    loadLeaderboard(selectedTest);
  }, [selectedTest]);

  const currentTestConfig = testTypes.find(t => t.type === selectedTest);

  return (
    <>
      <SEOHead
        title={pageSEOConfig.leaderboard.title}
        description={pageSEOConfig.leaderboard.description}
        keywords={pageSEOConfig.leaderboard.keywords}
      />
      <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 排行榜
            </h1>
            <p className="text-gray-600">
              查看各项测试的最佳成绩
            </p>
          </div>

          {/* 测试类型选择 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {testTypes.map((test) => (
              <button
                key={test.type}
                onClick={() => handleTestChange(test.type)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTest === test.type
                    ? `${test.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                <span className="text-lg">{test.icon}</span>
                <span>{test.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 统计信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">{currentTestConfig?.icon}</span>
                  {currentTestConfig?.name} 统计
                </h2>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">总参与人数</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalPlayers.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">平均成绩</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatTestResult(selectedTest, stats.averageScore)}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">最佳成绩</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatTestResult(selectedTest, stats.bestScore)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    暂无统计数据
                  </div>
                )}
              </div>
            </div>

            {/* 排行榜 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  排行榜 - {currentTestConfig?.name}
                </h2>
                
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    {error}
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((record, index) => {
                      const rank = index + 1;
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                            rank <= 3 ? getRankColor(rank) : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-lg font-bold min-w-[3rem] text-center">
                              {getRankIcon(rank)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                匿名用户 #{record.anonymous_id.slice(-6)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(record.metadata?.timestamp || record.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatTestResult(selectedTest, record.result)}
                            </div>
                            {record.metadata?.accuracy && (
                              <div className="text-sm text-gray-500">
                                准确率: {record.metadata.accuracy}%
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">🎯</div>
                    <p>还没有人参与这项测试</p>
                    <p className="text-sm mt-2">成为第一个挑战者吧！</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 返回按钮 */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};