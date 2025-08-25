import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/supabase';
import { delay, randomInt } from '../../lib/utils';
import { ResultEvaluationCompact } from '../ResultEvaluation';

type GameState = 'start' | 'showing' | 'input' | 'result' | 'failed';

interface GridCell {
  id: number;
  isActive: boolean;
  isClicked: boolean;
}

/**
 * 序列记忆测试组件
 * 测试用户记住按钮点击序列的能力
 */
export default function SequenceTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [maxLevel, setMaxLevel] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(600); // 播放速度（毫秒）

  const gridSize = 3; // 3x3 网格
  const totalCells = gridSize * gridSize;

  /**
   * 初始化网格
   */
  const initializeGrid = useCallback(() => {
    const cells: GridCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      cells.push({
        id: i,
        isActive: false,
        isClicked: false,
      });
    }
    setGrid(cells);
  }, [totalCells]);

  /**
   * 生成新序列
   */
  const generateSequence = useCallback((length: number) => {
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(randomInt(0, totalCells - 1));
    }
    return newSequence;
  }, [totalCells]);

  /**
   * 播放序列
   */
  const playSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setShowingIndex(-1);
    
    // 重置网格
    setGrid(prev => prev.map(cell => ({ ...cell, isActive: false, isClicked: false })));
    
    await delay(500); // 开始前的延迟
    
    for (let i = 0; i < seq.length; i++) {
      setShowingIndex(i);
      
      // 激活当前格子
      setGrid(prev => prev.map((cell, index) => ({
        ...cell,
        isActive: index === seq[i],
      })));
      
      await delay(playbackSpeed);
      
      // 取消激活
      setGrid(prev => prev.map(cell => ({ ...cell, isActive: false })));
      
      if (i < seq.length - 1) {
        await delay(200); // 格子之间的间隔
      }
    }
    
    setShowingIndex(-1);
    setGameState('input');
  }, [playbackSpeed]);

  /**
   * 开始新一轮测试
   */
  const startRound = useCallback(async () => {
    const newSequence = generateSequence(currentLevel);
    setSequence(newSequence);
    setUserSequence([]);
    initializeGrid();
    await playSequence(newSequence);
  }, [currentLevel, generateSequence, initializeGrid, playSequence]);

  /**
   * 处理格子点击
   */
  const handleCellClick = useCallback((cellId: number) => {
    if (gameState !== 'input') return;
    
    const newUserSequence = [...userSequence, cellId];
    setUserSequence(newUserSequence);
    
    // 更新网格显示
    setGrid(prev => prev.map((cell, index) => {
      if (index === cellId) {
        return { ...cell, isClicked: true };
      }
      return cell;
    }));
    
    // 检查当前输入是否正确
    const currentIndex = newUserSequence.length - 1;
    if (sequence[currentIndex] !== cellId) {
      // 输入错误，游戏结束
      setGameState('failed');
      
      // 自动上传分数（如果达到了一定等级）
      if (maxLevel >= 3) {
        setIsSubmitting(true);
        setSubmissionError(null);
        setSubmissionSuccess(false);
        
        (async () => {
          try {
            await submitScore(TestType.SEQUENCE, maxLevel, {
              timestamp: Date.now(),
              finalSpeed: playbackSpeed,
              sequenceLength: currentLevel - 1,
            });
            setSubmissionSuccess(true);
          } catch (error: any) {
            console.error('自动提交分数失败:', error);
            setSubmissionError(error.message || '分数上传失败');
          } finally {
            setIsSubmitting(false);
          }
        })();
      }
      
      return;
    }
    
    // 检查是否完成当前序列
    if (newUserSequence.length === sequence.length) {
      // 完成当前关卡
      setMaxLevel(Math.max(maxLevel, currentLevel));
      setGameState('result');
    }
  }, [gameState, userSequence, sequence, currentLevel, maxLevel]);

  /**
   * 继续下一关
   */
  const continueGame = useCallback(() => {
    setCurrentLevel(prev => prev + 1);
    
    // 每3关增加一点速度（减少播放时间）
    if (currentLevel % 3 === 0) {
      setPlaybackSpeed(prev => Math.max(prev - 50, 300));
    }
    
    startRound();
  }, [currentLevel, startRound]);

  /**
   * 重新开始游戏
   */
  const restartGame = useCallback(() => {
    setCurrentLevel(1);
    setPlaybackSpeed(600);
    setMaxLevel(0);
    setSubmissionError(null);
    setSubmissionSuccess(false);
    setGameState('start');
    initializeGrid();
  }, [initializeGrid]);



  /**
   * 获取格子样式
   */
  const getCellStyle = useCallback((cell: GridCell, index: number) => {
    let baseStyle = 'w-20 h-20 md:w-24 md:h-24 rounded-lg border-4 transition-all duration-200 cursor-pointer flex items-center justify-center text-2xl font-bold ';
    
    if (cell.isActive) {
      return baseStyle + 'bg-blue-500 border-blue-600 text-white scale-110 shadow-lg';
    }
    
    if (cell.isClicked) {
      return baseStyle + 'bg-green-500 border-green-600 text-white';
    }
    
    if (gameState === 'input') {
      return baseStyle + 'bg-gray-200 border-gray-300 hover:bg-gray-300 hover:scale-105';
    }
    
    return baseStyle + 'bg-gray-200 border-gray-300';
  }, [gameState]);

  /**
   * 初始化组件
   */
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 标题和等级显示 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            序列记忆测试
          </h1>
          <div className="flex justify-center items-center space-x-6 text-sm md:text-base">
            <p className="text-gray-600">
              等级: {currentLevel}
            </p>
            <p className="text-gray-600">
              序列长度: {currentLevel}
            </p>
            <p className="text-gray-600">
              速度: {playbackSpeed}ms
            </p>
          </div>
          {maxLevel > 0 && (
            <p className="text-indigo-600 font-medium mt-2">
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
                <div className="text-6xl mb-6">🔢</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  观察按钮的闪烁序列，然后按照相同的顺序点击它们
                </p>
                <button
                  onClick={startRound}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
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
                <div className="mb-6">
                  {gameState === 'showing' && (
                    <div className="space-y-2">
                      <p className="text-gray-600">观察序列</p>
                      <div className="flex justify-center items-center space-x-2">
                        <span className="text-sm text-gray-500">进度:</span>
                        <div className="flex space-x-1">
                          {sequence.map((_, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full ${
                                index <= showingIndex ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'input' && (
                    <div className="space-y-2">
                      <p className="text-gray-600">按照顺序点击</p>
                      <div className="flex justify-center items-center space-x-2">
                        <span className="text-sm text-gray-500">进度:</span>
                        <span className="text-sm font-medium">
                          {userSequence.length} / {sequence.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 3x3 网格 */}
                <div className="grid grid-cols-3 gap-4 justify-center mx-auto max-w-xs">
                  {grid.map((cell, index) => (
                    <motion.div
                      key={cell.id}
                      className={getCellStyle(cell, index)}
                      onClick={() => handleCellClick(cell.id)}
                      whileHover={{ scale: gameState === 'input' ? 1.05 : 1 }}
                      whileTap={{ scale: gameState === 'input' ? 0.95 : 1 }}
                    >
                      {index + 1}
                    </motion.div>
                  ))}
                </div>
                
                {gameState === 'input' && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      点击按钮重复序列
                    </p>
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
                  准备挑战 {currentLevel + 1} 步序列
                </p>
                <button
                  onClick={continueGame}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
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
                className="text-center"
              >
                <div className="text-6xl mb-6">😵</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  序列错误
                </h2>
                <div className="mb-6 space-y-2">
                  <p className="text-gray-600">
                    正确序列: {sequence.map(id => id + 1).join(' → ')}
                  </p>
                  <p className="text-gray-600">
                    你的输入: {userSequence.map(id => id + 1).join(' → ')}
                  </p>
                </div>
                <p className="text-lg font-medium text-indigo-600 mb-6">
                  最终成绩: 等级 {maxLevel}
                </p>
                
                {/* 评价组件 */}
                <div className="mb-6">
                  <ResultEvaluationCompact 
                    testType="sequence" 
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
                    onClick={() => router.push('/leaderboard?test=sequence')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
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