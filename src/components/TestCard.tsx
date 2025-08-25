import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TestType } from '../lib/supabase';
import { cn, getBestScore } from '../lib/utils';

interface TestCardProps {
  testType: TestType;
  icon: string;
  gradient: string;
}

/**
 * 测试项目卡片组件
 * 显示测试项目的基本信息、开始按钮和最佳成绩
 */
export default function TestCard({ testType, icon, gradient }: TestCardProps) {
  const { t } = useTranslation('common');
  const [bestScore, setBestScore] = useState<number | null>(null);

  /**
   * 加载最佳成绩
   */
  useEffect(() => {
    const bestScoreRecord = getBestScore(testType);
    setBestScore(bestScoreRecord ? bestScoreRecord.score : null);
  }, [testType]);

  /**
   * 格式化最佳成绩显示
   */
  const formatBestScore = (score: number, type: TestType): string => {
    switch (type) {
      case TestType.REACTION:
        return `${score}ms`;
      case TestType.TYPING:
        return `${score} WPM`;
      case TestType.MEMORY:
        return `${score}位数字`;
      case TestType.VISUAL:
      case TestType.SEQUENCE:
        return `等级 ${score}`;
      default:
        return `${score}`;
    }
  };

  return (
    <Link href={`/test/${testType}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* 渐变头部 */}
        <div className={cn('h-32 bg-gradient-to-br', gradient, 'flex items-center justify-center relative')}>
          <span className="text-4xl">{icon}</span>
          
          {/* 最佳成绩显示 */}
          {bestScore !== null && (
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <div className="text-white text-xs font-medium">
                最佳: {formatBestScore(bestScore, testType)}
              </div>
            </div>
          )}
        </div>

        {/* 卡片内容 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t(`tests.${testType}.name`)}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {t(`tests.${testType}.description`)}
          </p>
          
          {/* 开始按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {t('start')}
          </motion.button>
        </div>

        {/* 底部装饰 */}
        <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      </motion.div>
    </Link>
  );
}