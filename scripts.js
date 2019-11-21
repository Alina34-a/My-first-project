(async () => {
    const [response, filtersResponse] = await Promise.all([
        fetch('//5dd1ad4315bbc2001448d385.mockapi.io/api/items'),
        fetch('//5dd1ad4315bbc2001448d385.mockapi.io/api/filters')
    ]);
    const [data, filters] = await Promise.all([
        response.json(),
        filtersResponse.json()
    ]);

    const filtersOptionsEl = document.getElementById('filters-options');
    const contentEl = document.getElementById('content');
    const cartCounterEl = document.getElementById('order-cart-counter');
    const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : {};
    const appliedFilters = localStorage.getItem('filters') ? JSON.parse(localStorage.getItem('filters')) : [];
    const applyFiltersButton = document.getElementById('apply-filters');

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
                <div class="remove-from-cart" data-item-id="${item.id}">del</div>
            `;
            itemEl.appendChild(inCartEl);
            contentEl.appendChild(itemEl);
        });

        const itemDelButtons = document.querySelectorAll('.in-cart .remove-from-cart');
        itemDelButtons && Array.from(itemDelButtons).map(el => {
            el.addEventListener('click', () => {
                removeFromCart(+el.getAttribute('data-item-id'));
            })
        });
    };
    const syncCart = () => {
        cartCounterEl.innerText = Object.values(cartItems).reduce((prevValue, currentValue) => {
            return prevValue + currentValue.quantity;
        }, 0);
    };
    const syncLocalStorage = () => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('filters', JSON.stringify(appliedFilters));
    };
    const syncItem = itemId => {
        const itemEl = document.getElementById(`item-${itemId}`);
        if (itemEl) {
            const quantity = cartItems[itemId] && cartItems[itemId].quantity || 0;
            const inCartEl = itemEl.querySelector('.in-cart');
            const inCartQuantity = itemEl.querySelector('.in-cart b');
            if (quantity) {
                inCartEl.className = inCartEl.className.replace('active', '').trim() + ' active';
            } else {
                inCartEl.className = inCartEl.className.replace('active', '').trim();
            }
            inCartQuantity.innerText = quantity;
        }
    };
    const addToCart = item => {
        cartItems[item.id] = { ...item, quantity: cartItems[item.id] ? cartItems[item.id].quantity + 1 : 1 };
        syncLocalStorage();
        syncCart();
        syncItem(item.id);
    };
    const removeFromCart = itemId => {
        delete cartItems[itemId];
        syncLocalStorage();
        syncCart();
        syncItem(itemId);
    };
    const clearCart = () => {
        Object.keys(cartItems).forEach(itemId => { delete cartItems[itemId] });
        syncLocalStorage();
        syncCart();
    };
    const changeQuantity = (itemId, quantity) => {
        cartItems[itemId].quantity = quantity;
        syncLocalStorage();
        syncCart();
        syncItem(itemId);
    };
    const filterItems = () => {
        if (!appliedFilters.length) {
            renderItems(data);
            return;
        }

        const filteredItems = data.filter(item => !!item.tags.filter(tag => appliedFilters.includes(tag)).length);
        renderItems(filteredItems);
    };
    const getSelectedFiltersArray = () => Array.from(filtersOptionsEl.querySelectorAll('input:checked'));
    const syncApplyFiltersButton = () => {
        const selectedFiltersCount = getSelectedFiltersArray().length;

        if (selectedFiltersCount !== appliedFilters.length || !appliedFilters.length) {
            applyFiltersButton.className = applyFiltersButton.className.replace('active', '').trim() + ' active';
            applyFiltersButton.innerText = `Apply Filters (${selectedFiltersCount})`;
        } else {
            applyFiltersButton.className = applyFiltersButton.className.replace('active', '').trim();
            applyFiltersButton.innerText = `Reset Filters (${selectedFiltersCount})`;
        }
    };
    const renderFilters = () => {
        filtersOptionsEl.innerHTML = filters.map(group => `
            <div>
                <h3>${group.title}</h3>
                <ul>
                    ${group.tags.map(tag => `
                        <li>
                            <input id="tag-${tag}" data-tag="${tag}" type="checkbox"${appliedFilters.includes(tag) ? ' checked="checked"' : ''}>
                            <label for="tag-${tag}">${tag}</label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        Array.from(filtersOptionsEl.querySelectorAll('input')).map(el => {
            el.addEventListener('change', () => {
                syncApplyFiltersButton();
            });
        });
    };

    applyFiltersButton.addEventListener('click', () => {
        const selectedFilters = getSelectedFiltersArray();
        if (selectedFilters.length !== appliedFilters.length || !appliedFilters.length) {
            appliedFilters.length = 0;
            selectedFilters.forEach(el => {
                appliedFilters.push(el.getAttribute('data-tag'));
            });
        } else {
            appliedFilters.length = 0;
            renderFilters();
        }

        syncLocalStorage();
        filterItems();
        syncApplyFiltersButton();
    });

    const showModalInfo = dataId => {
        const data = document.getElementById(dataId);
        if (data) {
            document.getElementById('modal').style.display = 'flex';
            document.getElementById('modal-content-inner').innerHTML = data.innerHTML;
        }
    };

    document.getElementById('modal').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('modal-content-inner').innerHTML = '';
    });

    Array.from(document.querySelectorAll('.show-info')).forEach(el => {
        const dataId = el.getAttribute('data-info');
        el.addEventListener('click', e => {
            e.preventDefault();
            showModalInfo(dataId);
        });
    });

    renderFilters();
    syncCart();
    filterItems();
    syncApplyFiltersButton();

    const orderEl = document.getElementById('order');
    const orderOverlayEl = document.getElementById('order-overlay');
    
    const showOrder = () => {
        const items = Object.values(cartItems);
        if (items.length) {
            orderEl.style.display = 'flex';
            orderOverlayEl.style.display = 'block';
            let total = 0;
            let totalQty = 0;
            let orderInfo = '';
            items.forEach(item => {
                total += item.quantity * item.price;
                totalQty += item.quantity;

                orderInfo += `ID: ${item.id}; Name: ${item.name}; Price: $${item.price}; Quantity: ${item.quantity}; Total: $${item.price * item.quantity}\n`;
            });
            document.getElementById('total-items').innerText = totalQty + (totalQty === 1 ? ' item' : ' items');
            document.getElementById('total-price').innerText = `$${total.toFixed(2)}`;
            document.getElementById('order-info').value = orderInfo;
        }
    };
    const hideOrder = () => {
        orderEl.style.display = 'none';
        orderOverlayEl.style.display = 'none';
    }

    const showPickUp = () => {
        document.getElementById('pick-info').style.display = 'block';
        document.getElementById('address-input').style.display = 'none';
    };

    const showAddress = () => {
        document.getElementById('pick-info').style.display = 'none';
        document.getElementById('address-input').style.display = 'block';
    };

    document.getElementById('order-cart').addEventListener('click', showOrder);
    orderOverlayEl.addEventListener('click', hideOrder);
    document.getElementById('pickup').addEventListener('click', showPickUp);
    document.getElementById('post').addEventListener('click', showAddress);
    document.getElementById('order-form').addEventListener('submit', () => {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('filters');
    });

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
