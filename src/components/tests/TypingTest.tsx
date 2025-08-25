import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { submitScore } from '../../lib/api';
import { TestType } from '../../lib/supabase';
import { delay, shuffleArray } from '../../lib/utils';
import { ResultEvaluationCompact } from '../ResultEvaluation';

type GameState = 'start' | 'typing' | 'result';

interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  timeElapsed: number;
}

/**
 * 打字速度测试组件
 * 测试用户的打字速度和准确率
 */
export default function TypingTest() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('start');
  const [testText, setTestText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [testDuration, setTestDuration] = useState(60); // 测试时长（秒）
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 测试文本库
  const textSamples = [
    "在这个快速发展的数字时代，打字技能变得越来越重要。无论是工作还是学习，良好的打字速度和准确率都能大大提高我们的效率。通过不断的练习和正确的指法，每个人都可以成为打字高手。",
    "科技改变了我们的生活方式，从智能手机到人工智能，从云计算到物联网，这些技术正在重塑我们的世界。我们需要适应这些变化，学习新的技能，拥抱未来的挑战。",
    "阅读是获取知识的重要途径，它不仅能够丰富我们的内心世界，还能提高我们的思维能力。在信息爆炸的时代，培养良好的阅读习惯显得尤为重要。",
    "健康的生活方式包括合理的饮食、适量的运动和充足的睡眠。在忙碌的现代生活中，我们往往忽视了这些基本需求，但它们对我们的身心健康至关重要。",
    "团队合作是现代工作环境中不可或缺的技能。通过有效的沟通、相互理解和共同努力，团队能够创造出超越个人能力的成果。"
  ];

  /**
   * 开始测试
   */
  const startTest = useCallback(() => {
    const randomText = shuffleArray(textSamples)[0];
    setTestText(randomText);
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(Date.now());
    setEndTime(null);
    setStats(null);
    setTimeLeft(testDuration);
    setGameState('typing');
    
    // 聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    // 开始计时器
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [testDuration]);

  /**
   * 完成测试
   */
  /**
   * 计算正确字符数
   */
  const calculateCorrectChars = useCallback(() => {
    let correct = 0;
    for (let i = 0; i < Math.min(userInput.length, testText.length); i++) {
      if (userInput[i] === testText[i]) {
        correct++;
      }
    }
    return correct;
  }, [userInput, testText]);

  /**
   * 完成测试
   */
  const finishTest = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const endTime = Date.now();
    setEndTime(endTime);
    
    if (startTime) {
      const timeElapsed = (endTime - startTime) / 1000;
      const correctChars = calculateCorrectChars();
      const totalChars = userInput.length;
      const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
      
      // 计算WPM (Words Per Minute)
      // 标准：5个字符 = 1个单词
      const wordsTyped = correctChars / 5;
      const wpm = Math.round((wordsTyped / timeElapsed) * 60);
      
      const finalStats: TypingStats = {
        wpm,
        accuracy: Math.round(accuracy * 100) / 100,
        correctChars,
        totalChars,
        timeElapsed: Math.round(timeElapsed * 100) / 100,
      };
      
      setStats(finalStats);
      setGameState('result');
      
      // 自动上传分数
      if (wpm > 0) {
        setIsSubmitting(true);
        setSubmissionError(null);
        setSubmissionSuccess(false);
        
        try {
          await submitScore(TestType.TYPING, wpm, {
            timestamp: Date.now(),
            accuracy: finalStats.accuracy,
            correctChars: finalStats.correctChars,
            totalChars: finalStats.totalChars,
            timeElapsed: finalStats.timeElapsed,
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
  }, [startTime, userInput, calculateCorrectChars]);

  // 自动检测测试完成并提交分数
  useEffect(() => {
    if (gameState === 'typing' && startTime && userInput.length >= testText.length) {
      finishTest();
    }
  }, [gameState, startTime, userInput.length, testText.length, finishTest]);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((value: string) => {
    if (gameState !== 'typing') return;
    
    setUserInput(value);
    setCurrentIndex(value.length);
    
    // 如果输入完成
    if (value.length >= testText.length) {
      finishTest();
    }
  }, [gameState, testText.length, finishTest]);

  /**
   * 重新开始测试
   */
  const restartTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSubmissionError(null);
    setSubmissionSuccess(false);
    setGameState('start');
  }, []);



  /**
   * 获取字符样式
   */
  const getCharStyle = useCallback((index: number) => {
    if (index < userInput.length) {
      // 已输入的字符
      if (userInput[index] === testText[index]) {
        return 'bg-green-200 text-green-800'; // 正确
      } else {
        return 'bg-red-200 text-red-800'; // 错误
      }
    } else if (index === currentIndex) {
      return 'bg-blue-200 text-blue-800'; // 当前位置
    } else {
      return 'text-gray-600'; // 未输入
    }
  }, [userInput, testText, currentIndex]);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            打字速度测试
          </h1>
          <p className="text-gray-600">
            测试时长: {testDuration} 秒
          </p>
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">⌨️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  准备开始
                </h2>
                <p className="text-gray-600 mb-8">
                  在规定时间内尽可能快速且准确地输入文本
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择测试时长:
                  </label>
                  <select
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  >
                    <option value={30}>30 秒</option>
                    <option value={60}>60 秒</option>
                    <option value={120}>120 秒</option>
                  </select>
                </div>
                <button
                  onClick={startTest}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
                >
                  开始测试
                </button>
              </motion.div>
            )}

            {gameState === 'typing' && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                {/* 状态栏 */}
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-medium text-gray-700">
                    剩余时间: <span className="text-red-600">{timeLeft}s</span>
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    进度: {userInput.length}/{testText.length}
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    准确率: {userInput.length > 0 ? Math.round((calculateCorrectChars() / userInput.length) * 100) : 100}%
                  </div>
                </div>

                {/* 文本显示区域 */}
                <div className="bg-gray-50 rounded-lg p-6 font-mono text-lg leading-relaxed">
                  {testText.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`${getCharStyle(index)} transition-colors duration-100`}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* 输入区域 */}
                <div>
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg font-mono text-lg focus:border-green-500 focus:outline-none resize-none"
                    placeholder="在这里输入文本..."
                    disabled={gameState !== 'typing'}
                  />
                </div>

                <div className="text-center">
                  <button
                    onClick={restartTest}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'result' && stats && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center w-full max-w-2xl mx-auto"
              >
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  测试完成！
                </h2>
                
                {/* 成绩展示 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.wpm}</div>
                    <div className="text-sm text-gray-600">WPM</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
                    <div className="text-sm text-gray-600">准确率</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{stats.correctChars}</div>
                    <div className="text-sm text-gray-600">正确字符</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{stats.timeElapsed}s</div>
                    <div className="text-sm text-gray-600">用时</div>
                  </div>
                </div>

                {/* 评价系统 */}
                <div className="mb-6">
                  <ResultEvaluationCompact 
                    testType={TestType.TYPING} 
                    score={stats.wpm} 
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
                    onClick={restartTest}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    重新测试
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard?test=typing')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
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