import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/types';
import { shuffleArray, saveBestScore } from '../../lib/utils';
import ResultEvaluation from '../ResultEvaluation';

type GameState = 'start' | 'showing' | 'playing' | 'result' | 'failed';

interface GridCell {
  id: number;
  number: number | null;  // 显示的数字，null表示空格子
  isRevealed: boolean;    // 是否显示数字
  isClicked: boolean;     // 是否已被点击
  isWrong: boolean;       // 是否点击错误
}

/**
 * 黑猩猩测试组件
 * 基于著名的黑猩猩记忆研究，测试短期视觉记忆能力
 * 数字短暂显示后隐藏，用户需按顺序点击
 */
export default function ChimpTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(4); // 从4个数字开始
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [nextNumber, setNextNumber] = useState(1); // 下一个要点击的数字
  const [lives, setLives] = useState(3);
  const [maxLevel, setMaxLevel] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [strikes, setStrikes] = useState(0); // 当前关卡的错误次数

  // 使用 ref 追踪最新值
  const livesRef = useRef(lives);
  const maxLevelRef = useRef(maxLevel);

  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { maxLevelRef.current = maxLevel; }, [maxLevel]);

  const gridSize = 5; // 5x5 网格
  const totalCells = gridSize * gridSize;

  /**
   * 生成网格
   */
  const generateGrid = useCallback((numberCount: number) => {
    const cells: GridCell[] = [];

    // 创建空网格
    for (let i = 0; i < totalCells; i++) {
      cells.push({
        id: i,
        number: null,
        isRevealed: true,
        isClicked: false,
        isWrong: false,
      });
    }

    // 随机选择位置放置数字
    const positions = shuffleArray(Array.from({ length: totalCells }, (_, i) => i));
    for (let i = 0; i < numberCount; i++) {
      cells[positions[i]].number = i + 1;
    }

    return cells;
  }, [totalCells]);

  /**
   * 开始新一轮
   */
  const startRound = useCallback((level?: number) => {
    const targetLevel = level ?? currentLevel;
    const newGrid = generateGrid(targetLevel);
    setGrid(newGrid);
    setNextNumber(1);
    setStrikes(0);
    setGameState('showing');
  }, [currentLevel, generateGrid]);

  /**
   * 隐藏数字（用户点击第一个数字后触发）
   */
  const hideNumbers = useCallback(() => {
    setGrid(prev => prev.map(cell => ({
      ...cell,
      isRevealed: false,
    })));
    setGameState('playing');
  }, []);

  /**
   * 处理格子点击
   */
  const handleCellClick = useCallback((cellId: number) => {
    const cell = grid.find(c => c.id === cellId);
    if (!cell || cell.number === null || cell.isClicked) return;

    // 如果是显示状态且点击了数字1，隐藏所有数字
    if (gameState === 'showing' && cell.number === 1) {
      hideNumbers();
      // 标记第一个数字为已点击
      setGrid(prev => prev.map(c =>
        c.id === cellId ? { ...c, isClicked: true, isRevealed: true } : c
      ));
      setNextNumber(2);
      return;
    }

    if (gameState !== 'playing') return;

    // 检查是否点击了正确的数字
    if (cell.number === nextNumber) {
      // 正确
      setGrid(prev => prev.map(c =>
        c.id === cellId ? { ...c, isClicked: true, isRevealed: true } : c
      ));

      const newNextNumber = nextNumber + 1;
      setNextNumber(newNextNumber);

      // 检查是否完成当前关卡
      if (newNextNumber > currentLevel) {
        const newMaxLevel = Math.max(maxLevelRef.current, currentLevel);
        setMaxLevel(newMaxLevel);
        setGameState('result');
      }
    } else {
      // 错误
      setGrid(prev => prev.map(c =>
        c.id === cellId ? { ...c, isWrong: true } : c
      ));

      setLives(prev => prev - 1);
      setStrikes(prev => prev + 1);

      // 显示正确答案
      setTimeout(() => {
        setGrid(prev => prev.map(c => ({
          ...c,
          isRevealed: true,
        })));

        setTimeout(() => {
          if (livesRef.current <= 0) {
            handleGameOver();
          } else {
            // 重新开始当前关卡
            startRound(currentLevel);
          }
        }, 1000);
      }, 500);
    }
  }, [grid, gameState, nextNumber, currentLevel, hideNumbers, startRound]);

  /**
   * 游戏结束处理
   */
  const handleGameOver = useCallback(async () => {
    setGameState('failed');

    const finalScore = maxLevelRef.current;

    // 保存最佳成绩
    if (finalScore > 0) {
      const isNewBest = saveBestScore('chimp', finalScore);
      if (isNewBest) {
        console.log('新的最佳黑猩猩测试记录:', finalScore + '关');
      }
    }

    // 自动上传分数
    if (finalScore >= 4) {
      setIsSubmitting(true);
      setSubmissionError(null);
      setSubmissionSuccess(false);

      try {
        await submitScore(TestType.CHIMP, finalScore, {
          timestamp: Date.now(),
          finalLevel: finalScore,
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
   * 继续下一关
   */
  const continueGame = useCallback(() => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    startRound(newLevel);
  }, [currentLevel, startRound]);

  /**
   * 重新开始游戏
   */
  const restartGame = useCallback(() => {
    setCurrentLevel(4);
    setMaxLevel(0);
    setLives(3);
    setStrikes(0);
    setSubmissionError(null);
    setSubmissionSuccess(false);
    setGameState('start');
  }, []);

  /**
   * 获取格子样式
   */
  const getCellStyle = useCallback((cell: GridCell) => {
    let baseStyle = 'w-full h-full rounded-lg border-2 transition-all duration-150 flex items-center justify-center text-xl font-bold ';

    if (cell.number === null) {
      return baseStyle + 'bg-gray-100 border-gray-200 cursor-default';
    }

    if (cell.isWrong) {
      return baseStyle + 'bg-red-500 border-red-600 text-white cursor-default';
    }

    if (cell.isClicked) {
      return baseStyle + 'bg-green-500 border-green-600 text-white cursor-default';
    }

    if (cell.isRevealed) {
      return baseStyle + 'bg-white border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-50';
    }

    // 隐藏状态
    return baseStyle + 'bg-blue-500 border-blue-600 text-transparent cursor-pointer hover:bg-blue-600';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 标题和状态 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('tests.chimp.name')}
          </h1>
          <div className="flex justify-center items-center space-x-6 text-sm md:text-base">
            <p className="text-gray-600">
              数字数量: {currentLevel}
            </p>
            <p className="text-red-600">
              生命: {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
            </p>
          </div>
          {maxLevel > 0 && (
            <p className="text-amber-600 font-medium mt-2">
              最高记录: {maxLevel} 个数字
            </p>
          )}
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🐵</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  {t('tests.chimp.instruction')}
                </p>
                <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left max-w-md">
                  <p className="text-sm text-amber-800">
                    <strong>规则：</strong><br/>
                    1. 数字会短暂显示在网格中<br/>
                    2. 点击数字 1 后，其他数字会隐藏<br/>
                    3. 按顺序点击所有数字 (1, 2, 3...)<br/>
                    4. 点错会失去一条生命
                  </p>
                </div>
                <button
                  onClick={() => startRound()}
                  className="bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {(gameState === 'showing' || gameState === 'playing') && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center w-full"
              >
                <p className="text-gray-600 mb-4">
                  {gameState === 'showing'
                    ? '点击数字 1 开始'
                    : `点击数字 ${nextNumber}`}
                </p>

                {/* 5x5 网格 */}
                <div
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    maxWidth: '320px',
                  }}
                >
                  {grid.map((cell) => (
                    <motion.div
                      key={cell.id}
                      className={getCellStyle(cell)}
                      style={{ aspectRatio: '1' }}
                      onClick={() => handleCellClick(cell.id)}
                      whileHover={{ scale: cell.number !== null && !cell.isClicked ? 1.05 : 1 }}
                      whileTap={{ scale: cell.number !== null && !cell.isClicked ? 0.95 : 1 }}
                    >
                      {cell.number !== null && (cell.isRevealed || cell.isClicked) && (
                        <span>{cell.number}</span>
                      )}
                    </motion.div>
                  ))}
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
                  完美！
                </h2>
                <p className="text-gray-600 mb-6">
                  准备挑战 {currentLevel + 1} 个数字
                </p>
                <button
                  onClick={continueGame}
                  className="bg-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
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
                className="text-center w-full max-w-md mx-auto"
              >
                <div className="text-6xl mb-6">🐵</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  游戏结束
                </h2>
                <p className="text-lg font-medium text-amber-600 mb-4">
                  最终成绩: {maxLevel} 个数字
                </p>

                {/* 评价组件 */}
                <div className="mb-6">
                  <ResultEvaluation
                    testType="chimp"
                    score={maxLevel}
                  />
                </div>

                {/* 上传状态 */}
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

                <div className="space-x-4">
                  <button
                    onClick={restartGame}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard?test=chimp')}
                    className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
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
