(async () => {
    const response = await fetch('//5dd1ad4315bbc2001448d385.mockapi.io/api/items');
    const data = await response.json();

    const filtersOptionsEl = document.getElementById('filters-options');
    const contentEl = document.getElementById('content');
    const cartCounterEl = document.getElementById('order-cart-counter');
    const cartItems = {};
    const appliedFilters = [];
    const applyFiltersButton = document.getElementById('apply-filters');
    const addToCart = item => {
        if (cartItems[item.id]) {
            cartItems[item.id].quantity++;
        } else {
            cartItems[item.id] = item;
            cartItems[item.id].quantity = 1;
        }

        syncCart();
        syncItem(item.id);
    };
    const renderItems = items => {
        contentEl.innerHTML = '';
        items && items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.id = `item-${item.id}`;
            itemEl.className = 'item';
            const articleEl = document.createElement('div');
            articleEl.className = 'article';
            articleEl.innerText = item.name;
            itemEl.appendChild(articleEl);
            const imgEl = document.createElement('img');
            imgEl.src = item.image;
            imgEl.alt = item.name;
            itemEl.appendChild(imgEl);
            const buttonEl = document.createElement('button');
            buttonEl.className = 'primary';
            buttonCaptionEl = document.createElement('span');
            buttonCaptionEl.innerText = `$${(+item.price).toFixed(2)}`;
            buttonEl.appendChild(buttonCaptionEl);
            const buttonImg = document.createElement('img');
            buttonImg.src = 'img/cart.svg';
            buttonImg.alt = 'Add to cart';
            buttonEl.appendChild(buttonImg);
            buttonEl.addEventListener('click', () => addToCart(item));
            itemEl.appendChild(buttonEl);
            inCartEl = document.createElement('div');
            inCartEl.className = `in-cart${cartItems[item.id] && cartItems[item.id].quantity ? ' active' : ''}`;
            inCartEl.innerHTML = `
                <div>in cart <b>${cartItems[item.id] ? cartItems[item.id].quantity : 0}</b></div>
            `;
            itemEl.appendChild(inCartEl);
            contentEl.appendChild(itemEl);
        });
    };
    const syncCart = () => {
        let count = 0;
        Object.values(cartItems).forEach(item => {
            count += item.quantity;
        });
        cartCounterEl.innerText = count;
    };
    const syncItem = itemId => {
        const itemEl = document.getElementById(`item-${itemId}`);
        if (itemEl) {
            const quantity = cartItems[itemId] && cartItems[itemId].quantity || 0;
            const inCartEl = itemEl.querySelector('.in-cart');
            const inCartQuantityEl = itemEl.querySelector('.in-cart b');
            if (quantity) {
                inCartEl.className = inCartEl.className.replace('active', '') + ' active';
            } else {
                inCartEl.className = inCartEl.className.replace('active', '');
            }
            inCartQuantityEl.innerText = quantity;
        }
    };
    const filterItems = () => {
        if (!appliedFilters.length) {
            renderItems(data);
        } else {
            const filteredItems = data.filter(item => !!item.tags.filter(tag => appliedFilters.includes(tag)).length);
            renderItems(filteredItems);
        }
    };

    applyFiltersButton.addEventListener('click', () => {
        appliedFilters.length = 0;
        Array.from(filtersOptionsEl.querySelectorAll('input:checked')).forEach(el => {
            appliedFilters.push(el.getAttribute('data-tag'));
        });
        
        filterItems();
    });

    syncCart();
    filterItems();

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