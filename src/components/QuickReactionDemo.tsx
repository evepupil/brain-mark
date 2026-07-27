import { useEffect, useRef, useState } from 'react';

type DemoState = 'idle' | 'waiting' | 'ready' | 'early' | 'result';

interface QuickReactionDemoProps {
  locale?: string;
  siteAverage?: number | null;
}

export default function QuickReactionDemo({ locale, siteAverage }: QuickReactionDemoProps) {
  const isEnglish = locale === 'en';
  const [state, setState] = useState<DemoState>('idle');
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const begin = () => {
    setState('waiting');
    timerRef.current = setTimeout(() => {
      startedAtRef.current = performance.now();
      setState('ready');
    }, 1200 + Math.random() * 1700);
  };

  const handleAction = () => {
    if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('early');
      return;
    }

    if (state === 'ready') {
      const score = Math.round(performance.now() - startedAtRef.current);
      setLastScore(score);
      setBestScore((current) => current === null ? score : Math.min(current, score));
      setState('result');
      return;
    }

    begin();
  };

  const content = {
    idle: {
      icon: '●',
      title: isEnglish ? 'Try it once' : '先试一次',
      description: isEnglish
        ? 'Start, wait for green, then click as quickly as possible.'
        : '点击开始，等待画面变绿后尽快按下按钮。',
      action: isEnglish ? 'Start quick test' : '开始快速测试',
    },
    waiting: {
      icon: '…',
      title: isEnglish ? 'Wait for green' : '等待绿色',
      description: isEnglish ? 'Do not click yet.' : '先别点击，颜色变化后再按。',
      action: isEnglish ? 'Waiting' : '等待中',
    },
    ready: {
      icon: '!',
      title: isEnglish ? 'Click now' : '现在点击',
      description: isEnglish ? 'As fast as you can.' : '越快越好。',
      action: isEnglish ? 'Click here' : '点击这里',
    },
    early: {
      icon: '×',
      title: isEnglish ? 'Too soon' : '太早了',
      description: isEnglish ? 'Wait until the panel turns green.' : '看到绿色后再点击。',
      action: isEnglish ? 'Try again' : '重新测试',
    },
    result: {
      icon: lastScore?.toString() ?? '—',
      title: lastScore === null ? '—' : `${lastScore} ms`,
      description: isEnglish
        ? 'Run the full test to record a complete result.'
        : '进入正式测试可以记录完整结果。',
      action: isEnglish ? 'Test again' : '再测一次',
    },
  }[state];

  return (
    <div className="reaction-demo">
      <div className="demo-top">
        <span>{isEnglish ? 'Quick try / Reaction time' : '快速体验 / 反应速度'}</span>
        <span className="demo-lights" aria-hidden="true"><span /><span /><span /></span>
      </div>
      <div className="demo-stage" data-state={state} aria-live="polite">
        <div>
          <div className="demo-stage__icon" aria-hidden="true">{content.icon}</div>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
          <button className="demo-start" type="button" onClick={handleAction}>{content.action}</button>
        </div>
      </div>
      <div className="demo-meta">
        <div><span>{isEnglish ? 'Last' : '本次'}</span><strong>{lastScore === null ? '—' : `${lastScore} ms`}</strong></div>
        <div><span>{isEnglish ? 'Best this visit' : '本次最佳'}</span><strong>{bestScore === null ? '—' : `${bestScore} ms`}</strong></div>
        <div><span>{isEnglish ? 'Site average' : '全站平均'}</span><strong>{siteAverage == null ? '—' : `${Math.round(siteAverage)} ms`}</strong></div>
      </div>
    </div>
  );
}
