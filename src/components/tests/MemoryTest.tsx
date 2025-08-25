import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/supabase';
import { delay, randomInt } from '../../lib/utils';
import { ResultEvaluationCompact } from '../ResultEvaluation';

type GameState = 'start' | 'showing' | 'input' | 'result' | 'failed';

/**
 * 数字记忆测试组件
 * 测试用户能记住多少位数字
 */
export default function MemoryTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(3); // 从3位数字开始
  const [targetNumber, setTargetNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showTime, setShowTime] = useState(1000); // 显示时间（毫秒）
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxLevel, setMaxLevel] = useState(0);

  /**
   * 生成随机数字
   */
  const generateNumber = useCallback((digits: number) => {
    let number = '';
    for (let i = 0; i < digits; i++) {
      // 第一位不能是0
      const digit = i === 0 ? randomInt(1, 9) : randomInt(0, 9);
      number += digit.toString();
    }
    return number;
  }, []);

  /**
   * 开始新一轮测试
   */
  const startRound = useCallback(async () => {
    const number = generateNumber(currentLevel);
    setTargetNumber(number);
    setUserInput('');
    setGameState('showing');
    
    // 显示数字一段时间后隐藏
    await delay(showTime);
    setGameState('input');
  }, [currentLevel, generateNumber, showTime]);

  /**
   * 处理用户输入
   */
  const handleInputChange = useCallback((value: string) => {
    // 只允许数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    setUserInput(numericValue);
  }, []);

  /**
   * 提交答案
   */
  const submitAnswer = useCallback(() => {
    if (userInput === targetNumber) {
      // 答对了，进入下一关
      setMaxLevel(Math.max(maxLevel, currentLevel));
      setCurrentLevel(prev => prev + 1);
      // 增加显示时间（每关增加200ms）
      setShowTime(prev => prev + 200);
      setGameState('result');
    } else {
      // 答错了，游戏结束
      setGameState('failed');
    }
  }, [userInput, targetNumber, currentLevel, maxLevel]);

  /**
   * 继续下一关
   */
  const continueGame = useCallback(() => {
    startRound();
  }, [startRound]);

  /**
   * 重新开始游戏
   */
  const restartGame = useCallback(() => {
    setCurrentLevel(3);
    setShowTime(1000);
    setMaxLevel(0);
    setGameState('start');
  }, []);

  /**
   * 提交最终分数
   */
  const handleSubmitScore = useCallback(async () => {
    if (maxLevel === 0) return;
    
    setIsSubmitting(true);
    try {
      await submitScore(TestType.MEMORY, maxLevel, {
        timestamp: Date.now(),
        finalLevel: currentLevel - 1,
      });
      router.push('/leaderboard?test=memory');
    } catch (error) {
      console.error('提交分数失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [maxLevel, currentLevel, router]);

  /**
   * 处理键盘事件
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'input' && e.key === 'Enter') {
        submitAnswer();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameState, submitAnswer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 标题和等级显示 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            数字记忆测试
          </h1>
          <p className="text-gray-600 mb-4">
            当前等级: {currentLevel} 位数字
          </p>
          {maxLevel > 0 && (
            <p className="text-blue-600 font-medium">
              最高等级: {maxLevel} 位数字
            </p>
          )}
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🧠</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-8">
                  记住显示的数字序列，然后输入它们
                </p>
                <button
                  onClick={startRound}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {gameState === 'showing' && (
              <motion.div
                key="showing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <p className="text-gray-600 mb-4">记住这个数字:</p>
                <div className="text-4xl md:text-6xl font-mono font-bold text-blue-600 mb-4 tracking-wider">
                  {targetNumber}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: showTime / 1000, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            )}

            {gameState === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center w-full"
              >
                <p className="text-gray-600 mb-6">输入你记住的数字:</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="text-3xl md:text-4xl font-mono text-center border-2 border-gray-300 rounded-lg p-4 mb-6 w-full max-w-md mx-auto focus:border-blue-500 focus:outline-none"
                  placeholder="输入数字..."
                  autoFocus
                />
                <div className="space-y-4">
                  <button
                    onClick={submitAnswer}
                    disabled={userInput.length !== currentLevel}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提交答案
                  </button>
                  <p className="text-sm text-gray-500">
                    按 Enter 键提交
                  </p>
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  答对了！
                </h2>
                <p className="text-gray-600 mb-6">
                  准备挑战 {currentLevel} 位数字
                </p>
                <button
                  onClick={continueGame}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  继续挑战
                </button>
              </motion.div>
            )}

            {gameState === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center w-full"
              >
                <div className="text-6xl mb-6">😔</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  游戏结束
                </h2>
                <p className="text-gray-600 mb-2">
                  正确答案: <span className="font-mono font-bold">{targetNumber}</span>
                </p>
                <p className="text-gray-600 mb-6">
                  你的答案: <span className="font-mono font-bold">{userInput}</span>
                </p>
                <p className="text-lg font-medium text-blue-600 mb-6">
                  最终成绩: {maxLevel} 位数字
                </p>
                
                {/* 评价组件 */}
                <div className="mb-8">
                  <ResultEvaluationCompact 
                    testType="memory" 
                    score={maxLevel}
                  />
                </div>
                
                <div className="space-x-4">
                  <button
                    onClick={restartGame}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || maxLevel === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? '提交中...' : '查看排名'}
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