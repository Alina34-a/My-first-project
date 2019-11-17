(async () => {
    const response = await fetch('//5dd1ad4315bbc2001448d385.mockapi.io/api/items');
    const data = await response.json();
    const contentEl = document.getElementById('content');

    if (contentEl) {
        contentEl.innerHTML = '';
        data.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item';
            const articleEl = document.createElement('div');
            articleEl.className = 'article';
            articleEl.innerText = item.name;
            itemEl.appendChild(articleEl);
            const imgEl = document.createElement('img');
            imgEl.src = 'img/magnet.jpg';
            imgEl.alt = item.name;
            itemEl.appendChild(imgEl);
            const buttonEl = document.createElement('button');
            buttonEl.className = 'primary';
            buttonCaptionEl = document.createElement('span');
            buttonCaptionEl.innerText = `$${item.id}.00`;
            buttonEl.appendChild(buttonCaptionEl);
            const buttonImg = document.createElement('img');
            buttonImg.src = 'img/cart.svg';
            buttonImg.alt = 'Add to cart';
            buttonEl.appendChild(buttonImg);
            itemEl.appendChild(buttonEl);
            contentEl.appendChild(itemEl);
        });
    }

    const menuButtonEl = document.getElementById('menu');
    const filtersEl = document.getElementById('filters');
    const toggleFilters = () => {
        if (filtersEl.className === 'active') {
            filtersEl.className = '';
        } else {
            filtersEl.className = 'active';
        }
    };
    const hideFilters = () => {
        filtersEl.className = '';
    };
    if (menuButtonEl) {
        menuButtonEl.addEventListener('click', toggleFilters);
    }
    window.addEventListener('resize', hideFilters);
    const filtersOverlay = document.getElementById('filters-overlay');
    if (filtersOverlay) {
        filtersOverlay.addEventListener('click', hideFilters);
    }
})();