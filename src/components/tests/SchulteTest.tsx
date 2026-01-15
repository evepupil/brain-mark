import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/types';
import { saveBestScore } from '../../lib/utils';
import ResultEvaluation from '../ResultEvaluation';

type GameState = 'start' | 'playing' | 'result';
type GridSize = 3 | 4 | 5;

/**
 * 舒尔特方格测试组件
 * 测试用户的注意力和视觉搜索能力
 * 用户需要按顺序点击数字1到n*n
 */
export default function SchulteTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [gridSize, setGridSize] = useState<GridSize>(5); // 默认5x5
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [clickedNumbers, setClickedNumbers] = useState<Set<number>>(new Set());
  const [wrongClick, setWrongClick] = useState<number | null>(null);

  /**
   * 生成随机排列的数字网格
   */
  const generateGrid = useCallback((size: GridSize) => {
    const totalNumbers = size * size;
    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

    // Fisher-Yates 洗牌算法
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers;
  }, []);

  /**
   * 开始测试
   */
  const startTest = useCallback(() => {
    const grid = generateGrid(gridSize);
    setGridNumbers(grid);
    setCurrentTarget(1);
    setClickedNumbers(new Set());
    setWrongClick(null);
    setStartTime(Date.now());
    setGameState('playing');
    setSubmissionError(null);
    setSubmissionSuccess(false);
  }, [gridSize, generateGrid]);

  /**
   * 处理格子点击
   */
  const handleCellClick = useCallback((number: number) => {
    if (number === currentTarget) {
      // 正确点击
      const newClickedNumbers = new Set(clickedNumbers);
      newClickedNumbers.add(number);
      setClickedNumbers(newClickedNumbers);
      setWrongClick(null);

      const totalNumbers = gridSize * gridSize;
      if (number === totalNumbers) {
        // 完成测试
        const endTime = Date.now();
        const timeTaken = Math.round((endTime - startTime) / 10) / 100; // 保留2位小数（秒）
        setCompletionTime(timeTaken);
        setGameState('result');

        // 保存最佳成绩（时间越短越好，以毫秒为单位上传）
        const timeInMs = Math.round(timeTaken * 1000);
        if (timeInMs > 0) {
          const isNewBest = saveBestScore('schulte', timeInMs);
          if (isNewBest) {
            console.log('新的最佳舒尔特方格记录:', timeTaken + 's');
          }
        }

        // 自动上传分数
        if (timeInMs > 0) {
          setIsSubmitting(true);
          setSubmissionError(null);
          setSubmissionSuccess(false);

          submitScore(TestType.SCHULTE, timeInMs, {
            timestamp: Date.now(),
            gridSize: gridSize,
            completionTime: timeTaken,
          })
            .then(() => {
              setSubmissionSuccess(true);
            })
            .catch((error: any) => {
              console.error('自动提交分数失败:', error);
              setSubmissionError(error.message || '分数上传失败');
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        }
      } else {
        setCurrentTarget(number + 1);
      }
    } else {
      // 错误点击，显示红色闪烁效果
      setWrongClick(number);
      setTimeout(() => setWrongClick(null), 300);
    }
  }, [currentTarget, clickedNumbers, gridSize, startTime]);

  /**
   * 重新开始测试
   */
  const resetTest = useCallback(() => {
    setGameState('start');
    setCompletionTime(0);
    setSubmissionError(null);
    setSubmissionSuccess(false);
  }, []);

  /**
   * 获取单元格样式
   */
  const getCellClassName = (number: number) => {
    const baseClass = "flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg cursor-pointer transition-all duration-200";

    if (clickedNumbers.has(number)) {
      return `${baseClass} bg-green-100 text-green-400 cursor-not-allowed opacity-50`;
    }

    if (wrongClick === number) {
      return `${baseClass} bg-red-500 text-white animate-pulse`;
    }

    if (number === currentTarget) {
      return `${baseClass} bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-400 shadow-lg`;
    }

    return `${baseClass} bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg`;
  };

  /**
   * 获取评价信息
   */
  const getEvaluation = () => {
    const time = completionTime;
    const size = gridSize;

    // 根据网格大小和完成时间给出评价
    if (size === 3) {
      if (time < 5) return '🚀 闪电般的速度！';
      if (time < 8) return '⚡ 非常快！';
      if (time < 12) return '👍 不错！';
      if (time < 18) return '😊 还可以';
      return '🐢 多加练习！';
    } else if (size === 4) {
      if (time < 15) return '🚀 惊人的速度！';
      if (time < 22) return '⚡ 很快！';
      if (time < 30) return '👍 不错！';
      if (time < 40) return '😊 还可以';
      return '🐢 继续加油！';
    } else { // 5x5
      if (time < 25) return '🚀 超级快！';
      if (time < 35) return '⚡ 很快！';
      if (time < 45) return '👍 不错！';
      if (time < 60) return '😊 还可以';
      return '🐢 需要练习！';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            舒尔特方格测试
          </h1>
          <p className="text-gray-600">
            按顺序点击数字，测试你的注意力和视觉搜索能力
          </p>
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-6">
                  按照从1到{gridSize * gridSize}的顺序依次点击方格中的数字
                </p>

                {/* 难度选择 */}
                <div className="mb-8">
                  <p className="text-gray-700 font-medium mb-4">选择难度:</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setGridSize(3)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        gridSize === 3
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      简单 (3×3)
                    </button>
                    <button
                      onClick={() => setGridSize(4)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        gridSize === 4
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      中等 (4×4)
                    </button>
                    <button
                      onClick={() => setGridSize(5)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        gridSize === 5
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      困难 (5×5)
                    </button>
                  </div>
                </div>

                <button
                  onClick={startTest}
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 进度显示 */}
                <div className="text-center mb-6">
                  <p className="text-lg text-gray-700">
                    寻找数字: <span className="text-3xl font-bold text-purple-600">{currentTarget}</span>
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    进度: {currentTarget - 1} / {gridSize * gridSize}
                  </div>
                </div>

                {/* 方格网格 */}
                <div
                  className="grid gap-2 md:gap-3 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    maxWidth: gridSize === 3 ? '300px' : gridSize === 4 ? '400px' : '500px',
                  }}
                >
                  {gridNumbers.map((number, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={getCellClassName(number)}
                      onClick={() => handleCellClick(number)}
                      style={{
                        aspectRatio: '1',
                      }}
                    >
                      {number}
                    </motion.div>
                  ))}
                </div>

                {/* 放弃按钮 */}
                <div className="text-center mt-6">
                  <button
                    onClick={resetTest}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    放弃测试
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  测试完成！
                </h2>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">完成时间</p>
                  <p className="text-5xl font-bold text-purple-600 mb-2">
                    {completionTime}s
                  </p>
                  <p className="text-xl text-gray-700">
                    {getEvaluation()}
                  </p>
                </div>

                {/* 评价组件 */}
                <div className="mb-6">
                  <ResultEvaluation
                    testType="schulte"
                    score={Math.round(completionTime * 1000)}
                  />
                </div>

                {/* 自动上传状态提示 */}
                <div className="mb-6">
                  {isSubmitting && (
                    <div className="flex items-center justify-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      正在自动上传分数...
                    </div>
                  )}
                  {submissionSuccess && (
                    <div className="flex items-center justify-center text-green-600">
                      <span className="mr-2">✅</span>
                      分数已成功上传到排行榜！
                    </div>
                  )}
                  {submissionError && (
                    <div className="flex items-center justify-center text-red-600">
                      <span className="mr-2">❌</span>
                      {submissionError}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={resetTest}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    再试一次
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard?test=schulte')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
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
