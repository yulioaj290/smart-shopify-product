jQuery(document).ready(function ($) { 

});

var client = ShopifyBuy.buildClient({
	    domain: 'dia-y-luna.myshopify.com', 
	    accessToken: '86ea0eb853822c2a44e9504b75e019f1',
	    appId: '6' 
	    // apiKey: '86ea0eb853822c2a44e9504b75e019f1', // Deprecated
	});

var cart;
var product = null;
var cartLineItemCount;
if(localStorage.getItem('lastCartId')) {
	client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
		cart = remoteCart;
		cartLineItemCount = cart.lineItems.length;
		renderCartItems();
	});
} else {
	client.createCart().then(function (newCart) {
		cart = newCart;
		localStorage.setItem('lastCartId', cart.id);
		cartLineItemCount = 0;
	});
}

var previousFocusItem;

// All products
var allProducts = client.fetchAllProducts();

if(product === null){
	allProducts.then(function(products) {
		var current = products[0];

	    var selectedVariant = current.selectedVariant;
	    var selectedVariantImage = current.selectedVariantImage;
	    var currentOptions = current.options;

	    updateCartTabButton();
	    bindEventListeners(current);
	 	product = current;
	});
}


// Redirect to the Checkout URL of Shopify
// ============================================================================================================
function redirect_shopify_checkout_url() {
	document.location.href = cart.checkoutUrl;
}


// Get all info of Shopify product
// ============================================================================================================
function shopify_basic_product(product_id){
	jQuery(function ($) { 

		product = null;

		client.fetchProduct(product_id).then(function(fetchedProduct) {
		    var selectedVariant = fetchedProduct.selectedVariant;
		    var selectedVariantImage = fetchedProduct.selectedVariantImage;
		    var currentOptions = fetchedProduct.options;

			$('.sh-images-main').html('<img alt="' + fetchedProduct.title + '" id="sh-product-main-image" class="product-image" src="' + selectedVariantImage.src + '" data-zoom-image="' + selectedVariantImage.src + '" >');

			$('.sh-title').html(fetchedProduct.title);

			var compareAtPrice = "";
			if(selectedVariant.compareAtPrice != null){
				compareAtPrice = ' <strike><sup>' + selectedVariant.compareAtPrice + '</sup></strike>';
			}

			$('.sh-price').html(selectedVariant.formattedPrice 
				+ compareAtPrice);
			$('.sh-variant-types').html(generateSelectors(fetchedProduct));
			$('.sh-content-body').html(fetchedProduct.description);

			var productImages = "";
			fetchedProduct.images.forEach(function(image){
				productImages += '<div class="product-image-item"><img alt="' + fetchedProduct.title + '" src="' + image.src + '" ></div>'
			});
			productImages += '<div class="clearfix"></div>';
			$('.sh-images-gallery').html(productImages);
    
		    updateProductTitle(fetchedProduct.title);
		    updateVariantImage(selectedVariantImage);
		    updateVariantTitle(selectedVariant);
		    updateVariantPrice(selectedVariant);
		    attachOnVariantSelectListeners(fetchedProduct);
		    updateCartTabButton();
		    bindEventListeners(fetchedProduct, true);

			initializeVariantButtons(fetchedProduct);
			if(!fetchedProduct.selectedVariant.available){
				toggleBindBuyButton(false);
			}

		    product = fetchedProduct;
		});
	});
}


// Get info of Shopify product
// ============================================================================================================
function shopify_info_product(product_id){
	jQuery(function ($) { 

		client.fetchProduct(product_id).then(function(fetchedProduct) {
		    var selectedVariant = fetchedProduct.selectedVariant;
		    var selectedVariantImage = fetchedProduct.selectedVariantImage;

			$('#sh-i-product-' + product_id).find('.sh-i-product-image').html('<img alt="' + fetchedProduct.title + '" src="' + selectedVariantImage.src + '" >');

			$('#sh-i-product-' + product_id).find('.sh-i-product-title').html(fetchedProduct.title);

			var compareAtPrice = "";
			if(selectedVariant.compareAtPrice != null){
				compareAtPrice = ' <strike><sup>' + selectedVariant.compareAtPrice + '</sup></strike>';
			}

			if(productIsAvailable(fetchedProduct)){
				$('#sh-i-product-' + product_id).find('.sh-i-product-price').html(selectedVariant.formattedPrice + compareAtPrice);
			} else {
				$('#sh-i-link-' + product_id + ' .shopify-info-cell').addClass('disabled');				
				$('#sh-i-product-' + product_id).find('.sh-i-product-price').html("Sold Out");
			}
		});
	});
}

function generateSelectors(product) {

	var productAvailable = false;

	var elements = product.options.map(function(option) {
		if(option.name != "Title"){
			var sh_options = '<div id="sh-radio-options" class="btn-group" data-toggle="buttons">';
			sh_options += '<spam class="sh-radio-title">' + option.name + '</spam>';

			option.values.forEach(function(value) {
				var optionAvailable = false;

				product.variants.forEach(function(variant){
					variant.optionValues.forEach(function(optionVal) {
						if(optionVal.name === option.name && optionVal.value === value && variant.available === true){
							optionAvailable = true;
							productAvailable = true;
						}
					});
				});

				if(product.options.length === 1){

					sh_options += '<label class="btn btn-primary sh-radio-item-label ' + (optionAvailable ? '' : 'disabled') + '">'
									 + '<input class="sh-radio-item-input" type="radio" name="' + option.name + '" id="option-' + option.name + '" ' +
									 'value="' + value + '" data-disabled="' + (optionAvailable ? 'false' : 'true') + '"> ' + value + 
						   		  '</label>';

				} else {

					sh_options += '<label class="btn btn-primary sh-radio-item-label">'
									 + '<input class="sh-radio-item-input" type="radio" name="' + option.name + '" id="option-' + option.name + '" ' +
									 'value="' + value + '" data-disabled="false"> ' + value + 
						   		  '</label>';

				}
			});


			sh_options += '</div>';

			return sh_options;
		}
	});

	return elements;
}


/* Ask if product is available in stock
============================================================ */
function productIsAvailable(product) {
	var productAvailable = false;

	product.options.map(function(option) {
		option.values.forEach(function(value) {

			product.variants.forEach(function(variant){
				variant.optionValues.forEach(function(optionVal) {
					if(optionVal.name === option.name && optionVal.value === value && variant.available === true){
						productAvailable = true;
					}
				});
			});

		});
	});

	return productAvailable;
}


/* Update product title
============================================================ */
function updateProductTitle(title) {
	jQuery(function ($) { 
		$('#buy-button-1 .sh-title').text(title);
	});
}

/* Update product image based on selected variant
============================================================ */
function updateVariantImage(image) {
	jQuery(function ($) { 
		var src = (image) ? image.src : ShopifyBuy.NO_IMAGE_URI;

		$('#buy-button-1 .product-image').attr('src', src);
	});
}

/* Update product variant title based on selected variant
============================================================ */
function updateVariantTitle(variant) {
	jQuery(function ($) { 
		$('#buy-button-1 .variant-title').text(variant.title);
	});
}

/* Update product variant price based on selected variant
============================================================ */
function updateVariantPrice(variant) {
	jQuery(function ($) { 
		$('#buy-button-1 .sh-price').text('$' + variant.price);
	});
}

/* Variant option change handler
============================================================ */
function attachOnVariantSelectListeners(product) {
	jQuery(function ($) { 
		var $element_label = $('.sh-variant-types .sh-radio-item-label');
		$element_label.on('click', function(event) {
			var $element_input = $(this).find('.sh-radio-item-input');
			
			var name = $element_input.attr('name');
			var value = $element_input.val();

			product.options.filter(function(option) {
				return option.name === name;
			})[0].selected = value;

			var selectedVariant = product.selectedVariant;

			if(selectedVariant === null){
				toggleBindBuyButton(false, false);
			} else if(!selectedVariant.available){
				toggleBindBuyButton(false);
			} else {
				toggleBindBuyButton(true);
				var selectedVariantImage = product.selectedVariantImage;
				updateProductTitle(product.title);
				updateVariantImage(selectedVariantImage);
				updateVariantTitle(selectedVariant);
				updateVariantPrice(selectedVariant);
			}
		});
	});
}

/* Initialize Variant options buttons 
============================================================ */
function initializeVariantButtons(fetchedProduct){
	jQuery(function ($) { 

		var $elements_labels = $('.sh-variant-types .sh-radio-item-label');

		$elements_labels.each(function() {
			var $element_input = $(this).find('.sh-radio-item-input');

			var name = $element_input.attr('name');
			var value = $element_input.val();

			var cant = fetchedProduct.options.filter(function(option) {
				return option.selected === value;
			}).length;

			if(cant > 0){
				$(this).addClass('active')
			}
		});
	});
}


/* Bind/Unbind click event on Buy Button
============================================================ */
function toggleBindBuyButton(enabling, cart = true){
	jQuery(function ($) { 
		if(enabling){
			$('.buy-button').bind('click', buyButtonClickHandler);
			$('.buy-button').removeClass('disabled');
			$('.buy-button').text('Add To Cart');
		} else {
			$('.buy-button').unbind('click');
			$('.buy-button').addClass('disabled');
			$('.buy-button').text(cart ? 'Sold Out' : 'Not Available');
		}
	});
}


/* Update cart tab button
============================================================ */
function updateCartTabButton() {
	jQuery(function ($) { 
		if (cart.lineItems.length > 0) {
			$('.btn--cart-tab .btn__counter').html(cart.lineItemCount);
			$('.btn--cart-tab').addClass('js-active');
		} else {
			$('.btn--cart-tab .btn__counter').html(0);
			$('.btn--cart-tab').removeClass('js-active');
			$('.cart').removeClass('js-active');
		}
	});
}


/* Bind Event Listeners
============================================================ */
function bindEventListeners(product, is_product_page = false) {
	jQuery(function ($) { 

		if(!is_product_page){

			/* cart close button listener */
			$('.cart .btn--close').on('click', closeCart);

			/* click away listener to close cart */
			$(document).on('click', function(evt) {
				if((!$(evt.target).closest('.cart').length) && (!$(evt.target).closest('.js-prevent-cart-listener').length)) {
					closeCart();
				}
			});

			/* escape key handler */
			var ESCAPE_KEYCODE = 27;
			$(document).on('keydown', function (evt) {
				if (evt.which === ESCAPE_KEYCODE) {
					if (previousFocusItem) {
						$(previousFocusItem).focus();
						previousFocusItem = ''
					}
					closeCart();
				}
			});

			/* checkout button click listener */
			$('.btn--cart-checkout').on('click', function () {
				window.open(cart.checkoutUrl, '_self');
			});

			/* increment quantity click listener */
			$('.cart').on('click', '.quantity-increment', function () {
				var variantId = $(this).data('variant-id');
				incrementQuantity(variantId);
			});

			/* decrement quantity click listener */
			$('.cart').on('click', '.quantity-decrement', function() {
				var variantId = $(this).data('variant-id');
				decrementQuantity(variantId);
			});

			/* update quantity field listener */
			$('.cart').on('keyup', '.cart-item__quantity', debounce(fieldQuantityHandler, 250));

			/* cart tab click listener */
			$('.btn--cart-tab').click(function() {
				setPreviousFocusItem(this);
				openCart();
			});

		} else {

			/* buy button click listener */
			if(productIsAvailable(product)){
				toggleBindBuyButton(true);
			} else {
				toggleBindBuyButton(false);
			}
		}
	});
}

/* Open Cart
============================================================ */
function openCart() {
	jQuery(function ($) { 
		$('.cart').addClass('js-active');
	});
}

/* Close Cart
============================================================ */
function closeCart() {
	jQuery(function ($) { 
		$('.cart').removeClass('js-active');
		$('.overlay').removeClass('js-active');
	});
}


/* Decrease quantity amount by 1
============================================================ */
function decrementQuantity(variantId) {
	updateQuantity(function(quantity) {
		return quantity - 1;
	}, variantId);
}

/* Increase quantity amount by 1
============================================================ */
function incrementQuantity(variantId) {
	updateQuantity(function(quantity) {
		return quantity + 1;
	}, variantId);
}


/* Set previously focused item for escape handler
============================================================ */
function setPreviousFocusItem(item) {
	previousFocusItem = item;
}

/* Attach and control listeners onto buy button
============================================================ */
function buyButtonClickHandler(evt) {
	jQuery(function ($) { 
		evt.preventDefault();
		var id = product.selectedVariant.id;
		var quantity;
		var cartLineItem = findCartItemByVariantId(id);

		quantity = cartLineItem ? cartLineItem.quantity + 1 : 1;

		addOrUpdateVariant(product.selectedVariant, quantity);
		setPreviousFocusItem(evt.target);
		$('#checkout').focus();
	});
}


/* Update product variant quantity in cart
============================================================ */
function updateQuantity(fn, variantId) {
	var variant = product.variants.filter(function (variant) {
		return (variant.id === variantId);
	})[0];
	var quantity;
	// alert(variantId);
	if("undefined" === typeof variant){
		var cartLineItem = findCartItemByVariantId(variantId);
	} else {
		var cartLineItem = findCartItemByVariantId(variant.id);
	}
	if (cartLineItem) {
		quantity = fn(cartLineItem.quantity);
		updateVariantInCart(cartLineItem, quantity);
	}
}


/* Update product variant quantity in cart through input field
============================================================ */
function fieldQuantityHandler(evt) {
	jQuery(function ($) { 
		var variantId = parseInt($(this).closest('.cart-item').attr('data-variant-id'), 10);
		var variant = product.variants.filter(function (variant) {
			return (variant.id === variantId);
		})[0];
		var cartLineItem = findCartItemByVariantId(variant.id);
		var quantity = evt.target.value;
		if (cartLineItem) {
			updateVariantInCart(cartLineItem, quantity);
		}
	});
}

/* Debounce taken from _.js
============================================================ */
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	}
}

/* Find Cart Line Item By Variant Id
============================================================ */
function findCartItemByVariantId(variantId) {
	return cart.lineItems.filter(function (item) {
		return (item.variant_id === variantId);
	})[0];
}

/* Determine action for variant adding/updating/removing
============================================================ */
function addOrUpdateVariant(variant, quantity) {
	openCart();
	var cartLineItem = findCartItemByVariantId(variant.id);

	if (cartLineItem) {
		updateVariantInCart(cartLineItem, quantity);
	} else {
		addVariantToCart(variant, quantity);
	}

	updateCartTabButton();
}

/* Update details for item already in cart. Remove if necessary
============================================================ */
function updateVariantInCart(cartLineItem, quantity) {
	jQuery(function ($) { 
		var variantId = cartLineItem.variant_id;
		var cartLength = cart.lineItems.length;
		cart.updateLineItem(cartLineItem.id, quantity).then(function(updatedCart) {
			var $cartItem = $('.cart').find('.cart-item[data-variant-id="' + variantId + '"]');
			if (updatedCart.lineItems.length >= cartLength) {
				$cartItem.find('.cart-item__quantity').val(cartLineItem.quantity);
				$cartItem.find('.cart-item__price').text(formatAsMoney(cartLineItem.line_price));
			} else {
				$cartItem.addClass('js-hidden').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
					$cartItem.remove();
				});
			}

			updateCartTabButton();
			updateTotalCartPricing();
			if (updatedCart.lineItems.length < 1) {
				closeCart();
			}
		}).catch(function (errors) {
			console.log('Fail');
			console.error(errors);
		});
	});
}

/* Add 'quantity' amount of product 'variant' to cart
============================================================ */
function addVariantToCart(variant, quantity) {
	jQuery(function ($) { 
		openCart();

		cart.createLineItemsFromVariants({ variant: variant, quantity: quantity }).then(function() {
			var cartItem = cart.lineItems.filter(function (item) {
				return (item.variant_id === variant.id);
			})[0];
			var $cartItem = renderCartItem(cartItem);
			var $cartItemContainer = $('.cart-item-container');
			$cartItemContainer.append($cartItem);
			setTimeout(function () {
				$cartItemContainer.find('.js-hidden').removeClass('js-hidden');
			}, 0);

		}).catch(function (errors) {
			console.log('Fail');
			console.error(errors);
		});

		updateTotalCartPricing();
		updateCartTabButton();
	});
}

/* Return required markup for single item rendering
============================================================ */
function renderCartItem(lineItem) {
	jQuery(function ($) { 
		var lineItemEmptyTemplate = $('#CartItemTemplate').html();
		var $lineItemTemplate = $(lineItemEmptyTemplate);
		var itemImage = lineItem.image.src;
		$lineItemTemplate.attr('data-variant-id', lineItem.variant_id);
		$lineItemTemplate.attr('data-product-id', lineItem.product_id);
		$lineItemTemplate.addClass('js-hidden');
		$lineItemTemplate.find('.cart-item__img').css('background-image', 'url(' + itemImage + ')');
		$lineItemTemplate.find('.cart-item__title').text(lineItem.title);
		$lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title != "Default Title" ? lineItem.variant_title : "");
		$lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
		$lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);

		$lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
		$lineItemTemplate.find('.quantity-decrement').attr('data-product-id', lineItem.product_id);

		$lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);
		$lineItemTemplate.find('.quantity-increment').attr('data-product-id', lineItem.product_id);

		$('.cart-item-container').append($lineItemTemplate);
		// return $lineItemTemplate;
	});
}

/* Render the line items currently in the cart
============================================================ */
function renderCartItems() {
	jQuery(function ($) { 
		var $cartItemContainer = $('.cart-item-container');
		$cartItemContainer.empty();
		var lineItemEmptyTemplate = $('#CartItemTemplate').html();
		var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
			return renderCartItem(lineItem);
		});
		// $cartItemContainer.append($cartLineItems);

		setTimeout(function () {
			$cartItemContainer.find('.js-hidden').removeClass('js-hidden');
		}, 0);
		updateTotalCartPricing();
	});
}

/* Update Total Cart Pricing
============================================================ */
function updateTotalCartPricing() {
	jQuery(function ($) { 
		$('.cart .pricing').text(formatAsMoney(cart.subtotal));
	});
}

/* Format amount as currency
============================================================ */
function formatAsMoney(amount, currency, thousandSeparator, decimalSeparator, localeDecimalSeparator) {
	currency = currency || '$';
	thousandSeparator = thousandSeparator || ',';
	decimalSeparator = decimalSeparator || '.';
	localeDecimalSeparator = localeDecimalSeparator || '.';
	var regex = new RegExp('(\\d)(?=(\\d{3})+\\.)', 'g');

	return currency + parseFloat(amount, 10).toFixed(2)
	.replace(localeDecimalSeparator, decimalSeparator)
	.replace(regex, '$1' + thousandSeparator)
	.toString();
}
