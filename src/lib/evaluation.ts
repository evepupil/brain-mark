/**
 * 测试结果评价系统
 * 为各种测试提供等级评价和建议
 */

// 评价等级枚举
export enum EvaluationLevel {
  BEGINNER = 'beginner',
  BELOW_AVERAGE = 'below_average', 
  AVERAGE = 'average',
  ABOVE_AVERAGE = 'above_average',
  EXCELLENT = 'excellent',
  EXPERT = 'expert'
}

// 评价结果接口
export interface EvaluationResult {
  level: EvaluationLevel;
  score: number;
  percentile: number; // 百分位数 (0-100)
  title: string;
  description: string;
  suggestion: string;
  emoji: string;
  color: string;
}

// 等级阈值配置
interface LevelThresholds {
  [EvaluationLevel.BEGINNER]: number;
  [EvaluationLevel.BELOW_AVERAGE]: number;
  [EvaluationLevel.AVERAGE]: number;
  [EvaluationLevel.ABOVE_AVERAGE]: number;
  [EvaluationLevel.EXCELLENT]: number;
  [EvaluationLevel.EXPERT]: number;
}

// 反应速度测试阈值 (毫秒，越小越好)
const REACTION_THRESHOLDS: LevelThresholds = {
  [EvaluationLevel.EXPERT]: 180,
  [EvaluationLevel.EXCELLENT]: 220,
  [EvaluationLevel.ABOVE_AVERAGE]: 280,
  [EvaluationLevel.AVERAGE]: 350,
  [EvaluationLevel.BELOW_AVERAGE]: 450,
  [EvaluationLevel.BEGINNER]: Infinity
};

// 数字记忆测试阈值 (位数，越大越好)
const MEMORY_THRESHOLDS: LevelThresholds = {
  [EvaluationLevel.BEGINNER]: 3,
  [EvaluationLevel.BELOW_AVERAGE]: 5,
  [EvaluationLevel.AVERAGE]: 7,
  [EvaluationLevel.ABOVE_AVERAGE]: 9,
  [EvaluationLevel.EXCELLENT]: 12,
  [EvaluationLevel.EXPERT]: Infinity
};

// 视觉记忆测试阈值 (关卡，越大越好)
const VISUAL_THRESHOLDS: LevelThresholds = {
  [EvaluationLevel.BEGINNER]: 2,
  [EvaluationLevel.BELOW_AVERAGE]: 4,
  [EvaluationLevel.AVERAGE]: 6,
  [EvaluationLevel.ABOVE_AVERAGE]: 8,
  [EvaluationLevel.EXCELLENT]: 11,
  [EvaluationLevel.EXPERT]: Infinity
};

// 打字速度测试阈值 (WPM，越大越好)
const TYPING_THRESHOLDS: LevelThresholds = {
  [EvaluationLevel.BEGINNER]: 20,
  [EvaluationLevel.BELOW_AVERAGE]: 35,
  [EvaluationLevel.AVERAGE]: 50,
  [EvaluationLevel.ABOVE_AVERAGE]: 70,
  [EvaluationLevel.EXCELLENT]: 90,
  [EvaluationLevel.EXPERT]: Infinity
};

// 序列记忆测试阈值 (关卡，越大越好)
const SEQUENCE_THRESHOLDS: LevelThresholds = {
  [EvaluationLevel.BEGINNER]: 3,
  [EvaluationLevel.BELOW_AVERAGE]: 5,
  [EvaluationLevel.AVERAGE]: 7,
  [EvaluationLevel.ABOVE_AVERAGE]: 10,
  [EvaluationLevel.EXCELLENT]: 13,
  [EvaluationLevel.EXPERT]: Infinity
};

// 等级信息配置
const LEVEL_INFO = {
  [EvaluationLevel.BEGINNER]: {
    title: '初学者',
    emoji: '🌱',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  },
  [EvaluationLevel.BELOW_AVERAGE]: {
    title: '低于平均',
    emoji: '📈',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300'
  },
  [EvaluationLevel.AVERAGE]: {
    title: '平均水平',
    emoji: '👍',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  [EvaluationLevel.ABOVE_AVERAGE]: {
    title: '高于平均',
    emoji: '⭐',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  [EvaluationLevel.EXCELLENT]: {
    title: '优秀',
    emoji: '🏆',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  [EvaluationLevel.EXPERT]: {
    title: '专家级',
    emoji: '🚀',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  }
};

/**
 * 根据测试类型和分数评估用户水平
 * @param testType 测试类型
 * @param score 测试分数
 * @returns 评价结果
 */
export function evaluateScore(testType: string, score: number): EvaluationResult {
  let thresholds: LevelThresholds;
  let isHigherBetter = true;
  
  // 根据测试类型选择阈值
  switch (testType) {
    case 'reaction':
      thresholds = REACTION_THRESHOLDS;
      isHigherBetter = false; // 反应速度越小越好
      break;
    case 'memory':
      thresholds = MEMORY_THRESHOLDS;
      break;
    case 'visual':
      thresholds = VISUAL_THRESHOLDS;
      break;
    case 'typing':
      thresholds = TYPING_THRESHOLDS;
      break;
    case 'sequence':
      thresholds = SEQUENCE_THRESHOLDS;
      break;
    default:
      throw new Error(`未知的测试类型: ${testType}`);
  }
  
  // 确定等级
  const level = determineLevel(score, thresholds, isHigherBetter);
  
  // 计算百分位数
  const percentile = calculatePercentile(score, thresholds, isHigherBetter);
  
  // 获取等级信息
  const levelInfo = LEVEL_INFO[level];
  
  // 生成描述和建议
  const description = getDescription(testType, level, score);
  const suggestion = getSuggestion(testType, level);
  
  return {
    level,
    score,
    percentile,
    title: levelInfo.title,
    description,
    suggestion,
    emoji: levelInfo.emoji,
    color: levelInfo.color
  };
}

/**
 * 确定用户等级
 * @param score 分数
 * @param thresholds 阈值配置
 * @param isHigherBetter 是否分数越高越好
 * @returns 等级
 */
function determineLevel(
  score: number, 
  thresholds: LevelThresholds, 
  isHigherBetter: boolean
): EvaluationLevel {
  const levels = Object.keys(thresholds) as EvaluationLevel[];
  
  if (isHigherBetter) {
    // 分数越高越好的情况
    for (const level of levels) {
      if (score >= thresholds[level]) {
        return level;
      }
    }
    return EvaluationLevel.BEGINNER;
  } else {
    // 分数越低越好的情况（如反应速度）
    for (const level of levels) {
      if (score <= thresholds[level]) {
        return level;
      }
    }
    return EvaluationLevel.BEGINNER;
  }
}

/**
 * 计算百分位数
 * @param score 分数
 * @param thresholds 阈值配置
 * @param isHigherBetter 是否分数越高越好
 * @returns 百分位数 (0-100)
 */
function calculatePercentile(
  score: number, 
  thresholds: LevelThresholds, 
  isHigherBetter: boolean
): number {
  const levels = Object.keys(thresholds) as EvaluationLevel[];
  const totalLevels = levels.length;
  
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const threshold = thresholds[level];
    
    if (isHigherBetter) {
      if (score >= threshold) {
        // 在当前等级内的位置
        const nextThreshold = i > 0 ? thresholds[levels[i - 1]] : Infinity;
        const levelProgress = calculateLevelProgress(score, threshold, nextThreshold, true);
        return Math.round(((totalLevels - i - 1) + levelProgress) / totalLevels * 100);
      }
    } else {
      if (score <= threshold) {
        const nextThreshold = i > 0 ? thresholds[levels[i - 1]] : 0;
        const levelProgress = calculateLevelProgress(score, threshold, nextThreshold, false);
        return Math.round(((totalLevels - i - 1) + levelProgress) / totalLevels * 100);
      }
    }
  }
  
  return isHigherBetter ? 0 : 100;
}

/**
 * 计算在当前等级内的进度
 * @param score 分数
 * @param currentThreshold 当前等级阈值
 * @param nextThreshold 下一等级阈值
 * @param isHigherBetter 是否分数越高越好
 * @returns 等级内进度 (0-1)
 */
function calculateLevelProgress(
  score: number, 
  currentThreshold: number, 
  nextThreshold: number, 
  isHigherBetter: boolean
): number {
  if (nextThreshold === Infinity || nextThreshold === 0) {
    return 0.5; // 最高或最低等级，返回中间值
  }
  
  if (isHigherBetter) {
    const range = nextThreshold - currentThreshold;
    const progress = (score - currentThreshold) / range;
    return Math.max(0, Math.min(1, progress));
  } else {
    const range = currentThreshold - nextThreshold;
    const progress = (currentThreshold - score) / range;
    return Math.max(0, Math.min(1, progress));
  }
}

/**
 * 获取等级描述
 * @param testType 测试类型
 * @param level 等级
 * @param score 分数
 * @returns 描述文本
 */
function getDescription(testType: string, level: EvaluationLevel, score: number): string {
  const descriptions = {
    reaction: {
      [EvaluationLevel.EXPERT]: `${score}ms的反应速度达到了专家级水平！你的神经反应极其敏锐。`,
      [EvaluationLevel.EXCELLENT]: `${score}ms是非常优秀的反应速度，超越了大多数人。`,
      [EvaluationLevel.ABOVE_AVERAGE]: `${score}ms的反应速度高于平均水平，表现不错。`,
      [EvaluationLevel.AVERAGE]: `${score}ms是正常的反应速度，处于平均水平。`,
      [EvaluationLevel.BELOW_AVERAGE]: `${score}ms的反应速度略低于平均水平。`,
      [EvaluationLevel.BEGINNER]: `${score}ms的反应速度还有很大提升空间。`
    },
    memory: {
      [EvaluationLevel.EXPERT]: `能记住${score}位数字，你拥有超凡的记忆能力！`,
      [EvaluationLevel.EXCELLENT]: `记住${score}位数字是优秀的表现，记忆力很强。`,
      [EvaluationLevel.ABOVE_AVERAGE]: `${score}位数字的记忆能力高于平均水平。`,
      [EvaluationLevel.AVERAGE]: `记住${score}位数字是正常的记忆水平。`,
      [EvaluationLevel.BELOW_AVERAGE]: `${score}位数字的记忆能力还可以提升。`,
      [EvaluationLevel.BEGINNER]: `记住${score}位数字是个不错的开始。`
    },
    visual: {
      [EvaluationLevel.EXPERT]: `通过${score}关视觉记忆测试，你的空间记忆能力超群！`,
      [EvaluationLevel.EXCELLENT]: `${score}关是优秀的视觉记忆表现。`,
      [EvaluationLevel.ABOVE_AVERAGE]: `通过${score}关，视觉记忆能力高于平均。`,
      [EvaluationLevel.AVERAGE]: `${score}关是正常的视觉记忆水平。`,
      [EvaluationLevel.BELOW_AVERAGE]: `${score}关的表现还有提升空间。`,
      [EvaluationLevel.BEGINNER]: `${score}关是个良好的开始。`
    },
    typing: {
      [EvaluationLevel.EXPERT]: `${score} WPM的打字速度达到专家级！`,
      [EvaluationLevel.EXCELLENT]: `${score} WPM是优秀的打字速度。`,
      [EvaluationLevel.ABOVE_AVERAGE]: `${score} WPM高于平均打字速度。`,
      [EvaluationLevel.AVERAGE]: `${score} WPM是正常的打字速度。`,
      [EvaluationLevel.BELOW_AVERAGE]: `${score} WPM还有提升空间。`,
      [EvaluationLevel.BEGINNER]: `${score} WPM是个不错的开始。`
    },
    sequence: {
      [EvaluationLevel.EXPERT]: `通过${score}关序列记忆，你的工作记忆能力超强！`,
      [EvaluationLevel.EXCELLENT]: `${score}关是优秀的序列记忆表现。`,
      [EvaluationLevel.ABOVE_AVERAGE]: `通过${score}关，序列记忆能力不错。`,
      [EvaluationLevel.AVERAGE]: `${score}关是正常的序列记忆水平。`,
      [EvaluationLevel.BELOW_AVERAGE]: `${score}关的表现可以继续提升。`,
      [EvaluationLevel.BEGINNER]: `${score}关是个好的开始。`
    }
  };
  
  return descriptions[testType as keyof typeof descriptions]?.[level] || '表现不错！';
}

/**
 * 获取改进建议
 * @param testType 测试类型
 * @param level 等级
 * @returns 建议文本
 */
function getSuggestion(testType: string, level: EvaluationLevel): string {
  const suggestions = {
    reaction: {
      [EvaluationLevel.EXPERT]: '保持这种敏锐的反应能力，可以尝试更具挑战性的反应训练。',
      [EvaluationLevel.EXCELLENT]: '继续保持，可以通过游戏或运动来维持反应速度。',
      [EvaluationLevel.ABOVE_AVERAGE]: '很好的表现！定期练习可以进一步提升。',
      [EvaluationLevel.AVERAGE]: '可以通过反应训练游戏来提升速度。',
      [EvaluationLevel.BELOW_AVERAGE]: '建议多做反应训练，减少咖啡因摄入，保证充足睡眠。',
      [EvaluationLevel.BEGINNER]: '多练习反应训练，注意休息，避免疲劳状态下测试。'
    },
    memory: {
      [EvaluationLevel.EXPERT]: '惊人的记忆力！可以尝试更复杂的记忆挑战。',
      [EvaluationLevel.EXCELLENT]: '优秀的记忆能力，继续保持这种水平。',
      [EvaluationLevel.ABOVE_AVERAGE]: '不错的记忆力，可以尝试记忆宫殿等技巧。',
      [EvaluationLevel.AVERAGE]: '可以通过分组记忆、重复练习来提升。',
      [EvaluationLevel.BELOW_AVERAGE]: '建议使用记忆技巧，如分块记忆、联想记忆。',
      [EvaluationLevel.BEGINNER]: '从短数字开始练习，逐步增加长度，使用记忆技巧。'
    },
    visual: {
      [EvaluationLevel.EXPERT]: '卓越的空间记忆能力！可以挑战更复杂的视觉任务。',
      [EvaluationLevel.EXCELLENT]: '很强的视觉记忆，继续保持。',
      [EvaluationLevel.ABOVE_AVERAGE]: '良好的视觉记忆，可以通过空间游戏继续提升。',
      [EvaluationLevel.AVERAGE]: '可以通过观察训练、空间游戏来提升。',
      [EvaluationLevel.BELOW_AVERAGE]: '建议多做视觉注意力训练，提高观察能力。',
      [EvaluationLevel.BEGINNER]: '从简单的视觉模式开始练习，逐步提高复杂度。'
    },
    typing: {
      [EvaluationLevel.EXPERT]: '专业级打字速度！可以考虑参加打字比赛。',
      [EvaluationLevel.EXCELLENT]: '优秀的打字技能，保持这种水平。',
      [EvaluationLevel.ABOVE_AVERAGE]: '不错的打字速度，继续练习可以更快。',
      [EvaluationLevel.AVERAGE]: '可以通过打字练习软件提升速度和准确性。',
      [EvaluationLevel.BELOW_AVERAGE]: '建议学习正确的手指位置，多做打字练习。',
      [EvaluationLevel.BEGINNER]: '从基础指法开始，先追求准确性再提升速度。'
    },
    sequence: {
      [EvaluationLevel.EXPERT]: '超强的工作记忆！可以尝试更复杂的序列任务。',
      [EvaluationLevel.EXCELLENT]: '优秀的序列记忆能力，继续保持。',
      [EvaluationLevel.ABOVE_AVERAGE]: '良好的工作记忆，可以通过N-back训练提升。',
      [EvaluationLevel.AVERAGE]: '可以通过序列记忆游戏来提升工作记忆。',
      [EvaluationLevel.BELOW_AVERAGE]: '建议多做工作记忆训练，提高注意力集中度。',
      [EvaluationLevel.BEGINNER]: '从短序列开始练习，逐步增加长度和复杂度。'
    }
  };
  
  return suggestions[testType as keyof typeof suggestions]?.[level] || '继续练习，你会越来越好！';
}

/**
 * 获取等级样式信息
 * @param level 等级
 * @returns 样式信息
 */
export function getLevelStyle(level: EvaluationLevel) {
  return LEVEL_INFO[level];
}