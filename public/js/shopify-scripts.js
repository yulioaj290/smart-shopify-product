// 	Execute when document is ready
jQuery(document).ready(function ($) {
    ssp_shopify_basic_product();	//	Process main product of the detail page
    ssp_shopify_info_product();		//	Process products of cards
});

//	Creating sspAPIClient for Shopify API
var sspAPIClient = ShopifyBuy.buildClient({
    accessToken: sspShopifyVars.apiKey,	    //	Random API Key number of the Shopify App
    // apiKey: sspShopifyVars.apiKey, 		// 	Same above [Deprecated]
    domain: sspShopifyVars.domain, 		    //	Domain of Shopify Store [my-shopify.shopify.com]
    appId: sspShopifyVars.appId				//	App ID [6]
});

var sspAPICart;					//	Cart of products
var sspAPIProduct = null;			//	Current product
var sspCartLineItemCount;		//	Number of items of the cart

//	Verifying if cart exist, if not it is being created
if (localStorage.getItem('lastCartId')) {
    sspAPIClient.fetchCart(localStorage.getItem('lastCartId')).then(function (remoteCart) {
        sspAPICart = remoteCart;
        sspCartLineItemCount = sspAPICart.lineItems.length;
        sspRenderCartItems();
    });
} else {
    sspAPIClient.createCart().then(function (newCart) {
        sspAPICart = newCart;
        localStorage.setItem('lastCartId', sspAPICart.id);
        sspCartLineItemCount = 0;
    });
}

//	Defines the items that contains the focus on the page
var sspPreviousFocusItem;

// 	All products of the store, or all products present on the page
var sspAllProducts = null;

//	Fetching all products from Shopify
var sspFetchingAllProducts = sspAPIClient.fetchAllProducts();

//	Saving first product of the store in current product variable
if (sspAPIProduct === null) {
    sspFetchingAllProducts.then(function (sspAPIProducts) {
        var current = sspAPIProducts[0];

        // var selectedVariant = current.selectedVariant;
        // var selectedVariantImage = current.selectedVariantImage;
        // var currentOptions = current.options;

        sspUpdateCartTabButton();
        sspBindEventListeners(current);
        sspAPIProduct = current;

        if (sspAllProducts === null) {
            sspAllProducts = sspAPIProducts;
        }
    });
}


// Redirect to the Checkout URL of Shopify
// ============================================================================================================
function redirect_shopify_checkout_url() {
    document.location.href = sspAPICart.checkoutUrl;
}


// Get all info of Shopify product
// ============================================================================================================
function ssp_shopify_basic_product() {
    jQuery(function ($) {

        sspAPIProduct = null;

        var $selector = $('.shopify-basic-container #sh-product-id');

        if ($selector.length) {
            var product_id = $selector.html();
            var container_selector = '#sh-product-' + product_id + ' ';

            sspAPIClient.fetchProduct(product_id).then(function (fetchedProduct) {

                sspAPIProduct = fetchedProduct;

                var selectedVariant = fetchedProduct.selectedVariant;
                var selectedVariantImage = fetchedProduct.selectedVariantImage;
                // var currentOptions = fetchedProduct.options;

                $(container_selector + '.sh-images-main').html('<img alt="' + fetchedProduct.title + '" id="sh-product-main-image" class="product-image" src="' + selectedVariantImage.src + '" data-zoom-image="' + selectedVariantImage.src + '" />');

                $(container_selector + '.sh-title').html(fetchedProduct.title);

                var compareAtPrice = "";
                if (selectedVariant.compareAtPrice != null) {
                    compareAtPrice = ' <strike><sup>' + selectedVariant.compareAtPrice + '</sup></strike>';
                }

                $price_tag = $(container_selector + '.sh-price');
                if ($price_tag.length && !$price_tag.hasClass('setted')) {
                    $price_tag.html(selectedVariant.formattedPrice + compareAtPrice);
                }

                $variants_tag = $(container_selector + '.sh-variant-types');
                if ($variants_tag.length) {
                    $variants_tag.html(sspGenerateSelectors(fetchedProduct));
                }

                $(container_selector + '.sh-content-body').html(fetchedProduct.description);

                var productImages = "";
                fetchedProduct.images.forEach(function (image) {
                    productImages += '<div class="product-image-item"><img alt="' + fetchedProduct.title + '" src="' + image.src + '" ></div>'
                });
                $(container_selector + '.sh-images-gallery').html(productImages);

                sspUpdateProductTitle(fetchedProduct.title);
                sspUpdateVariantImage(selectedVariantImage);
                sspUpdateVariantTitle(selectedVariant);
                sspUpdateVariantPrice(selectedVariant);
                sspAttachOnVariantSelectListeners(fetchedProduct);
                sspUpdateCartTabButton();
                sspBindEventListeners(fetchedProduct, true);

                sspInitializeVariantButtons(fetchedProduct);
                if (!fetchedProduct.selectedVariant.available) {
                    sspToggleBindBuyButton(false);
                }
            });
        }

    });
}

function sspRandomizeSrcImage(srcImage) {
    var parts = srcImage.split('?');
    if (parts.length > 1) {
        parts[1] += "&rdm=" + Math.floor((Math.random() * 999999) + 1).toString();
        return parts.join('?');
    } else {
        return parts[0] + "?rdm=" + Math.floor((Math.random() * 999999) + 1).toString();
    }
}


// Get info of Shopify product
// ============================================================================================================
function ssp_shopify_info_product() {
    jQuery(function ($) {

        var $selectors = $('.shopify-info-cell');

        var i = 0;
        var ids = [];

        if ($selectors.length) {
            $selectors.each(function () {
                ids[i] = $(this).attr('data-product-id');
                i++;
            });


            sspAPIClient.fetchQueryProducts({'product_ids': ids}).then(function (p) {
                for (var key in p) {
                    if (p.hasOwnProperty(key)) {

                        var fetchedProduct = p[key];

                        var product_selector = '#sh-i-product-' + fetchedProduct.id;

                        var selectedVariant = fetchedProduct.selectedVariant;
                        var selectedVariantImage = fetchedProduct.selectedVariantImage;

                        $(product_selector).find('.sh-i-product-image').css('background-image', 'url(' + selectedVariantImage.src + ')');
                        $(product_selector).find('.sh-i-product-image').attr('alt', fetchedProduct.title);

                        $(product_selector).find('.sh-i-product-title').html(fetchedProduct.title);

                        var compareAtPrice = "";
                        if (selectedVariant.compareAtPrice != null) {
                            compareAtPrice = ' <strike><sup>' + selectedVariant.compareAtPrice + '</sup></strike>';
                        }

                        if (sspProductIsAvailable(fetchedProduct)) {
                            $price_tag = $(product_selector).find('.sh-i-product-price');

                            if ($price_tag.length && !$price_tag.hasClass('setted')) {
                                $price_tag.html(selectedVariant.formattedPrice + compareAtPrice);
                            }

                        } else {
                            $('#sh-i-link-' + fetchedProduct.id + ' .shopify-info-cell').addClass('disabled');
                            $(product_selector).find('.sh-i-product-price').html("Sold Out");

                            // If buy now button exist
                            if ($(product_selector).parent().find('.buy-now-button').length) {
                                $(product_selector).parent().find('.buy-now-button').remove();
                            }
                        }

                    }
                }

                sspAllProducts = p;

            });

            for (var j = 0; j < ids.length; j++) {
                // If buy now button exist
                var $currItem = $('#sh-i-buy-button-' + ids[j]);
                if ($currItem.length) {
                    $currItem.bind('click', {idProd: ids[j]}, sspPrepareBuyNowClickHandler);
                }
            }
        }

    });
}

function sspGenerateSelectors(sspAPIProduct) {

    var productAvailable = false;

    return sspAPIProduct.options.map(function (option) {
        if (option.name != "Title") {
            var sh_options = '<div><div id="sh-radio-options" class="btn-group" data-toggle="buttons">';
            sh_options += '<spam class="sh-radio-title">' + option.name + '</spam>';

            option.values.forEach(function (value) {
                var optionAvailable = false;

                sspAPIProduct.variants.forEach(function (variant) {
                    variant.optionValues.forEach(function (optionVal) {
                        if (optionVal.name === option.name && optionVal.value === value && variant.available === true) {
                            optionAvailable = true;
                            productAvailable = true;
                        }
                    });
                });

                if (sspAPIProduct.options.length === 1) {

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


            sh_options += '</div></div>';

            return sh_options;
        }
    });
}


/* Ask if product is available in stock
 ============================================================ */
function sspProductIsAvailable(sspAPIProduct) {
    var productAvailable = false;

    sspAPIProduct.options.map(function (option) {
        option.values.forEach(function (value) {

            sspAPIProduct.variants.forEach(function (variant) {
                variant.optionValues.forEach(function (optionVal) {
                    if (optionVal.name === option.name && optionVal.value === value && variant.available === true) {
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
function sspUpdateProductTitle(title) {
    jQuery(function ($) {
        var $pTitle = $('#buy-button-1 .sh-title');
        if ($pTitle.length) {
            $pTitle.text(title);
        }
    });
}

/* Update product image based on selected variant
 ============================================================ */
function sspUpdateVariantImage(image) {
    jQuery(function ($) {
        var src = (image) ? image.src : ShopifyBuy.NO_IMAGE_URI;

        var $vImage = $('#buy-button-1 .product-image');
        if ($vImage.length) {
            $vImage.attr('src', src);
        }
    });
}

/* Update product variant title based on selected variant
 ============================================================ */
function sspUpdateVariantTitle(variant) {
    jQuery(function ($) {

        var $vTitle = $('#buy-button-1 .variant-title');
        if ($vTitle.length) {
            $vTitle.text(variant.title);
        }
    });
}

/* Update product variant price based on selected variant
 ============================================================ */
function sspUpdateVariantPrice(variant) {
    jQuery(function ($) {

        var $vPrice = $('#buy-button-1 .sh-price');
        if ($vPrice.length) {
            $vPrice.text('$' + variant.price);
        }
    });
}

/* Variant option change handler
 ============================================================ */
function sspAttachOnVariantSelectListeners(sspAPIProduct) {
    jQuery(function ($) {
        var $element_label = $('.sh-variant-types .sh-radio-item-label');

        if ($element_label.length) {

            $element_label.on('click', function (event) {
                var $element_input = $(this).find('.sh-radio-item-input');

                var name = $element_input.attr('name');
                var value = $element_input.val();

                sspAPIProduct.options.filter(function (option) {
                    return option.name === name;
                })[0].selected = value;

                var selectedVariant = sspAPIProduct.selectedVariant;

                if (selectedVariant === null) {
                    sspToggleBindBuyButton(false, false);
                } else if (!selectedVariant.available) {
                    sspToggleBindBuyButton(false);
                } else {
                    sspToggleBindBuyButton(true);
                    var selectedVariantImage = sspAPIProduct.selectedVariantImage;
                    sspUpdateProductTitle(sspAPIProduct.title);
                    sspUpdateVariantImage(selectedVariantImage);
                    sspUpdateVariantTitle(selectedVariant);
                    sspUpdateVariantPrice(selectedVariant);
                }
            });

        }
    });
}

/* Initialize Variant options buttons 
 ============================================================ */
function sspInitializeVariantButtons(fetchedProduct) {
    jQuery(function ($) {

        var $elements_labels = $('.sh-variant-types .sh-radio-item-label');

        if ($elements_labels.length) {

            $elements_labels.each(function () {
                var $element_input = $(this).find('.sh-radio-item-input');

                var name = $element_input.attr('name');
                var value = $element_input.val();

                var cant = fetchedProduct.options.filter(function (option) {
                    return option.selected === value;
                }).length;

                if (cant > 0) {
                    $(this).addClass('active')
                }
            });
        }
    });
}


/* Bind/Unbind click event on Buy Button
 ============================================================ */
function sspToggleBindBuyButton(enabling, sspAPICart) {
    jQuery(function ($) {
        // Assign default parameter value
        sspAPICart = typeof sspAPICart !== 'undefined' ? sspAPICart : true;

        var $buyButton = $('.buy-button');

        if ($buyButton.length) {
            if (enabling) {
                $buyButton.bind('click', sspBuyButtonClickHandler);
                $buyButton.removeClass('disabled');
                $buyButton.text('Add To Cart');
            } else {
                $buyButton.unbind('click');
                $buyButton.addClass('disabled');
                $buyButton.text(sspAPICart ? 'Sold Out' : 'Not Available');
            }
        }
    });
}


/* Update cart tab button
 ============================================================ */
function sspUpdateCartTabButton() {
    jQuery(function ($) {
        if (sspAPICart.lineItems.length > 0) {
            $('.btn--cart-tab .btn__counter').html(sspAPICart.lineItemCount);
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
function sspBindEventListeners(sspAPIProduct, is_product_page) {
    jQuery(function ($) {
        // Assign default parameter value
        is_product_page = typeof is_product_page !== 'undefined' ? is_product_page : false;

        if (!is_product_page) {

            // if (!flagBindEventListeners) {

            /* cart close button listener */
            $('.cart .btn--close').on('click', sspCloseCart);

            /* click away listener to close cart */
            $(document).on('click', function (evt) {
                if ((!$(evt.target).closest('.cart').length) && (!$(evt.target).closest('.js-prevent-cart-listener').length)) {
                    sspCloseCart();
                }
            });

            /* escape key handler */
            var ESCAPE_KEYCODE = 27;
            $(document).on('keydown', function (evt) {
                if (evt.which === ESCAPE_KEYCODE) {
                    if (sspPreviousFocusItem) {
                        $(sspPreviousFocusItem).focus();
                        sspPreviousFocusItem = '';
                    }
                    sspCloseCart();
                }
            });

            /* checkout button click listener */
            $('.btn--cart-checkout').on('click', function () {
                window.open(sspAPICart.checkoutUrl, '_blank', 'location=yes,height=570,width=1000,scrollbars=yes,status=yes');
            });

            var $cart = $('.cart');

            /* increment quantity click listener */
            $cart.on('click', '.quantity-increment', function () {
                var variantId = $(this).data('variant-id');
                sspIncrementQuantity(variantId);
            });

            /* decrement quantity click listener */
            $cart.on('click', '.quantity-decrement', function () {
                var variantId = $(this).data('variant-id');
                sspDecrementQuantity(variantId);
            });

            /* update quantity field listener */
            $cart.on('keyup', '.cart-item__quantity', sspDebounce(sspFieldQuantityHandler, 250));

            /* cart tab click listener */
            $('.btn--cart-tab').click(function () {
                sspSetPreviousFocusItem(this);
                sspOpenCart();
            });

            // flagBindEventListeners = true;
            // }
        } else {

            /* buy button click listener */
            if (sspProductIsAvailable(sspAPIProduct)) {
                sspToggleBindBuyButton(true);
            } else {
                sspToggleBindBuyButton(false);
            }
        }
    });
}

/* Open Cart
 ============================================================ */
function sspOpenCart() {
    jQuery(function ($) {
        $('.cart').addClass('js-active');
    });
}

/* Close Cart
 ============================================================ */
function sspCloseCart() {
    jQuery(function ($) {
        $('.cart').removeClass('js-active');
        $('.overlay').removeClass('js-active');
    });
}


/* Decrease quantity amount by 1
 ============================================================ */
function sspDecrementQuantity(variantId) {
    sspUpdateQuantity(function (quantity) {
        return quantity - 1;
    }, variantId);
}

/* Increase quantity amount by 1
 ============================================================ */
function sspIncrementQuantity(variantId) {
    sspUpdateQuantity(function (quantity) {
        return quantity + 1;
    }, variantId);
}


/* Set previously focused item for escape handler
 ============================================================ */
function sspSetPreviousFocusItem(item) {
    sspPreviousFocusItem = item;
}

/* Attach and control listeners onto buy button
 ============================================================ */
function sspBuyButtonClickHandler(evt) {
    jQuery(function ($) {
        evt.preventDefault();
        var id = sspAPIProduct.selectedVariant.id;
        var quantity;
        var cartLineItem = sspFindCartItemByVariantId(id);

        quantity = cartLineItem ? cartLineItem.quantity + 1 : 1;

        sspAddOrUpdateVariant(sspAPIProduct.selectedVariant, quantity);
        sspSetPreviousFocusItem(evt.target);
        $('#checkout').focus();
    });
}

/* Attach and control listeners onto buy now button
 ============================================================ */
function sspPrepareBuyNowClickHandler(evt) {
    jQuery(function ($) {

        var otherProduct = null;

        if (sspAllProducts !== null) {

            for (var i = 0; i < sspAllProducts.length; i++) {
                if (sspAllProducts[i].id == evt.data.idProd) {
                    otherProduct = sspAllProducts[i];
                }
            }


            var selectedVariant = otherProduct.selectedVariant;
            var selectedVariantImage = otherProduct.selectedVariantImage;
            // var currentOptions = otherProduct.options;

            sspUpdateProductTitle(otherProduct.title);
            sspUpdateVariantImage(selectedVariantImage);
            sspUpdateVariantTitle(selectedVariant);
            sspUpdateVariantPrice(selectedVariant);

            sspUpdateCartTabButton();
            // sspBindEventListeners(otherProduct);


            var prodAtts = {'prodName': null, 'prodValue': null};

            otherProduct.options.map(function (option) {
                option.values.forEach(function (value) {

                    otherProduct.variants.forEach(function (variant) {
                        variant.optionValues.forEach(function (optionVal) {
                            if (optionVal.name === option.name && optionVal.value === value && variant.available === true) {
                                if (prodAtts['prodName'] === null && prodAtts['prodValue'] === null) {
                                    prodAtts['prodName'] = option.name;
                                    prodAtts['prodValue'] = value;
                                }
                            }
                        });
                    });

                });
            });

            otherProduct.options.filter(function (option) {
                return option.name === prodAtts['prodName'];
            })[0].selected = prodAtts['prodValue'];

            evt.preventDefault();
            var id = otherProduct.selectedVariant.id;
            var quantity;
            var cartLineItem = sspFindCartItemByVariantId(id);

            quantity = cartLineItem ? cartLineItem.quantity + 1 : 1;

            sspAddOrUpdateVariant(otherProduct.selectedVariant, quantity);
            sspSetPreviousFocusItem(evt.target);

            $('.cart').addClass('js-active');
            $('#checkout').focus();

        }

    });
}


/* Update product variant quantity in cart
 ============================================================ */
function sspUpdateQuantity(fn, variantId) {
    var variant = sspAPIProduct.variants.filter(function (variant) {
        return (variant.id === variantId);
    })[0];
    var quantity;
    // alert(variantId);

    var cartLineItem;
    if ("undefined" === typeof variant) {
        cartLineItem = sspFindCartItemByVariantId(variantId);
    } else {
        cartLineItem = sspFindCartItemByVariantId(variant.id);
    }
    if (cartLineItem) {
        quantity = fn(cartLineItem.quantity);
        sspUpdateVariantInCart(cartLineItem, quantity);
    }
}


/* Update product variant quantity in cart through input field
 ============================================================ */
function sspFieldQuantityHandler(evt) {
    jQuery(function ($) {
        var variantId = parseInt($(this).closest('.cart-item').attr('data-variant-id'), 10);
        var variant = sspAPIProduct.variants.filter(function (variant) {
            return (variant.id === variantId);
        })[0];
        var cartLineItem = sspFindCartItemByVariantId(variant.id);
        var quantity = evt.target.value;
        if (cartLineItem) {
            sspUpdateVariantInCart(cartLineItem, quantity);
        }
    });
}

/* Debounce taken from _.js
 ============================================================ */
function sspDebounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
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
function sspFindCartItemByVariantId(variantId) {
    return sspAPICart.lineItems.filter(function (item) {
        return (item.variant_id === variantId);
    })[0];
}

/* Determine action for variant adding/updating/removing
 ============================================================ */
function sspAddOrUpdateVariant(variant, quantity) {
    sspOpenCart();
    var cartLineItem = sspFindCartItemByVariantId(variant.id);

    if (cartLineItem) {
        sspUpdateVariantInCart(cartLineItem, quantity);
    } else {
        sspAddVariantToCart(variant, quantity);
    }

    sspUpdateCartTabButton();
}

/* Update details for item already in cart. Remove if necessary
 ============================================================ */
function sspUpdateVariantInCart(cartLineItem, quantity) {
    jQuery(function ($) {
        var variantId = cartLineItem.variant_id;
        var cartLength = sspAPICart.lineItems.length;
        sspAPICart.updateLineItem(cartLineItem.id, quantity).then(function (updatedCart) {
            var $cartItem = $('.cart').find('.cart-item[data-variant-id="' + variantId + '"]');
            if (updatedCart.lineItems.length >= cartLength) {
                $cartItem.find('.cart-item__quantity').val(cartLineItem.quantity);
                $cartItem.find('.cart-item__price').text(sspFormatAsMoney(cartLineItem.line_price));
            } else {
                $cartItem.addClass('js-hidden').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
                    $cartItem.remove();
                });
            }

            sspUpdateCartTabButton();
            sspUpdateTotalCartPricing();
            if (updatedCart.lineItems.length < 1) {
                sspCloseCart();
            }
        }).catch(function (errors) {
            console.log('Fail');
            console.error(errors);
        });
    });
}

/* Add 'quantity' amount of product 'variant' to cart
 ============================================================ */
function sspAddVariantToCart(variant, quantity) {
    jQuery(function ($) {
        sspOpenCart();

        sspAPICart.createLineItemsFromVariants({variant: variant, quantity: quantity}).then(function () {
            var cartItem = sspAPICart.lineItems.filter(function (item) {
                return (item.variant_id === variant.id);
            })[0];
            sspRenderCartItem(cartItem);
            var $cartItemContainer = $('.cart-item-container');
            setTimeout(function () {
                $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
            }, 0);

        }).catch(function (errors) {
            console.log('Fail');
            console.error(errors);
        });

        sspUpdateTotalCartPricing();
        sspUpdateCartTabButton();
    });
}

/* Return required markup for single item rendering
 ============================================================ */
function sspRenderCartItem(lineItem) {
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
        $lineItemTemplate.find('.cart-item__price').text(sspFormatAsMoney(lineItem.line_price));
        $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);

        $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
        $lineItemTemplate.find('.quantity-decrement').attr('data-product-id', lineItem.product_id);

        $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);
        $lineItemTemplate.find('.quantity-increment').attr('data-product-id', lineItem.product_id);

        $('.cart-item-container').append($lineItemTemplate);
    });
}

/* Render the line items currently in the cart
 ============================================================ */
function sspRenderCartItems() {
    jQuery(function ($) {
        var $cartItemContainer = $('.cart-item-container');
        $cartItemContainer.empty();
        sspAPICart.lineItems.map(function (lineItem, index) {
            return sspRenderCartItem(lineItem);
        });

        setTimeout(function () {
            $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
        }, 0);
        sspUpdateTotalCartPricing();
    });
}

/* Update Total Cart Pricing
 ============================================================ */
function sspUpdateTotalCartPricing() {
    jQuery(function ($) {
        $('.cart .pricing').text(sspFormatAsMoney(sspAPICart.subtotal));
    });
}

/* Format amount as currency
 ============================================================ */
function sspFormatAsMoney(amount, currency, thousandSeparator, decimalSeparator, localeDecimalSeparator) {
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


