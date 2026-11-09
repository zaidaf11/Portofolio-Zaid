document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');

   // 1. Skrip muter musik
    function updateMusicUI(isPlaying) {
        if (!btn) return;
        if (isPlaying) {
            if (musicIcon) musicIcon.innerText = '⏸';
            if (musicText) musicText.innerText = 'Jeda Musik';
            btn.classList.add('playing');
        } else {
            if (musicIcon) musicIcon.innerText = '▶';
            if (musicText) musicText.innerText = 'Putar Musik';
            btn.classList.remove('playing');
        }
    }

    // Sync status jika reload darurat terjadi
    const isPlaying = localStorage.getItem('musicPlaying') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicTime') || 0);

    if (savedTime > 0 && audio.paused) {
        audio.currentTime = savedTime;
    }

    if (isPlaying && audio.paused) {
        audio.play().then(() => updateMusicUI(true)).catch(() => updateMusicUI(false));
    }

    if (audio) {
        audio.addEventListener('timeupdate', () => {
            if (!audio.paused) {
                localStorage.setItem('musicTime', audio.currentTime);
            }
        });
    }

    if (btn) {
        btn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().then(() => {
                    localStorage.setItem('musicPlaying', 'true');
                    updateMusicUI(true);
                }).catch(err => console.log("Gagal memutar audio:", err));
            } else {
                audio.pause();
                localStorage.setItem('musicPlaying', 'false');
                updateMusicUI(false);
            }
        });
    }

    // 2. Navigasi smooth
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

        e.preventDefault();
        loadPage(href);
    });

    async function loadPage(url, pushHistory = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Gagal memuat halaman");

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');
            if (newMain && currentMain) {
                currentMain.innerHTML = newMain.innerHTML;
                currentMain.className = newMain.className;
            }

            const newNavs = doc.querySelectorAll('nav a');
            const currentNavs = document.querySelectorAll('nav a');
            currentNavs.forEach((nav, idx) => {
                if (newNavs[idx]) nav.className = newNavs[idx].className;
            });

            document.title = doc.title;

            if (pushHistory) {
                history.pushState({ url }, '', url);
            }

            window.scrollTo(0, 0);

        } catch (error) {
            window.location.href = url;
        }
    }

    window.addEventListener('popstate', (e) => {
        const targetUrl = e.state?.url || window.location.pathname;
        loadPage(targetUrl, false);
    });
});