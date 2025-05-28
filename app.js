
// Функция для обновления счетчика корзины в хедере

function updateCartCounter() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-counter').forEach(counter => {
        counter.textContent = totalItems;
    });
}

// Функция для добавления товара в корзину
function addToCart(product) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем количество
        cartItems[existingItemIndex].quantity += product.quantity;
    } else {
        // Если товара нет, добавляем новый
        cartItems.push(product);
    }
    
    // Сохраняем обновленную корзину
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Обновляем счетчик в хедере
    updateCartCounter();
    
    // Показываем анимацию добавления
    const button = event.target.closest('.cyber-button');
    if (button) {
        button.classList.add('item-added');
        setTimeout(() => {
            button.classList.remove('item-added');
        }, 500);
    }
    
    return false;
}

// Функция для отображения товаров в корзине
function displayCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsList = document.querySelector('.cart-items-list');
    const cartEmpty = document.querySelector('.cart-empty');
    const subtotalElement = document.querySelector('.subtotal');
    const grandTotalElement = document.querySelector('.grand-total');
    
    if (cartItems.length === 0) {
        cartItemsList.style.display = 'none';
        cartEmpty.style.display = 'flex';
        subtotalElement.textContent = '0 ₽';
        grandTotalElement.textContent = '0 ₽';
        return;
    }
    
    cartItemsList.style.display = 'block';
    cartEmpty.style.display = 'none';
    
    // Очищаем список перед обновлением
    cartItemsList.innerHTML = '';
    
    let subtotal = 0;
    
    // Добавляем каждый товар в список
    cartItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-product">
                <div class="product-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <p class="product-code">${item.code}</p>
                    <div class="product-tech">
                        ${item.specs.map(spec => `<span>${spec}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="item-price">
                <span class="price-value">${item.price.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
                <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
            </div>
            <div class="item-total">
                <span class="total-value">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="item-remove">
                <button class="remove-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        cartItemsList.appendChild(itemElement);
        
        // Добавляем обработчики событий для кнопок
        const minusBtn = itemElement.querySelector('.minus');
        const plusBtn = itemElement.querySelector('.plus');
        const quantityInput = itemElement.querySelector('.quantity-input');
        const removeBtn = itemElement.querySelector('.remove-btn');
        
        minusBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                quantityInput.value = item.quantity;
                updateCartItem(index, item);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            item.quantity++;
            quantityInput.value = item.quantity;
            updateCartItem(index, item);
        });
        
        quantityInput.addEventListener('change', () => {
            const newQuantity = parseInt(quantityInput.value) || 1;
            item.quantity = newQuantity < 1 ? 1 : newQuantity;
            quantityInput.value = item.quantity;
            updateCartItem(index, item);
        });
        
        removeBtn.addEventListener('click', () => {
            cartItems.splice(index, 1);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            displayCartItems();
            updateCartCounter();
        });
        
        subtotal += item.price * item.quantity;
    });
    
    // Обновляем итоговые суммы
    subtotalElement.textContent = subtotal.toLocaleString('ru-RU') + ' ₽';
    grandTotalElement.textContent = subtotal.toLocaleString('ru-RU') + ' ₽';
}

// Функция для обновления товара в корзине
function updateCartItem(index, item) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems[index] = item;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    displayCartItems();
    updateCartCounter();
}

// Функция для очистки корзины
function clearCart() {
    localStorage.removeItem('cartItems');
    displayCartItems();
    updateCartCounter();
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если это страница корзины, отображаем товары
    if (document.querySelector('.cart-container')) {
        displayCartItems();
        
        // Обработчик для кнопки очистки корзины
        document.querySelector('.clear-cart')?.addEventListener('click', clearCart);
        
        // Обработчик для кнопки оформления заказа
        document.querySelector('.checkout')?.addEventListener('click', function() {
            alert('Заказ успешно оформлен!');
            clearCart();
        });
    }
    
    // Обработчики для кнопок "В корзину" на страницах товаров
    document.querySelectorAll('.cyber-button').forEach(button => {
        if (button.textContent.includes('В КОРЗИНУ')) {
            button.addEventListener('click', function(event) {
                const card = event.target.closest('.price-category-card');
                if (!card) return;
                
                const product = {
                    id: card.querySelector('h3').textContent.trim(),
                    name: card.querySelector('h3').textContent.trim(),
                    code: '#' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    image: card.querySelector('img').src,
                    price: parseInt(card.querySelector('.price').textContent.replace(/\D/g, '')),
                    quantity: 1,
                    specs: Array.from(card.querySelectorAll('.spec-item span')).map(span => span.textContent.trim())
                };
                
                addToCart(product);
                
                // Если мы на странице корзины, обновляем отображение
                if (document.querySelector('.cart-container')) {
                    displayCartItems();
                }
            });
        }
    });
    
    // Обновляем счетчик корзины при загрузке
    updateCartCounter();
});
// Обработчик для кнопки покупки сборки
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('buy-build') || e.target.closest('.buy-build')) {
        const buildId = e.target.dataset?.index || e.target.closest('.buy-build').dataset.index;
        const savedBuilds = JSON.parse(localStorage.getItem('savedBuilds')) || [];
        
        if (buildId >= 0 && buildId < savedBuilds.length) {
            const build = savedBuilds[buildId];
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Добавляем каждый компонент в корзину
            Object.values(build.components).forEach(component => {
                const existingItem = cartItems.find(item => item.id === component.id);
                
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cartItems.push({
                        id: component.id,
                        name: component.name,
                        code: `#${component.id}`,
                        image: getComponentImage(component.id),
                        price: component.price,
                        quantity: 1,
                        specs: component.specs
                    });
                }
            });
            
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartCounter();
            alert('Сборка добавлена в корзину!');
        }
    }
});

// Функция для получения изображения компонента
function getComponentImage(componentId) {
    const type = componentId.substring(0, 3);
    switch(type) {
        case 'cpu': return 'pic/cpu-example.jpg';
        case 'mob': return 'pic/mobo-example.jpg';
        case 'gpu': return 'pic/gpu-example.jpg';
        case 'ram': return 'pic/ram-example.jpg';
        case 'sto': return 'pic/ssd-example.jpg';
        case 'psu': return 'pic/psu-example.jpg';
        case 'cas': return 'pic/case-example.jpg';
        default: return 'pic/default-component.jpg';
    }
}

// Функция для добавления товара в корзину
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cart.find(item => item.code === product.code);
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            name: product.name,
            code: product.code,
            price: product.price,
            image: product.image,
            specs: product.specs || [],
            quantity: product.quantity || 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

// Функция для обновления счетчика корзины
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const counterElements = document.querySelectorAll('.cart-counter');
    counterElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Инициализация счетчика при загрузке страницы
document.addEventListener('DOMContentLoaded', updateCartCounter);