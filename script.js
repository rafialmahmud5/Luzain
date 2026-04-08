document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeNameSpan = document.getElementById('themeName');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('luzain-theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('luzain-theme', theme);
        if (theme === 'dark') {
            themeNameSpan.textContent = 'DARK';
        } else {
            themeNameSpan.textContent = 'LIGHT';
        }
    }

    // --- Dynamic Products Rendering ---
    const productGallery = document.getElementById('productGallery');
    
    function renderProducts() {
        productGallery.innerHTML = '';
        products.forEach(product => {
            const itemHTML = `
                <div class="gallery-item" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                </div>
            `;
            productGallery.insertAdjacentHTML('beforeend', itemHTML);
        });
        
        // Attach event listeners to new cards
        document.querySelectorAll('.gallery-item').forEach(card => {
            card.addEventListener('click', (e) => {
                // If they clicked the button directly, let the button handler do it
                if(e.target.classList.contains('add-to-cart')) return;
                
                const productId = parseInt(card.getAttribute('data-id'));
                openDetailsModal(productId);
            });
        });

        // Add to Cart buttons on the grid
        document.querySelectorAll('.gallery-item .add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.gallery-item');
                const productId = parseInt(card.getAttribute('data-id'));
                const product = products.find(p => p.id === productId);
                
                cart.push({ id: product.id, name: product.name, price: product.price });
                updateCartUI();
                
                const originalText = button.textContent;
                button.textContent = "Added!";
                setTimeout(() => { button.textContent = originalText; }, 1000);
            });
        });
    }

    renderProducts();

    // --- Product Details Modal ---
    const detailsModal = document.getElementById('detailsModal');
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    
    function openDetailsModal(productId) {
        const product = products.find(p => p.id === productId);
        if(!product) return;
        
        document.getElementById('detailsImage').innerHTML = `<img src="${product.image}" alt="${product.name}">`;
        document.getElementById('detailsName').textContent = product.name;
        document.getElementById('detailsPrice').textContent = '$' + product.price.toFixed(2);
        document.getElementById('detailsDescription').textContent = product.description;
        
        const addToCartBtn = document.getElementById('detailsAddToCart');
        // Remove old listeners by cloning
        const newBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
        
        newBtn.addEventListener('click', () => {
            cart.push({ id: product.id, name: product.name, price: product.price });
            updateCartUI();
            const originalText = newBtn.textContent;
            newBtn.textContent = "Added!";
            setTimeout(() => { newBtn.textContent = originalText; }, 1000);
        });
        
        detailsModal.style.display = 'block';
    }

    closeDetailsModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // --- E-Commerce Cart & Checkout Logic ---
    let cart = [];
    
    const cartCountSpan = document.getElementById('cartCount');
    const checkoutModal = document.getElementById('checkoutModal');
    const cartBtn = document.getElementById('cartBtn');
    const closeCheckoutModal = document.getElementById('closeModal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalHtml = document.getElementById('cartTotalHtml');
    const checkoutForm = document.getElementById('checkoutForm');
    const submitOrderBtn = document.getElementById('submitOrderBtn');
    
    // Toggle Payment details
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const bkashDetails = document.getElementById('bkashDetails');
    const bkashTrxInfo = document.getElementById('bkashTrxInfo');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value.includes('Send Money')) {
                bkashDetails.style.display = 'block';
                bkashTrxInfo.required = true;
            } else {
                bkashDetails.style.display = 'none';
                bkashTrxInfo.required = false;
            }
        });
    });

    function updateCartUI() {
        cartCountSpan.textContent = cart.length;
    }

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        checkoutModal.style.display = 'block';
        renderCartItems();
    });

    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == checkoutModal) checkoutModal.style.display = 'none';
        if (e.target == detailsModal) detailsModal.style.display = 'none';
    });

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalHtml.textContent = '0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach((item) => {
            total += item.price;
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>$${item.price.toFixed(2)}</span>
                </div>
            `;
        });
        cartTotalHtml.textContent = total.toFixed(2);
    }

    // Submit Order via Google Form
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to checkout.');
            return;
        }

        submitOrderBtn.textContent = 'Processing...';
        submitOrderBtn.disabled = true;

        const name = document.getElementById('custName').value;
        const email = document.getElementById('custEmail').value;
        const phone = document.getElementById('custPhone').value;
        const address = document.getElementById('custAddress').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const bkashTrx = document.getElementById('bkashTrxInfo').value;

        let total = 0;
        let itemsText = '';
        cart.forEach((item, i) => {
            total += item.price;
            itemsText += `${i+1}. ${item.name} - $${item.price.toFixed(2)}\n`;
        });

        // Google Form entries
        const formActionUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdMtGYSzL2JFKDQWJRqJ3UuMYi3OSBzDNZbSL9E2_lpxIEbOw/formResponse';
        
        const formData = new FormData();
        formData.append('entry.654185170', name);
        formData.append('entry.1130134743', email);
        formData.append('entry.1111844595', phone);
        formData.append('entry.435575537', address);
        formData.append('entry.1397985136', itemsText);
        formData.append('entry.104650113', '$' + total.toFixed(2));
        formData.append('entry.2008523673', paymentMethod);
        if (bkashTrx) {
            formData.append('entry.1806220397', bkashTrx);
        }

        fetch(formActionUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        }).then(() => {
            alert('Your order has been successfully placed! We will contact you soon.');
            cart = [];
            updateCartUI();
            checkoutForm.reset();
            checkoutModal.style.display = 'none';
        }).catch(err => {
            alert('Error submitting order. Please try again or contact us via WhatsApp.');
            console.error(err);
        }).finally(() => {
            submitOrderBtn.textContent = 'Confirm Order';
            submitOrderBtn.disabled = false;
        });
    });
});
