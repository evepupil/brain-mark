import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/types';
import { saveBestScore } from '../../lib/utils';
import ResultEvaluation from '../ResultEvaluation';

type GameState = 'start' | 'playing' | 'result';

// 颜色配置
const COLORS = [
  { name: '红色', nameEn: 'RED', color: '#EF4444', key: 'red' },
  { name: '蓝色', nameEn: 'BLUE', color: '#3B82F6', key: 'blue' },
  { name: '绿色', nameEn: 'GREEN', color: '#22C55E', key: 'green' },
  { name: '黄色', nameEn: 'YELLOW', color: '#EAB308', key: 'yellow' },
];

interface Trial {
  word: string;        // 显示的文字
  wordColor: string;   // 文字的颜色
  correctKey: string;  // 正确答案的key
  isCongruent: boolean; // 是否一致（词义和颜色相同）
}

/**
 * 斯特鲁普效应测试组件
 * 测试选择性注意力和认知控制能力
 */
export default function StroopTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [trialIndex, setTrialIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // 游戏配置
  const totalTrials = 20;
  const trialStartTime = useRef<number>(0);

  /**
   * 生成一个试验
   */
  const generateTrial = useCallback((): Trial => {
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const isCongruent = Math.random() > 0.5;

    let colorIndex: number;
    if (isCongruent) {
      colorIndex = wordIndex;
    } else {
      do {
        colorIndex = Math.floor(Math.random() * COLORS.length);
      } while (colorIndex === wordIndex);
    }

    return {
      word: COLORS[wordIndex].name,
      wordColor: COLORS[colorIndex].color,
      correctKey: COLORS[colorIndex].key,
      isCongruent,
    };
  }, []);

  /**
   * 开始游戏
   */
  const startGame = useCallback(() => {
    setGameState('playing');
    setTrialIndex(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setReactionTimes([]);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    const trial = generateTrial();
    setCurrentTrial(trial);
    trialStartTime.current = Date.now();
  }, [generateTrial]);

  /**
   * 处理用户选择
   */
  const handleChoice = useCallback((chosenKey: string) => {
    if (!currentTrial || gameState !== 'playing') return;

    const reactionTime = Date.now() - trialStartTime.current;
    const isCorrect = chosenKey === currentTrial.correctKey;

    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
    } else {
      setWrong(prev => prev + 1);
    }

    const newTrialIndex = trialIndex + 1;
    setTrialIndex(newTrialIndex);

    if (newTrialIndex >= totalTrials) {
      finishGame(isCorrect ? correct + 1 : correct, isCorrect ? wrong : wrong + 1,
        isCorrect ? [...reactionTimes, reactionTime] : reactionTimes);
    } else {
      const trial = generateTrial();
      setCurrentTrial(trial);
      trialStartTime.current = Date.now();
    }
  }, [currentTrial, gameState, trialIndex, correct, wrong, reactionTimes, generateTrial]);

  /**
   * 结束游戏
   */
  const finishGame = useCallback(async (
    finalCorrect: number,
    finalWrong: number,
    times: number[]
  ) => {
    setGameState('result');

    const avgTime = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 999;

    const accuracy = finalCorrect / totalTrials * 100;

    // 分数计算：基于准确率和平均反应时间
    // 分数 = (准确率 * 10) * (1000 / 平均时间)
    const finalScore = Math.round((accuracy / 100) * (1000 / avgTime) * 100);
    setScore(finalScore);

    if (finalScore > 0) {
      saveBestScore('stroop', finalScore);
    }

    if (finalScore > 0) {
      setIsSubmitting(true);
      try {
        await submitScore(TestType.STROOP, finalScore, {
          timestamp: Date.now(),
          avgReactionTime: avgTime,
          accuracy: Math.round(accuracy),
          correct: finalCorrect,
          wrong: finalWrong,
        });
        setSubmissionSuccess(true);
      } catch (error: any) {
        setSubmissionError(error.message || '分数上传失败');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, []);

  /**
   * 键盘事件处理
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const keyMap: Record<string, string> = {
        'r': 'red', 'R': 'red',
        'b': 'blue', 'B': 'blue',
        'g': 'green', 'G': 'green',
        'y': 'yellow', 'Y': 'yellow',
      };

      if (keyMap[e.key]) {
        handleChoice(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const avgTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('tests.stroop.name')}
          </h1>
          {gameState === 'playing' && (
            <div className="flex justify-center items-center space-x-6 text-sm">
              <p className="text-gray-600">进度: {trialIndex}/{totalTrials}</p>
              <p className="text-green-600">正确: {correct}</p>
              <p className="text-red-600">错误: {wrong}</p>
            </div>
          )}
        </div>

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
                <div className="text-6xl mb-6">🎨</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">准备开始</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  {t('tests.stroop.instruction')}
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left max-w-md">
                  <p className="text-sm text-purple-800">
                    <strong>规则：</strong><br/>
                    1. 屏幕会显示一个颜色词<br/>
                    2. 选择文字的<strong>显示颜色</strong>，而非词义<br/>
                    3. 点击按钮或按键盘快捷键 (R/B/G/Y)<br/>
                    4. 共 {totalTrials} 题，尽快作答
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && currentTrial && (
              <motion.div
                key={`trial-${trialIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center w-full"
              >
                <p className="text-gray-500 mb-4">选择文字的显示颜色</p>

                <div
                  className="text-6xl md:text-8xl font-bold mb-8 py-8"
                  style={{ color: currentTrial.wordColor }}
                >
                  {currentTrial.word}
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {COLORS.map((color) => (
                    <button
                      key={color.key}
                      onClick={() => handleChoice(color.key)}
                      className="py-4 px-6 rounded-lg text-white font-bold text-lg transition-transform hover:scale-105 active:scale-95"
                      style={{ backgroundColor: color.color }}
                    >
                      {color.name} ({color.key[0].toUpperCase()})
                    </button>
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
                className="text-center w-full max-w-md mx-auto"
              >
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">测试完成</h2>
                <p className="text-4xl font-bold text-purple-600 mb-4">{score} 分</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">平均反应</p>
                    <p className="text-xl font-bold text-green-600">{avgTime}ms</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">准确率</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(correct / totalTrials * 100)}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">正确</p>
                    <p className="text-xl font-bold text-purple-600">{correct}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">错误</p>
                    <p className="text-xl font-bold text-red-600">{wrong}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <ResultEvaluation testType="stroop" score={score} />
                </div>

                <div className="mb-4">
                  {isSubmitting && (
                    <div className="flex items-center justify-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      正在上传分数...
                    </div>
                  )}
                  {submissionSuccess && (
                    <div className="text-green-600">✅ 分数已上传到排行榜！</div>
                  )}
                  {submissionError && (
                    <div className="text-red-600">❌ {submissionError}</div>
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
                    onClick={() => router.push('/leaderboard?test=stroop')}
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
