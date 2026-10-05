document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadComponents();
        setupMenuButton();
        highlightCurrentPage();
        setupZhTooltips();
        setupTravelGallery();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
});

const KNOWN_PAGES = ['index.html', 'research.html', 'coding.html', 'notes.html', 'life.html'];

// Top-level pages live under /zh/. Deeper pages (e.g. project detail pages) keep their
// Chinese translation as a "<name>_zh.html" sibling right next to the English original.
function getLanguageInfo() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const isZhSite = segments.length > 0 && segments[0].toLowerCase() === 'zh';
    let fileName = isZhSite ? (segments[1] || 'index.html') : (segments[segments.length - 1] || 'index.html');
    if (!fileName.toLowerCase().endsWith('.html')) {
        fileName = 'index.html';
    }
    const isZhDeepPage = !isZhSite && fileName.toLowerCase().endsWith('_zh.html');
    const isZh = isZhSite || isZhDeepPage;
    return { isZh, isZhSite, isZhDeepPage, fileName };
}

function setFavicon(href) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.type = 'image/jpeg';
    link.href = href;
}

function getComponentPath() {
    // Get the current path segments
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // If we're in a subdirectory (like /Projects/), we need to go back up
    const depth = segments.length;
    const componentPath = depth > 0 ? '../'.repeat(depth) + 'Components/' : './Components/';
    
    console.log('Current path:', path);
    console.log('Path segments:', segments);
    console.log('Directory depth:', depth);
    console.log('Component path:', componentPath);
    
    return componentPath;
}

function fixNavLinks() {
    const { isZh } = getLanguageInfo();
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        let href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Keep in-language navigation inside /zh/ once we're on a Chinese page
            if (isZh && link.hasAttribute('data-section') && !href.startsWith('/zh/')) {
                href = '/zh' + href;
            }
            // Remove the leading slash and adjust path based on current depth
            const newHref = getComponentPath() + '..' + href;
            link.href = newHref;
        }
    });
}

function translateChrome() {
    const { isZh } = getLanguageInfo();
    if (!isZh) return;

    const navLabels = {
        home: '首页',
        research: '科研',
        coding: '编程',
        notes: '笔记与绘画',
        life: '烹饪与旅行'
    };
    document.querySelectorAll('.nav-links a[data-section]').forEach(link => {
        const label = navLabels[link.getAttribute('data-section')];
        if (label) {
            link.textContent = label;
        }
    });
    const cvLink = document.querySelector('.nav-links a:not([data-section])');
    if (cvLink) {
        cvLink.textContent = '下载简历';
    }

    document.querySelectorAll('.single-footer-widget h6').forEach(h6 => {
        const text = h6.textContent.trim();
        if (text === 'About Me') h6.textContent = '关于我';
        if (text === 'Follow Me') h6.textContent = '关注我';
    });
    const footerText = document.querySelector('.footer-text');
    if (footerText) {
        footerText.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent
                    .replace('Copyright ©', '版权所有 ©')
                    .replace('All rights reserved', '保留所有权利');
            }
        });
    }
}

function setupLanguageSwitch() {
    const logoImg = document.getElementById('header-logo');
    if (!logoImg) return;
    const switchTarget = logoImg.closest('.logo') || logoImg;

    switchTarget.style.cursor = 'pointer';
    switchTarget.title = 'Click to switch language / 点击切换语言';

    switchTarget.addEventListener('click', function() {
        const { isZh, isZhSite, fileName } = getLanguageInfo();
        let destination;

        if (KNOWN_PAGES.includes(fileName)) {
            // Top-level site page: toggle between root and /zh/
            destination = isZhSite ? '/' + fileName : '/zh/' + fileName;
        } else if (isZh) {
            // Deep Chinese page (e.g. Projects/.../Foo_zh.html) -> same-folder English original
            destination = fileName.replace(/_zh\.html$/i, '.html');
        } else if (fileName.toLowerCase().endsWith('.html')) {
            // Deep English page -> same-folder "_zh" sibling
            destination = fileName.replace(/\.html$/i, '_zh.html');
        } else {
            return;
        }

        const message = isZh
            ? 'Switch to the English version of this page?\n切换到英文版页面？'
            : 'Switch to the Chinese version of this page?\n切换到中文版页面？';

        if (window.confirm(message)) {
            window.location.href = destination;
        }
    });
}

// Lets .zh-tip elements show a translation tooltip on hover (PC) and on tap (touch),
// since touch devices have no hover state.
function setupZhTooltips() {
    if (document.body.dataset.zhTipInit) return;
    document.body.dataset.zhTipInit = 'true';

    document.addEventListener('click', function(e) {
        const tip = e.target.closest('.zh-tip');
        document.querySelectorAll('.zh-tip.zh-tip-active').forEach(el => {
            if (el !== tip) el.classList.remove('zh-tip-active');
        });
        if (tip) {
            tip.classList.toggle('zh-tip-active');
            e.stopPropagation();
        }
    });
}

async function loadComponents() {
    try {
        const componentPath = getComponentPath();
        
        // Load header
        const headerResponse = await fetch(componentPath + 'header.html');
        if (!headerResponse.ok) {
            throw new Error(`Header fetch failed: ${headerResponse.status}`);
        }
        const headerHtml = await headerResponse.text();
        
        // Load footer
        const footerResponse = await fetch(componentPath + 'footer.html');
        if (!footerResponse.ok) {
            throw new Error(`Footer fetch failed: ${footerResponse.status}`);
        }
        const footerHtml = await footerResponse.text();
        
        // Insert components
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        document.body.insertAdjacentHTML('beforeend', footerHtml);
        
        // Set logo path
        const logoImg = document.getElementById('header-logo');
        if (logoImg) {
            logoImg.src = componentPath + 'logo.jpg';
        }

        // Use the same logo as the browser tab favicon
        setFavicon(componentPath + 'logo.jpg');

        // Fix navigation links
        fixNavLinks();

        // Translate chrome (nav/footer) and wire up the logo language switch
        translateChrome();
        setupLanguageSwitch();

    } catch (error) {
        console.error('Error loading components:', error);
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = 'background: #ffebee; color: #c62828; padding: 10px; margin: 10px; border-radius: 4px;';
        errorMessage.innerHTML = `
            <p><strong>Error loading page components</strong></p>
            <p>Current path: ${window.location.pathname}</p>
            <p>Component path: ${getComponentPath()}</p>
            <p>Error details: ${error.message}</p>
        `;
        document.body.insertAdjacentElement('afterbegin', errorMessage);
    }
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        link.style.fontWeight = 'normal';
        
        if ((currentPath.includes(section) && section !== 'home') || 
            (section === 'home' && (currentPath.endsWith('index.html') || 
             currentPath.endsWith('/')))) {
            link.style.fontWeight = 'bold';
        }
    });
}

function setupMenuButton() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

const TRAVEL_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];

function isTravelVideo(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return TRAVEL_VIDEO_EXTENSIONS.includes(ext);
}

// `displaySrc` is what gets shown in the grid (a small thumbnail for images;
// videos have no thumbnail so they fall back to the full file with
// preload="metadata" so only a single frame downloads, not the whole video).
function createTravelMediaEl(displaySrc, className) {
    if (isTravelVideo(displaySrc)) {
        const video = document.createElement('video');
        video.src = displaySrc;
        video.className = className;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = true;
        video.preload = 'metadata';
        return video;
    }
    const img = document.createElement('img');
    img.src = displaySrc;
    img.loading = 'lazy';
    img.className = className;
    return img;
}

// Builds the foldable travel cards on the Life page from `travelPlaces`
// (defined in Life/travel-data.js). Only one card can be open at a time:
// opening a card folds whichever one was previously open.
// Covers always stay in one fixed row; clicking one swaps the shared content
// area below to show just that place's pictures, without moving any cover.
function setupTravelGallery() {
    const grid = document.getElementById('travel-grid');
    if (!grid || typeof travelPlaces === 'undefined') return;

    const { isZh } = getLanguageInfo();
    const segments = window.location.pathname.split('/').filter(Boolean);
    const isZhSite = segments.length > 0 && segments[0].toLowerCase() === 'zh';
    const prefix = isZhSite ? '../' : './';
    const basePath = prefix + 'Life/Travels/';
    // Pre-shrunk copies (see Life/Travels_thumbs) used for on-page display so
    // unfolding a place doesn't pull down dozens of multi-MB originals at once.
    // Videos have no thumbnail and always come from basePath.
    const thumbBasePath = prefix + 'Life/Travels_thumbs/';

    function fullUrl(folder, file) {
        return basePath + encodeURI(folder) + '/' + encodeURI(file);
    }

    function displayUrl(folder, file) {
        if (isTravelVideo(file)) return fullUrl(folder, file);
        return thumbBasePath + encodeURI(folder) + '/' + encodeURI(file);
    }

    const coversRow = document.createElement('div');
    coversRow.className = 'travel-covers';
    const content = document.createElement('div');
    content.className = 'travel-content';
    grid.appendChild(coversRow);
    grid.appendChild(content);

    let activeCover = null;
    let activeFolder = null;

    function closeContent() {
        content.style.maxHeight = '0px';
        if (activeCover) activeCover.classList.remove('active');
        activeCover = null;
        activeFolder = null;
    }

    function openContent(place, coverEl) {
        if (activeCover) activeCover.classList.remove('active');
        activeCover = coverEl;
        activeFolder = place.folder;
        coverEl.classList.add('active');

        content.innerHTML = '';
        const thumbGrid = document.createElement('div');
        thumbGrid.className = 'travel-thumb-grid';
        place.items.forEach(file => {
            const link = document.createElement('a');
            link.href = fullUrl(place.folder, file);
            link.target = '_blank';
            link.className = 'travel-thumb';
            link.appendChild(createTravelMediaEl(displayUrl(place.folder, file), 'travel-thumb-media'));
            thumbGrid.appendChild(link);
        });
        content.appendChild(thumbGrid);

        content.style.maxHeight = content.scrollHeight + 'px';
        // Media loads asynchronously; grow to fit as each item finishes loading.
        content.querySelectorAll('img, video').forEach(el => {
            const grow = () => {
                if (activeFolder === place.folder) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            };
            el.addEventListener('load', grow);
            el.addEventListener('loadedmetadata', grow);
        });
    }

    travelPlaces.forEach(place => {
        const cover = document.createElement('div');
        cover.className = 'travel-cover';
        cover.appendChild(createTravelMediaEl(displayUrl(place.folder, place.cover), 'travel-cover-media'));
        const name = document.createElement('span');
        name.className = 'travel-name';
        name.textContent = isZh ? (place.nameZh || place.nameEn) : place.nameEn;
        cover.appendChild(name);

        cover.addEventListener('click', () => {
            if (activeFolder === place.folder) {
                closeContent();
            } else {
                openContent(place, cover);
            }
        });

        coversRow.appendChild(cover);
    });

    window.addEventListener('resize', () => {
        if (activeFolder) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
}