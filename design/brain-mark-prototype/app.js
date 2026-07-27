(() => {
  const menuButton = document.querySelector('.menu-button');
  const mainNav = document.querySelector('.main-nav');
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  document.querySelectorAll('[data-toast]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.tagName === 'A') event.preventDefault();
      showToast(button.dataset.toast);
    });
  });

  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-group]');
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const selected = filter.dataset.filter;
      filters.forEach((item) => item.setAttribute('aria-pressed', String(item === filter)));
      cards.forEach((card) => {
        card.hidden = selected !== 'all' && card.dataset.group !== selected;
      });
    });
  });

  const demo = document.querySelector('[data-reaction-demo]');
  if (demo) {
    const button = demo.querySelector('.demo-start');
    const icon = demo.querySelector('.demo-stage__icon');
    const title = demo.querySelector('h2');
    const copy = demo.querySelector('.demo-stage p');
    const last = document.querySelector('[data-demo-last]');
    const best = document.querySelector('[data-demo-best]');
    let state = 'idle';
    let timer;
    let startedAt = 0;
    let bestValue = null;

    const begin = () => {
      state = 'waiting';
      demo.dataset.state = 'waiting';
      icon.textContent = '...';
      title.textContent = '等待绿色';
      copy.textContent = '先别点击。颜色变化后尽快按下。';
      button.textContent = '等待中';
      timer = window.setTimeout(() => {
        state = 'ready';
        demo.dataset.state = 'ready';
        icon.textContent = '!';
        title.textContent = '现在点击';
        copy.textContent = '越快越好。';
        button.textContent = '点击这里';
        startedAt = performance.now();
      }, 1200 + Math.random() * 1700);
    };

    button.addEventListener('click', () => {
      if (state === 'waiting') {
        window.clearTimeout(timer);
        state = 'early';
        demo.dataset.state = 'early';
        icon.textContent = '×';
        title.textContent = '太早了';
        copy.textContent = '看到绿色后再点击。';
        button.textContent = '重新测试';
        return;
      }
      if (state === 'ready') {
        const value = Math.round(performance.now() - startedAt);
        state = 'result';
        demo.dataset.state = 'result';
        icon.textContent = value;
        title.textContent = value + ' ms';
        copy.textContent = value < 250 ? '反应很快。进入正式测试可记录完整结果。' : '完成了。再测几次会更接近真实水平。';
        button.textContent = '再测一次';
        last.textContent = value + ' ms';
        bestValue = bestValue === null ? value : Math.min(bestValue, value);
        best.textContent = bestValue + ' ms';
        return;
      }
      begin();
    });
  }

  const rankTabs = document.querySelectorAll('[data-rank-tab]');
  const rankRows = document.querySelector('[data-rank-rows]');
  const ranking = {
    reaction: [
      ['anon·3F9A', '154 ms', '2 分钟前'],
      ['anon·7C21', '171 ms', '5 分钟前'],
      ['anon·B05E', '183 ms', '8 分钟前'],
      ['anon·9AD0', '196 ms', '12 分钟前'],
      ['anon·4471', '204 ms', '17 分钟前']
    ],
    number: [
      ['anon·A1F0', '12 位', '4 分钟前'],
      ['anon·55BC', '11 位', '9 分钟前'],
      ['anon·D77E', '10 位', '15 分钟前'],
      ['anon·9AD0', '9 位', '21 分钟前'],
      ['anon·C023', '9 位', '28 分钟前']
    ],
    typing: [
      ['anon·1E9A', '98 WPM', '3 分钟前'],
      ['anon·7C21', '87 WPM', '7 分钟前'],
      ['anon·9AD0', '72 WPM', '14 分钟前'],
      ['anon·B05E', '68 WPM', '19 分钟前'],
      ['anon·4471', '61 WPM', '26 分钟前']
    ]
  };

  const renderRanking = (type) => {
    if (!rankRows || !ranking[type]) return;
    rankRows.innerHTML = ranking[type].map((row, index) => {
      const medalClass = index === 0 ? ' rank-medal--gold' : index === 1 ? ' rank-medal--silver' : index === 2 ? ' rank-medal--bronze' : '';
      return '<tr><td><span class="rank-medal' + medalClass + '">' + (index + 1) + '</span></td><td>' + row[0] + '</td><td>' + row[2] + '</td><td><strong>' + row[1] + '</strong></td></tr>';
    }).join('');
  };

  rankTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      rankTabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      renderRanking(tab.dataset.rankTab);
    });
  });
  if (rankTabs.length) renderRanking('reaction');

  const detailTitle = document.querySelector('[data-detail-title]');
  if (detailTitle) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'reaction';
    const details = {
      reaction: ['反应速度测试', '看到绿色后立即点击，测量视觉刺激到操作之间的反应时间。', '约 30 秒', '⚡'],
      number: ['数字记忆测试', '短暂记住一串数字，再按原顺序完整输入。', '约 2 分钟', '739'],
      visual: ['视觉记忆测试', '记住网格中亮起的方块，并准确复现位置。', '约 3 分钟', '▦'],
      typing: ['打字速度测试', '准确输入给定文本，计算每分钟输入字数。', '约 1 分钟', 'Aa'],
      sequence: ['序列记忆测试', '观察按钮亮起顺序，并按相同顺序复现。', '约 3 分钟', '1·2'],
      chimp: ['黑猩猩测试', '数字被遮住后，按从小到大的顺序点击位置。', '约 3 分钟', '1 2'],
      aim: ['瞄准测试', '尽快点击连续出现的目标，测量手眼协调能力。', '约 1 分钟', '⌖'],
      stroop: ['斯特鲁普测试', '忽略文字含义，快速选择文字实际显示的颜色。', '约 2 分钟', '红'],
      schulte: ['舒尔特方格', '按照数字顺序点击网格，测试注意力与视觉搜索速度。', '约 2 分钟', '1—9']
    };
    const detail = details[type] || details.reaction;
    document.title = detail[0] + ' - Brain Mark 原型';
    detailTitle.textContent = detail[0];
    const detailCopy = document.querySelector('[data-detail-copy]');
    const detailTime = document.querySelector('[data-detail-time]');
    const detailIcon = document.querySelector('[data-detail-icon]');
    if (detailCopy) detailCopy.textContent = detail[1];
    if (detailTime) detailTime.textContent = detail[2];
    if (detailIcon) detailIcon.textContent = detail[3];
  }
})();
