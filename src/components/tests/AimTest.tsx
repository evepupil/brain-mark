import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/types';
import { saveBestScore } from '../../lib/utils';
import ResultEvaluation from '../ResultEvaluation';

type GameState = 'start' | 'playing' | 'result';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * 瞄准训练测试组件
 * 测试用户的鼠标精准度和反应速度
 */
export default function AimTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [target, setTarget] = useState<Target | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // 游戏配置
  const totalTargets = 30; // 总共30个目标
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetAppearTime = useRef<number>(0);
  const targetIdRef = useRef(0);

  /**
   * 生成随机目标位置
   */
  const generateTarget = useCallback(() => {
    if (!gameAreaRef.current) return;

    const area = gameAreaRef.current.getBoundingClientRect();
    const size = 60; // 目标大小
    const padding = 20;

    // 随机位置，确保目标在游戏区域内
    const x = Math.random() * (area.width - size - padding * 2) + padding;
    const y = Math.random() * (area.height - size - padding * 2) + padding;

    targetIdRef.current += 1;
    const newTarget: Target = {
      id: targetIdRef.current,
      x,
      y,
      size,
    };

    setTarget(newTarget);
    targetAppearTime.current = Date.now();
  }, []);

  /**
   * 开始游戏
   */
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setHits(0);
    setMisses(0);
    setTotalTime(0);
    setReactionTimes([]);
    setSubmissionError(null);
    setSubmissionSuccess(false);
    targetIdRef.current = 0;

    // 延迟生成第一个目标
    setTimeout(() => {
      generateTarget();
    }, 500);
  }, [generateTarget]);

  /**
   * 点击目标
   */
  const handleTargetClick = useCallback(() => {
    if (!target) return;

    const reactionTime = Date.now() - targetAppearTime.current;
    const newHits = hits + 1;

    setHits(newHits);
    setReactionTimes(prev => [...prev, reactionTime]);
    setTotalTime(prev => prev + reactionTime);
    setTarget(null);

    // 检查是否完成所有目标
    if (newHits >= totalTargets) {
      finishGame(newHits, misses, [...reactionTimes, reactionTime]);
    } else {
      // 生成下一个目标
      setTimeout(() => {
        generateTarget();
      }, 200);
    }
  }, [target, hits, misses, reactionTimes, generateTarget]);

  /**
   * 点击游戏区域（未命中）
   */
  const handleAreaClick = useCallback((e: React.MouseEvent) => {
    if (gameState !== 'playing' || !target) return;

    // 检查是否点击了目标
    const targetElement = document.getElementById(`target-${target.id}`);
    if (targetElement && targetElement.contains(e.target as Node)) {
      return; // 点击了目标，由 handleTargetClick 处理
    }

    // 未命中
    setMisses(prev => prev + 1);
  }, [gameState, target]);

  /**
   * 结束游戏并计算分数
   */
  const finishGame = useCallback(async (
    finalHits: number,
    finalMisses: number,
    times: number[]
  ) => {
    setGameState('result');

    // 计算平均反应时间
    const avgTime = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;

    // 计算准确率
    const accuracy = finalHits / (finalHits + finalMisses) * 100;

    // 综合分数：基于平均反应时间和准确率
    // 分数 = (1000 / 平均时间) * 准确率 * 10
    const finalScore = Math.round((1000 / avgTime) * (accuracy / 100) * 100);

    setScore(finalScore);

    // 保存最佳成绩
    if (finalScore > 0) {
      const isNewBest = saveBestScore('aim', finalScore);
      if (isNewBest) {
        console.log('新的最佳瞄准测试记录:', finalScore);
      }
    }

    // 自动上传分数
    if (finalScore > 0) {
      setIsSubmitting(true);
      try {
        await submitScore(TestType.AIM, finalScore, {
          timestamp: Date.now(),
          avgReactionTime: avgTime,
          accuracy: Math.round(accuracy),
          hits: finalHits,
          misses: finalMisses,
        });
        setSubmissionSuccess(true);
      } catch (error: any) {
        console.error('自动提交分数失败:', error);
        setSubmissionError(error.message || '分数上传失败');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, []);

  /**
   * 计算当前统计数据
   */
  const getStats = useCallback(() => {
    const avgTime = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;
    const accuracy = hits + misses > 0
      ? Math.round((hits / (hits + misses)) * 100)
      : 100;
    return { avgTime, accuracy };
  }, [reactionTimes, hits, misses]);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 标题和状态 */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('tests.aim.name')}
          </h1>
          {gameState === 'playing' && (
            <div className="flex justify-center items-center space-x-6 text-sm md:text-base">
              <p className="text-gray-600">
                目标: {hits}/{totalTargets}
              </p>
              <p className="text-green-600">
                命中: {hits}
              </p>
              <p className="text-red-600">
                未命中: {misses}
              </p>
              <p className="text-blue-600">
                平均: {stats.avgTime}ms
              </p>
            </div>
          )}
        </div>

        {/* 游戏区域 */}
        <div
          ref={gameAreaRef}
          onClick={handleAreaClick}
          className="bg-white rounded-2xl shadow-xl min-h-[500px] relative overflow-hidden cursor-crosshair"
        >
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
              >
                <div className="text-6xl mb-6">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-6 max-w-md text-center">
                  {t('tests.aim.instruction')}
                </p>
                <div className="bg-red-50 rounded-lg p-4 mb-6 text-left max-w-md">
                  <p className="text-sm text-red-800">
                    <strong>规则：</strong><br/>
                    1. 点击出现的红色目标<br/>
                    2. 尽可能快速且准确地点击<br/>
                    3. 共有 {totalTargets} 个目标<br/>
                    4. 分数基于速度和准确率计算
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && target && (
              <motion.div
                id={`target-${target.id}`}
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTargetClick();
                }}
                className="absolute cursor-pointer"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                <div className="w-full h-full rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 overflow-y-auto"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  测试完成
                </h2>
                <p className="text-4xl font-bold text-red-600 mb-4">
                  {score} 分
                </p>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-sm">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">平均反应</p>
                    <p className="text-xl font-bold text-green-600">
                      {stats.avgTime}ms
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">准确率</p>
                    <p className="text-xl font-bold text-blue-600">
                      {stats.accuracy}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">命中</p>
                    <p className="text-xl font-bold text-purple-600">{hits}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">未命中</p>
                    <p className="text-xl font-bold text-red-600">{misses}</p>
                  </div>
                </div>

                {/* 评价组件 */}
                <div className="mb-4 w-full max-w-md">
                  <ResultEvaluation testType="aim" score={score} />
                </div>

                {/* 上传状态 */}
                <div className="mb-4">
                  {isSubmitting && (
                    <div className="flex items-center justify-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      正在上传分数...
                    </div>
                  )}
                  {submissionSuccess && (
                    <div className="flex items-center justify-center text-green-600">
                      <span className="mr-2">✅</span>
                      分数已上传到排行榜！
                    </div>
                  )}
                  {submissionError && (
                    <div className="flex items-center justify-center text-red-600">
                      <span className="mr-2">❌</span>
                      {submissionError}
                    </div>
                  )}
                </div>

                <div className="space-x-4">
                  <button
                    onClick={startGame}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard?test=aim')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    查看排行榜
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
