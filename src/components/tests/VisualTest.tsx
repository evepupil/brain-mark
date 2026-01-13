import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/types';
import { delay, randomInt, shuffleArray, saveBestScore } from '../../lib/utils';
import ResultEvaluation from '../ResultEvaluation';

type GameState = 'start' | 'showing' | 'input' | 'result' | 'failed';

interface GridCell {
  id: number;
  isTarget: boolean;
  isClicked: boolean;
  isCorrect?: boolean;
}

/**
 * 视觉记忆测试组件
 * 测试用户的视觉记忆能力
 */
export default function VisualTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3); // 网格大小
  const [targetCount, setTargetCount] = useState(3); // 目标方块数量
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [showTime, setShowTime] = useState(2000); // 显示时间
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [maxLevel, setMaxLevel] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lives, setLives] = useState(3); // 生命值

  /**
   * 生成网格
   */
  const generateGrid = useCallback((size: number, targets: number) => {
    const totalCells = size * size;
    const cells: GridCell[] = [];
    
    // 创建所有格子
    for (let i = 0; i < totalCells; i++) {
      cells.push({
        id: i,
        isTarget: false,
        isClicked: false,
      });
    }
    
    // 随机选择目标格子
    const shuffled = shuffleArray(Array.from({ length: totalCells }, (_, i) => i));
    for (let i = 0; i < Math.min(targets, totalCells); i++) {
      cells[shuffled[i]].isTarget = true;
    }
    
    return cells;
  }, []);

  /**
   * 开始新一轮测试
   */
  const startRound = useCallback(async () => {
    const newGrid = generateGrid(gridSize, targetCount);
    setGrid(newGrid);
    setGameState('showing');
    
    // 显示目标方块一段时间
    await delay(showTime);
    setGameState('input');
  }, [gridSize, targetCount, generateGrid, showTime]);

  /**
   * 处理格子点击
   */
  const handleCellClick = useCallback((cellId: number) => {
    if (gameState !== 'input') return;
    
    setGrid(prev => {
      const newGrid = prev.map(cell => {
        if (cell.id === cellId && !cell.isClicked) {
          return { ...cell, isClicked: true };
        }
        return cell;
      });
      
      // 检查是否完成
      const clickedTargets = newGrid.filter(cell => cell.isTarget && cell.isClicked).length;
      const clickedNonTargets = newGrid.filter(cell => !cell.isTarget && cell.isClicked).length;
      const totalTargets = newGrid.filter(cell => cell.isTarget).length;
      
      // 如果点击了非目标格子
      if (clickedNonTargets > 0) {
        setMistakes(prev => prev + 1);
        setLives(prev => prev - 1);
        
        // 显示正确答案
        const gridWithResults = newGrid.map(cell => ({
          ...cell,
          isCorrect: cell.isTarget,
        }));
        setGrid(gridWithResults);
        
        setTimeout(async () => {
          if (lives <= 1) {
            setGameState('failed');
            
            // 保存最佳成绩到localStorage
            if (maxLevel > 0) {
              const isNewBest = saveBestScore('visual', maxLevel);
              if (isNewBest) {
                console.log('新的最佳视觉记忆记录:', maxLevel + '关');
              }
            }
            
            // 自动上传分数（如果达到了一定等级）
            if (maxLevel >= 3) {
              setIsSubmitting(true);
              setSubmissionError(null);
              setSubmissionSuccess(false);
              
              try {
                await submitScore(TestType.VISUAL, maxLevel, {
                  timestamp: Date.now(),
                  mistakes,
                  finalGridSize: gridSize,
                  finalTargetCount: targetCount,
                });
                setSubmissionSuccess(true);
              } catch (error: any) {
                console.error('自动提交分数失败:', error);
                setSubmissionError(error.message || '分数上传失败');
              } finally {
                setIsSubmitting(false);
              }
            }
          } else {
            // 重新开始当前关卡
            startRound();
          }
        }, 1500);
        
        return gridWithResults;
      }
      
      // 如果所有目标都被点击
      if (clickedTargets === totalTargets) {
        setMaxLevel(Math.max(maxLevel, currentLevel));
        setGameState('result');
      }
      
      return newGrid;
    });
  }, [gameState, currentLevel, maxLevel, lives, startRound]);

  /**
   * 继续下一关
   */
  const continueGame = useCallback(() => {
    setCurrentLevel(prev => prev + 1);
    
    // 每3关增加网格大小
    if (currentLevel % 3 === 0) {
      setGridSize(prev => Math.min(prev + 1, 6));
    }
    
    // 每2关增加目标数量
    if (currentLevel % 2 === 0) {
      setTargetCount(prev => prev + 1);
    }
    
    // 每关减少显示时间（最少1秒）
    setShowTime(prev => Math.max(prev - 100, 1000));
    
    startRound();
  }, [currentLevel, startRound]);

  /**
   * 重新开始游戏
   */
  const restartGame = useCallback(() => {
    setCurrentLevel(1);
    setGridSize(3);
    setTargetCount(3);
    setShowTime(2000);
    setMaxLevel(0);
    setMistakes(0);
    setLives(3);
    setSubmissionError(null);
    setSubmissionSuccess(false);
    setGameState('start');
  }, []);



  /**
   * 获取格子样式
   */
  const getCellStyle = useCallback((cell: GridCell) => {
    let baseStyle = 'w-full h-full rounded-lg border-2 transition-all duration-200 cursor-pointer ';
    
    if (gameState === 'showing' && cell.isTarget) {
      return baseStyle + 'bg-blue-500 border-blue-600';
    }
    
    if (gameState === 'input') {
      if (cell.isClicked) {
        if (cell.isCorrect === true) {
          return baseStyle + 'bg-green-500 border-green-600';
        } else if (cell.isCorrect === false) {
          return baseStyle + 'bg-red-500 border-red-600';
        } else if (cell.isTarget) {
          return baseStyle + 'bg-blue-500 border-blue-600';
        } else {
          return baseStyle + 'bg-red-500 border-red-600';
        }
      }
      return baseStyle + 'bg-gray-200 border-gray-300 hover:bg-gray-300';
    }
    
    return baseStyle + 'bg-gray-200 border-gray-300';
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 标题和状态显示 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            视觉记忆测试
          </h1>
          <div className="flex justify-center items-center space-x-6 text-sm md:text-base">
            <p className="text-gray-600">
              等级: {currentLevel}
            </p>
            <p className="text-gray-600">
              网格: {gridSize}×{gridSize}
            </p>
            <p className="text-gray-600">
              目标: {targetCount} 个
            </p>
            <p className="text-red-600">
              生命: {'❤️'.repeat(lives)}{'🤍'.repeat(3 - lives)}
            </p>
          </div>
          {maxLevel > 0 && (
            <p className="text-purple-600 font-medium mt-2">
              最高等级: {maxLevel}
            </p>
          )}
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">👁️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  记住蓝色方块的位置，然后点击它们。点错会失去生命值！
                </p>
                <button
                  onClick={startRound}
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {(gameState === 'showing' || gameState === 'input') && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center w-full"
              >
                <p className="text-gray-600 mb-6">
                  {gameState === 'showing' ? '记住蓝色方块的位置' : '点击你记住的方块'}
                </p>
                
                {/* 网格 */}
                <div 
                  className="grid gap-2 mx-auto mb-6"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    maxWidth: `${Math.min(400, gridSize * 60)}px`,
                  }}
                >
                  {grid.map((cell) => (
                    <motion.div
                      key={cell.id}
                      className={getCellStyle(cell)}
                      style={{ aspectRatio: '1' }}
                      onClick={() => handleCellClick(cell.id)}
                      whileHover={{ scale: gameState === 'input' ? 1.05 : 1 }}
                      whileTap={{ scale: gameState === 'input' ? 0.95 : 1 }}
                    />
                  ))}
                </div>
                
                {gameState === 'showing' && (
                  <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-purple-600 h-2 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: showTime / 1000, ease: 'linear' }}
                    />
                  </div>
                )}
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
                  准备挑战等级 {currentLevel + 1}
                </p>
                <button
                  onClick={continueGame}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
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
                <div className="text-6xl mb-6">😵</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  游戏结束
                </h2>
                <p className="text-gray-600 mb-2">
                  生命值耗尽
                </p>
                <p className="text-lg font-medium text-purple-600 mb-6">
                  最终成绩: 等级 {maxLevel}
                </p>
                
                {/* 评价系统 */}
                <div className="mb-8">
                  <ResultEvaluation 
                    testType={TestType.VISUAL} 
                    score={maxLevel} 
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
                
                <div className="space-x-4">
                  <button
                    onClick={restartGame}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard?test=visual')}
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