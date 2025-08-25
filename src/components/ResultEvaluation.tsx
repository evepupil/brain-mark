import React from 'react';
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
 * 结果评价组件
 * 显示用户测试结果的等级评价、描述和建议
 */
export default function ResultEvaluation({ testType, score, className = '' }: ResultEvaluationProps) {
  const { t } = useTranslation('common');
  
  // 获取评价结果
  const evaluation: EvaluationResult = evaluateScore(testType, score);
  const levelStyle = getLevelStyle(evaluation.level);
  
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* 等级标题 */}
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
        
        {/* 百分位说明 */}
        <p className="text-sm text-gray-500">
          你的表现超过了 {evaluation.percentile}% 的用户
        </p>
      </div>
      
      {/* 评价卡片 */}
      <div className={`rounded-lg p-4 border-2 ${levelStyle.bgColor} ${levelStyle.borderColor} mb-4`}>
        <h4 className={`font-semibold ${levelStyle.color} mb-2`}>
          📊 表现评价
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {evaluation.description}
        </p>
      </div>
      
      {/* 改进建议 */}
      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
        <h4 className="font-semibold text-blue-700 mb-2">
          💡 改进建议
        </h4>
        <p className="text-blue-800 leading-relaxed">
          {evaluation.suggestion}
        </p>
      </div>
      
      {/* 等级说明 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h5 className="font-medium text-gray-700 mb-2">等级说明：</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">🌱</span>
            <span className="text-gray-600">初学者</span>
          </div>
          <div className="flex items-center">
            <span className="text-orange-500 mr-1">📈</span>
            <span className="text-gray-600">低于平均</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-1">👍</span>
            <span className="text-gray-600">平均水平</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-1">⭐</span>
            <span className="text-gray-600">高于平均</span>
          </div>
          <div className="flex items-center">
            <span className="text-purple-500 mr-1">🏆</span>
            <span className="text-gray-600">优秀</span>
          </div>
          <div className="flex items-center">
            <span className="text-red-500 mr-1">🚀</span>
            <span className="text-gray-600">专家级</span>
          </div>
        </div>
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