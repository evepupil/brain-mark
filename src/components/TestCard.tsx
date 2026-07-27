import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TestType } from '../lib/types';
import { getBestScore } from '../lib/utils';

interface TestCardProps {
  testType: TestType;
}

const testCardMeta: Record<TestType, { group: string; duration: string; visualClass: string }> = {
  [TestType.REACTION]: { group: 'speed', duration: '30s', visualClass: 'visual-reaction' },
  [TestType.MEMORY]: { group: 'memory', duration: '2 min', visualClass: 'visual-number' },
  [TestType.VISUAL]: { group: 'memory', duration: '3 min', visualClass: 'visual-grid' },
  [TestType.TYPING]: { group: 'speed', duration: '1 min', visualClass: 'visual-type' },
  [TestType.SEQUENCE]: { group: 'memory', duration: '3 min', visualClass: 'visual-sequence' },
  [TestType.CHIMP]: { group: 'memory', duration: '3 min', visualClass: 'visual-chimp' },
  [TestType.AIM]: { group: 'speed', duration: '1 min', visualClass: 'visual-target' },
  [TestType.STROOP]: { group: 'attention', duration: '2 min', visualClass: 'visual-stroop' },
  [TestType.SCHULTE]: { group: 'attention', duration: '2 min', visualClass: 'visual-schulte' },
};

function formatBestScore(score: number, type: TestType): string {
  switch (type) {
    case TestType.REACTION:
      return `${score}ms`;
    case TestType.TYPING:
      return `${score} WPM`;
    case TestType.MEMORY:
      return `${score} digits`;
    case TestType.VISUAL:
    case TestType.SEQUENCE:
      return `Level ${score}`;
    default:
      return `${score}`;
  }
}

function TestVisual({ testType, visualClass }: Pick<TestCardProps, 'testType'> & { visualClass: string }) {
  if (testType === TestType.VISUAL || testType === TestType.SCHULTE) {
    return (
      <div className={visualClass} aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
      </div>
    );
  }

  if (testType === TestType.SEQUENCE || testType === TestType.CHIMP) {
    return (
      <div className={visualClass} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <i key={index}>{testType === TestType.CHIMP ? index + 1 : undefined}</i>)}
      </div>
    );
  }

  if (testType === TestType.MEMORY) {
    return <div className={visualClass} aria-hidden="true">739</div>;
  }

  if (testType === TestType.TYPING) {
    return <div className={visualClass} aria-hidden="true">type|</div>;
  }

  if (testType === TestType.STROOP) {
    return <div className={visualClass} aria-hidden="true">RED</div>;
  }

  return <div className={visualClass} aria-hidden="true" />;
}

export default function TestCard({ testType }: TestCardProps) {
  const { t, i18n } = useTranslation('common');
  const [bestScore, setBestScore] = useState<number | null>(null);
  const meta = testCardMeta[testType];
  const isEnglish = i18n.language.startsWith('en');

  useEffect(() => {
    const bestScoreRecord = getBestScore(testType);
    setBestScore(bestScoreRecord ? bestScoreRecord.score : null);
  }, [testType]);

  return (
    <Link href={`/test/${testType}`} className="test-card" data-group={meta.group}>
      <motion.div className="test-card__inner" whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }}>
        <div className="test-card__meta">
          <span>{meta.group.toUpperCase()}</span>
          <span>{isEnglish ? meta.duration : meta.duration.replace('min', '分钟').replace('s', '秒')}</span>
        </div>
        <div className="test-card__visual">
          <TestVisual testType={testType} visualClass={meta.visualClass} />
        </div>
        <h2>{t(`tests.${testType}.name`)}</h2>
        <p>{t(`tests.${testType}.description`)}</p>
        {bestScore !== null && (
          <span className="test-card__best">
            {isEnglish ? 'Best' : '最佳'}: {formatBestScore(bestScore, testType)}
          </span>
        )}
        <span className="text-link">
          {t('start')} <span aria-hidden="true">-&gt;</span>
        </span>
      </motion.div>
    </Link>
  );
}
