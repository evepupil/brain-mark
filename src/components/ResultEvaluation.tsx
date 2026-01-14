import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { evaluateScore, getLevelStyle, EvaluationResult } from '../lib/evaluation';

/**
 * 结果评价组件属性
 */
interface ResultEvaluationProps {
  testType: string;
  score: number;
  className?: string;
}

/**
 * 获取测试类型的详细信息
 */
function getTestInfo(testType: string) {
  const testInfoMap: Record<string, {
    title: string;
    description: string;
    howItWorks: string;
    factors: string;
    tips: {
      title: string;
      content: string;
    }[];
    benchmarks: {
      excellent: { range: string; description: string };
      good: { range: string; description: string };
      average: { range: string; description: string };
    };
  }> = {
    reaction: {
      title: '反应时间测试',
      description: '反应时间测试测量您对视觉刺激的反应速度。该测试广泛用于心理学和神经科学研究，以评估认知处理速度和运动反应能力。',
      howItWorks: '您的反应时间是屏幕变绿和您点击之间的持续时间。测试会记录您的反应时间，多次测试可以帮助您了解自己的反应能力并提供更可靠的测量。',
      factors: '影响反应时间的因素包括年龄、身体健康、疲劳、分心、酒精和某些药物。定期练习可以通过增强神经通路和肌肉记忆来帮助改善反应时间。',
      tips: [
        { title: '保持警觉', content: '保持注意力集中在屏幕中心。避免分心，确保您处于安静的环境中以获得最佳表现。' },
        { title: '正确定位', content: '使用您的惯用手，将手指放在靠近鼠标或屏幕的位置。保持舒适的姿势以最小化移动时间。' },
        { title: '不要预测', content: '抵制猜测颜色何时会改变的冲动。过早点击会重置测试并影响您的平均分数。' },
        { title: '定期练习', content: '像任何技能一样，反应时间可以通过持续练习得到改善。尝试在测试中保持稳定的表现。' }
      ],
      benchmarks: {
        excellent: { range: '低于200毫秒', description: '专业游戏玩家级别的反应能力' },
        good: { range: '200-300毫秒', description: '高于平均水平的反应时间' },
        average: { range: '300-400毫秒', description: '典型的人类反应时间' }
      }
    },
    memory: {
      title: '数字记忆测试',
      description: '数字记忆测试评估您的短期记忆能力和数字序列记忆容量。这是认知能力评估中的经典测试，用于测量工作记忆的容量。',
      howItWorks: '测试从3位数字开始，每次成功后增加一位。您需要按照显示的顺序准确输入数字。测试在您出错时结束，最终分数是您能够记住的最长数字序列长度。',
      factors: '数字记忆能力受年龄、注意力、练习和记忆策略影响。使用分组、重复和可视化等技巧可以显著提高表现。压力和疲劳会降低记忆表现。',
      tips: [
        { title: '分组记忆', content: '将长数字分成3-4位的小组，如电话号码格式。这利用了大脑的自然分块能力。' },
        { title: '重复练习', content: '在心中重复数字序列，或轻声念出。听觉重复可以增强记忆保持。' },
        { title: '保持专注', content: '消除干扰，专注于数字显示。短暂的注意力分散可能导致整个序列丢失。' },
        { title: '使用策略', content: '尝试将数字与熟悉的模式、日期或数学关系联系起来。' }
      ],
      benchmarks: {
        excellent: { range: '12位以上', description: '卓越的短期记忆能力' },
        good: { range: '8-11位', description: '高于平均的记忆容量' },
        average: { range: '5-7位', description: '典型的数字记忆跨度' }
      }
    },
    visual: {
      title: '视觉记忆测试',
      description: '视觉记忆测试评估您记住和识别视觉模式的能力。这种类型的记忆对于空间导航、面部识别和视觉学习至关重要。',
      howItWorks: '每个关卡显示一个网格，其中某些方块会短暂亮起。您需要按照相同的顺序点击这些方块。随着关卡提升，模式变得更长更复杂。',
      factors: '视觉记忆受空间智能、注意力和视觉处理能力影响。年龄、疲劳和视觉障碍可能影响表现。定期的视觉记忆练习可以改善空间认知能力。',
      tips: [
        { title: '创建故事', content: '将亮起的方块想象成一个路径或故事。空间叙述可以帮助记住复杂的模式。' },
        { title: '使用地标', content: '将网格中的位置与熟悉的地标或房间布局联系起来。' },
        { title: '分段记忆', content: '将长模式分解为较小的段落，逐步构建完整的序列。' },
        { title: '视觉化练习', content: '在日常生活中练习记住视觉模式，如停车位置或物品摆放。' }
      ],
      benchmarks: {
        excellent: { range: '11关以上', description: '出色的视觉空间记忆' },
        good: { range: '7-10关', description: '良好的模式识别能力' },
        average: { range: '4-6关', description: '标准的视觉记忆水平' }
      }
    },
    typing: {
      title: '打字速度测试',
      description: '打字速度测试测量您的键盘输入速度和准确性。以每分钟单词数(WPM)计算，这是评估键盘熟练程度的标准指标。',
      howItWorks: '您需要准确输入显示的文本。测试计算您的打字速度(WPM)和准确率。速度基于正确输入的字符数，错误会影响最终分数。',
      factors: '打字速度受手指灵活性、键盘熟悉度、正确的手指位置和练习影响。人体工程学设置和定期练习是提高速度和准确性的关键。',
      tips: [
        { title: '正确手位', content: '使用标准的十指打字法，将手指放在基准键位上。避免看键盘，培养肌肉记忆。' },
        { title: '保持节奏', content: '专注于稳定的节奏而不是爆发性速度。一致的节奏通常比不规律的快速输入更有效。' },
        { title: '准确性优先', content: '准确性比速度更重要。错误会显著降低您的有效WPM分数。' },
        { title: '定期练习', content: '每天短时间的练习比偶尔的长时间练习更有效。专注于困难的字母组合。' }
      ],
      benchmarks: {
        excellent: { range: '90+ WPM', description: '专业级打字速度' },
        good: { range: '60-89 WPM', description: '熟练的打字能力' },
        average: { range: '40-59 WPM', description: '标准的打字速度' }
      }
    },
    sequence: {
      title: '序列记忆测试',
      description: '序列记忆测试评估您记住和重现按钮按压序列的能力。这测试工作记忆、注意力和序列处理能力。',
      howItWorks: '观看按钮按照特定顺序亮起，然后按照相同的顺序点击它们。每个关卡都会在序列中添加一个新的步骤，测试您的序列记忆极限。',
      factors: '序列记忆受工作记忆容量、注意力持续时间和序列处理能力影响。音乐训练和节奏感可能有助于序列记忆表现。',
      tips: [
        { title: '创建节奏', content: '将序列想象成音乐节拍或节奏模式。听觉编码可以增强序列记忆。' },
        { title: '分段学习', content: '将长序列分解为较小的组块，逐步构建完整的模式。' },
        { title: '重复练习', content: '在心中重复序列，使用手指动作来增强肌肉记忆。' },
        { title: '保持专注', content: '全神贯注地观看序列，避免在播放过程中分心。' }
      ],
      benchmarks: {
        excellent: { range: '13关以上', description: '卓越的序列记忆能力' },
        good: { range: '9-12关', description: '良好的序列处理能力' },
        average: { range: '6-8关', description: '典型的序列记忆水平' }
      }
    },
    // 黑猩猩测试信息
    chimp: {
      title: '黑猩猩测试',
      description: '黑猩猩测试基于京都大学灵长类研究所的著名实验，测试您的视觉短期记忆能力。研究表明，黑猩猩在这项测试中的表现往往优于人类，这揭示了不同物种记忆系统的独特特点。',
      howItWorks: '数字会短暂显示在网格中的随机位置。当您点击数字1时，其他数字会被隐藏。您需要按照从小到大的顺序(1, 2, 3...)点击所有数字的位置。每通过一关，数字数量会增加。',
      factors: '视觉短期记忆受注意力、空间认知能力和练习影响。年龄、疲劳和分心会降低表现。有趣的是，年幼的黑猩猩在这项测试中表现特别出色，可能与它们的"照相记忆"能力有关。',
      tips: [
        { title: '快速扫描', content: '在数字显示时快速扫描整个网格，尝试形成一个整体的空间印象而不是逐个记忆。' },
        { title: '相对位置', content: '记住数字之间的相对位置关系，而不是绝对位置。例如"3在1的右上方"。' },
        { title: '分组策略', content: '将相邻的数字分成小组记忆，减少需要记住的独立位置数量。' },
        { title: '保持冷静', content: '不要因为数字隐藏而慌张。深呼吸，相信你的空间记忆。' }
      ],
      benchmarks: {
        excellent: { range: '12个以上', description: '超越大多数黑猩猩的记忆能力' },
        good: { range: '9-11个', description: '接近黑猩猩的平均水平' },
        average: { range: '6-8个', description: '典型的人类视觉短期记忆' }
      }
    },
    // 瞄准训练测试信息
    aim: {
      title: '瞄准训练测试',
      description: '瞄准训练测试评估您的手眼协调能力和鼠标控制精准度。这项测试广泛用于电竞选手训练和神经运动能力评估。',
      howItWorks: '屏幕上会随机出现红色目标，您需要尽快点击它们。测试记录您的反应时间和准确率，综合计算最终分数。共有30个目标需要点击。',
      factors: '瞄准能力受手眼协调、鼠标灵敏度设置、显示器刷新率和练习程度影响。疲劳和分心会降低表现。职业电竞选手通常在这类测试中表现出色。',
      tips: [
        { title: '调整灵敏度', content: '找到适合自己的鼠标灵敏度设置，太快或太慢都会影响精准度。' },
        { title: '手腕稳定', content: '保持手腕稳定，使用手臂进行大范围移动，手腕进行微调。' },
        { title: '预判位置', content: '不要等目标完全出现再移动，尝试预判并快速反应。' },
        { title: '保持放松', content: '紧张会导致肌肉僵硬，保持放松状态能提高精准度。' }
      ],
      benchmarks: {
        excellent: { range: '120分以上', description: '电竞选手级别的瞄准能力' },
        good: { range: '80-119分', description: '优秀的手眼协调能力' },
        average: { range: '50-79分', description: '标准的瞄准水平' }
      }
    },
    // 斯特鲁普效应测试信息
    stroop: {
      title: '斯特鲁普效应测试',
      description: '斯特鲁普效应测试是认知心理学中的经典实验，用于测量选择性注意力和认知控制能力。当颜色词的含义与其显示颜色不一致时，会产生认知干扰，这种现象被称为"斯特鲁普效应"。',
      howItWorks: '屏幕会显示颜色词（如"红色"、"蓝色"），但文字的显示颜色可能与词义不同。您需要选择文字的显示颜色，而非词义。测试记录您的准确率和反应时间，综合计算最终分数。',
      factors: '斯特鲁普效应受认知控制能力、选择性注意力和抑制功能影响。年龄、疲劳、压力和某些神经系统疾病会影响表现。定期练习可以提高认知灵活性。',
      tips: [
        { title: '专注颜色', content: '忽略文字的语义含义，只关注显示颜色。尝试将文字当作无意义的形状。' },
        { title: '放慢速度', content: '开始时可以适当放慢速度，确保准确性。准确率比速度更重要。' },
        { title: '使用快捷键', content: '熟练使用键盘快捷键(R/B/G/Y)可以显著提高反应速度。' },
        { title: '保持冷静', content: '不一致的刺激会引起认知冲突感，保持冷静有助于做出正确选择。' }
      ],
      benchmarks: {
        excellent: { range: '130分以上', description: '卓越的认知控制能力' },
        good: { range: '90-129分', description: '良好的选择性注意力' },
        average: { range: '60-89分', description: '标准的认知控制水平' }
      }
    }
  };
  
  return testInfoMap[testType] || testInfoMap.reaction;
}

/**
 * 结果评价组件
 * 显示用户测试结果的等级评价、描述和建议
 */
export default function ResultEvaluation({ testType, score, className = '' }: ResultEvaluationProps) {
  const { t } = useTranslation('common');
  
  // 展开状态管理
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isImprovementExpanded, setIsImprovementExpanded] = useState(false);
  const [isBenchmarksExpanded, setIsBenchmarksExpanded] = useState(false);
  
  // 获取评价结果和测试信息
  const evaluation: EvaluationResult = evaluateScore(testType, score);
  const levelStyle = getLevelStyle(evaluation.level);
  const testInfo = getTestInfo(testType);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 主要结果显示 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-4xl mr-3">{evaluation.emoji}</span>
            <div>
              <h3 className={`text-2xl font-bold ${levelStyle.color}`}>
                {evaluation.title}
              </h3>
              <p className="text-gray-600 text-sm">
                第 {evaluation.percentile} 百分位
              </p>
            </div>
          </div>
          
          {/* 等级进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${levelStyle.bgColor.replace('bg-', 'bg-gradient-to-r from-').replace('-100', '-400 to-').replace('100', '600')}`}
              style={{ width: `${evaluation.percentile}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            你的表现超过了 {evaluation.percentile}% 的用户
          </p>
        </div>
      </div>

      {/* 三列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About This Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">关于此测试</h2>
            </div>
            <span className={`text-gray-500 transition-transform duration-200 ${isAboutExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          
          {isAboutExpanded && (
            <div className="space-y-4 text-gray-700 animate-in slide-in-from-top-2 duration-200">
              <p className="leading-relaxed">
                {testInfo.description}
              </p>
              
              <p className="leading-relaxed">
                {testInfo.howItWorks}
              </p>
              
              <p className="leading-relaxed">
                {testInfo.factors}
              </p>
            </div>
          )}
        </div>

        {/* How to Improve */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setIsImprovementExpanded(!isImprovementExpanded)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">💡</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">如何改进</h2>
            </div>
            <span className={`text-gray-500 transition-transform duration-200 ${isImprovementExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          
          {isImprovementExpanded && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              {testInfo.tips.map((tip, index) => (
                <div key={index} className="border-l-4 border-yellow-400 pl-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{tip.title}:</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{tip.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scoring & Benchmarks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-6"
          onClick={() => setIsBenchmarksExpanded(!isBenchmarksExpanded)}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg">🏆</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">评分与基准</h2>
          </div>
          <span className={`text-gray-500 transition-transform duration-200 ${isBenchmarksExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
        
        {isBenchmarksExpanded && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Excellent */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-green-700 mb-2">优秀</h3>
                  <p className="text-2xl font-bold text-green-800 mb-1">{testInfo.benchmarks.excellent.range}</p>
                  <p className="text-sm text-green-600">{testInfo.benchmarks.excellent.description}</p>
                </div>
              </div>
              
              {/* Good */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">良好</h3>
                  <p className="text-2xl font-bold text-blue-800 mb-1">{testInfo.benchmarks.good.range}</p>
                  <p className="text-sm text-blue-600">{testInfo.benchmarks.good.description}</p>
                </div>
              </div>
              
              {/* Average */}
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-orange-700 mb-2">平均</h3>
                  <p className="text-2xl font-bold text-orange-800 mb-1">{testInfo.benchmarks.average.range}</p>
                  <p className="text-sm text-orange-600">{testInfo.benchmarks.average.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                请记住，测试结果会因年龄、警觉性和练习等因素而自然变化。最重要的是一致性和随时间的逐步改善。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 简化版结果评价组件
 * 用于在测试页面内嵌显示
 */
export function ResultEvaluationCompact({ testType, score, className = '' }: ResultEvaluationProps) {
  const evaluation: EvaluationResult = evaluateScore(testType, score);
  const levelStyle = getLevelStyle(evaluation.level);
  
  return (
    <div className={`${levelStyle.bgColor} rounded-lg p-4 border-2 ${levelStyle.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{evaluation.emoji}</span>
          <div>
            <h4 className={`font-bold ${levelStyle.color}`}>
              {evaluation.title}
            </h4>
            <p className="text-sm text-gray-600">
              第 {evaluation.percentile} 百分位
            </p>
          </div>
        </div>
        
        {/* 迷你进度条 */}
        <div className="w-20 bg-white bg-opacity-50 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${levelStyle.color.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(evaluation.percentile, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">
        {evaluation.description}
      </p>
      
      <details className="text-sm">
        <summary className={`cursor-pointer ${levelStyle.color} font-medium`}>
          查看改进建议
        </summary>
        <p className="mt-2 text-gray-700 pl-4 border-l-2 border-gray-300">
          {evaluation.suggestion}
        </p>
      </details>
    </div>
  );
}