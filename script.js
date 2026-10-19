document.addEventListener('DOMContentLoaded', () => {
  // 1. 스크롤 시 상단 네비게이션 그림자 효과
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. 모바일 메뉴 토글
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // 3. 설교 목록 클릭 시 대표 설교 카드 전환
  const sermonList = document.getElementById('sermonList');
  const featuredThumbLink = document.getElementById('featuredThumbLink');
  const featuredThumbImg = document.getElementById('featuredThumbImg');
  const featuredDate = document.getElementById('featuredDate');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredWatchBtn = document.getElementById('featuredWatchBtn');

  function bindSermonItemClicks() {
    if (!sermonList) return;
    const items = sermonList.querySelectorAll('.sermon-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.sermon-direct-link')) return;

        const videoId = item.getAttribute('data-video-id');
        const title = item.getAttribute('data-title');
        const date = item.getAttribute('data-date');
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

        items.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');

        featuredThumbLink.href = watchUrl;
        featuredWatchBtn.href = watchUrl;
        featuredThumbImg.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        featuredTitle.textContent = title;
        featuredDate.textContent = date;
      });
    });
  }

  bindSermonItemClicks();

  // 4. 담없는교회 유튜브 채널(UCme7S3f0rveTP2k12YRatiA) 최신 영상 자동 동기화 (실패 시 기본 목록 유지)
  const CHANNEL_ID = 'UCme7S3f0rveTP2k12YRatiA';
  const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);

  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data || data.status !== 'ok' || !Array.isArray(data.items) || data.items.length === 0) {
        return;
      }

      const topVideos = data.items.slice(0, 4).map((item) => {
        const guidParts = (item.guid || '').split(':');
        const videoId = guidParts[guidParts.length - 1] || '';
        const pubDate = item.pubDate ? item.pubDate.slice(0, 10).replace(/-/g, '. ') : '';
        return {
          videoId,
          title: item.title,
          date: pubDate,
          link: item.link || `https://www.youtube.com/watch?v=${videoId}`,
        };
      }).filter((v) => v.videoId);

      if (topVideos.length === 0) return;

      // 첫 번째(최신) 설교로 대표 영역 및 상단 요약 업데이트
      const first = topVideos[0];
      featuredThumbLink.href = first.link;
      featuredWatchBtn.href = first.link;
      featuredThumbImg.src = `https://i.ytimg.com/vi/${first.videoId}/hqdefault.jpg`;
      featuredTitle.textContent = first.title;
      featuredDate.textContent = `${first.date} 업로드`;

      const quickSermonTitle = document.getElementById('quickSermonTitle');
      if (quickSermonTitle) {
        quickSermonTitle.textContent = first.title;
      }

      // 목록 업데이트
      sermonList.innerHTML = topVideos
        .map(
          (v, idx) => `
          <div class="sermon-item ${idx === 0 ? 'active' : ''}" data-video-id="${v.videoId}" data-title="${v.title.replace(/"/g, '&quot;')}" data-date="${v.date} 업로드">
            <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg" alt="${v.title.replace(/"/g, '&quot;')}" />
            <div class="sermon-item-text">
              <span class="sermon-item-date">${v.date}</span>
              <h5>${v.title}</h5>
              <a href="${v.link}" target="_blank" rel="noopener noreferrer" class="sermon-direct-link">유튜브 바로가기 ↗</a>
            </div>
          </div>
        `
        )
        .join('');

      bindSermonItemClicks();
    })
    .catch(() => {
      // 오프라인이거나 API 제한 시 HTML에 내장된 최신 설교 목록을 그대로 사용합니다.
    });

  // 5. 온라인 새가족 사전 방문 신청 폼 처리
  const newcomerForm = document.getElementById('newcomerForm');
  const formFeedback = document.getElementById('formFeedback');

  newcomerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const service = document.getElementById('serviceSelect').value;

    formFeedback.textContent = `✓ ${name}님, [${service}] 사전 방문 신청이 접수되었습니다. 교회에서 곧 안내드리겠습니다!`;
    newcomerForm.reset();
  });
});
