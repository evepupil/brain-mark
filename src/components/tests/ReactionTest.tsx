import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/supabase';
import { delay, randomInt } from '../../lib/utils';
import { ResultEvaluationCompact } from '../ResultEvaluation';

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

/**
 * 反应速度测试组件
 * 测试用户的视觉反应速度
 */
export default function ReactionTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  /**
   * 开始测试
   */
  const startTest = useCallback(async () => {
    setGameState('ready');
    
    // 随机等待2-5秒
    const waitTime = randomInt(2000, 5000);
    await delay(waitTime);
    
    setGameState('go');
    setStartTime(Date.now());
  }, []);

  /**
   * 处理点击事件
   */
  const handleClick = useCallback(async () => {
    if (gameState === 'ready') {
      // 太早点击
      setGameState('tooEarly');
    } else if (gameState === 'go') {
      // 正确反应
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      setGameState('result');
      
      // 自动上传分数
      if (reaction > 0) {
        setIsSubmitting(true);
        setSubmissionError(null);
        setSubmissionSuccess(false);
        
        try {
          await submitScore(TestType.REACTION, reaction, {
            timestamp: Date.now(),
          });
          setSubmissionSuccess(true);
        } catch (error: any) {
          console.error('自动提交分数失败:', error);
          setSubmissionError(error.message || '分数上传失败');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  }, [gameState, startTime]);

  /**
   * 重新开始测试
   */
  const resetTest = useCallback(() => {
    setGameState('waiting');
    setReactionTime(0);
    setStartTime(0);
    setSubmissionError(null);
    setSubmissionSuccess(false);
  }, []);



  /**
   * 获取背景颜色
   */
  const getBackgroundColor = () => {
    switch (gameState) {
      case 'ready':
        return 'bg-red-500';
      case 'go':
        return 'bg-green-500';
      case 'tooEarly':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  /**
   * 获取显示文本
   */
  const getDisplayText = () => {
    switch (gameState) {
      case 'waiting':
        return {
          title: '反应速度测试',
          subtitle: '点击开始测试',
          instruction: '当屏幕变绿时立即点击'
        };
      case 'ready':
        return {
          title: '等待...',
          subtitle: '准备好了吗？',
          instruction: '等待绿色出现'
        };
      case 'go':
        return {
          title: '点击！',
          subtitle: '现在点击！',
          instruction: ''
        };
      case 'tooEarly':
        return {
          title: '太早了！',
          subtitle: '等待绿色出现',
          instruction: '点击重新开始'
        };
      case 'result':
        return {
          title: `${reactionTime}ms`,
          subtitle: getResultMessage(),
          instruction: ''
        };
      default:
        return { title: '', subtitle: '', instruction: '' };
    }
  };

  /**
   * 获取结果评价
   */
  const getResultMessage = () => {
    if (reactionTime < 200) return '🚀 超快！';
    if (reactionTime < 250) return '⚡ 很快！';
    if (reactionTime < 300) return '👍 不错！';
    if (reactionTime < 400) return '😐 一般';
    return '🐌 需要练习';
  };

  const displayText = getDisplayText();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 主测试区域 */}
      <motion.div
        className={`flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
          getBackgroundColor()
        }`}
        onClick={gameState === 'waiting' ? startTest : handleClick}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="text-center text-white px-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {displayText.title}
            </h1>
            <p className="text-xl md:text-2xl mb-2">
              {displayText.subtitle}
            </p>
            {displayText.instruction && (
              <p className="text-lg opacity-80">
                {displayText.instruction}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 结果操作区域 */}
      {gameState === 'result' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 border-t border-gray-200"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 评价组件 */}
            <ResultEvaluationCompact 
              testType="reaction" 
              score={reactionTime}
              className="mb-4"
            />
            
            {/* 自动上传状态提示 */}
            <div className="mb-4">
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
            <div className="flex space-x-4">
              <button
                onClick={resetTest}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                {t('tryAgain')}
              </button>
              <button
                onClick={() => router.push('/leaderboard?test=reaction')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                查看排行榜
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 太早点击的重试按钮 */}
      {gameState === 'tooEarly' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 border-t border-gray-200"
        >
          <div className="max-w-md mx-auto">
            <button
              onClick={resetTest}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              重新开始
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}