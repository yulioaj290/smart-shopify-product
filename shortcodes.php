<?php

/*
===========================================================
ACTION HOOKS
=========================================================== */

add_action('init', 'ssp_sc_shopify_basic_product_init');
add_action('init', 'ssp_sc_shopify_info_product_init');


/*
===========================================================
INSERT A SHOPIFY PRODUCT WITH BUY BUTTON WITH SHORTCODE [shopify_basic_product product_id="ID"]
=========================================================== */

function ssp_sc_shopify_basic_product_init()
{
    function ssp_sc_shopify_basic_product($atts)
    {
        $price_setted = sanitize_option('ssp_shopify_field_price_text', get_option('ssp_shopify_field_price_text', "")) != ""
            ? ' setted'
            : '';

        $price_text = sanitize_option('ssp_shopify_field_price_text', get_option('ssp_shopify_field_price_text', "")) != ""
            ? get_option('ssp_shopify_field_price_text', "")
            : '$00.00';

        $price_tag = sanitize_option('ssp_shopify_field_price_show', get_option('ssp_shopify_field_price_show', 1)) != 1
            ? ''
            : '<h3 class="sh-price' . $price_setted . '">' . $price_text . '</h3>';

        $variants_tag = sanitize_option('ssp_shopify_field_variant_selector', get_option('ssp_shopify_field_variant_selector', 1)) != 1
            ? ''
            : '<div class="sh-variant-types"></div>';

        $buy_button_tag = sanitize_option('ssp_shopify_field_details_buy_btn', get_option('ssp_shopify_field_details_buy_btn', 1)) != 1
            ? ''
            : '<div class="sh-add-cart">
                    <button class="buy-button js-prevent-cart-listener">Add To Cart</button>
               </div>';

        return
            '
        <div class="shopify-basic-container row">
            <div id="sh-product-id" class="hidden">' . esc_attr($atts['product_id']) . '</div>
            <div id="sh-product-' . esc_attr($atts['product_id']) . '" class="shopify-product col-lg-12">
                <div class="sh-images center-text col-md-5 col-md-offset-1">
                    <div class="sh-images-main" id="sh-images-main">
                        <img id="sh-product-main-image" class="product-image" src="' . esc_url(plugins_url('public/img/placeholder.jpg', __FILE__)) . '" data-zoom-image="' . esc_url(plugins_url('public/img/placeholder.jpg', __FILE__)) . '" />
                    </div>
                    <div class="sh-images-gallery">
                    </div>
                </div>
                <div class="sh-info center-text col-md-5">
                    <h1 class="sh-title">Title of the product</h1>
                    <!--<h2 class="variant-title">Variant title</h2>-->' .
            $price_tag .
            $variants_tag .
            $buy_button_tag .
            '<div class="sh-content-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. In voluptas, quam odit tenetur numquam, dolore qui explicabo hic vero quidem omnis ab ratione libero rerum, modi dicta quos dolor illo.</p>
                        <p>Nemo reiciendis corporis praesentium totam non? Dicta aliquid odio, error, aspernatur velit maxime hic commodi ullam, consequuntur repudiandae ratione expedita odit. Quod, omnis corporis quo aspernatur tempora quis, dicta vitae.</p>
                    </div>
                </div>
            </div>
        </div>
        ';
    }

    add_shortcode('shopify_basic_product', 'ssp_sc_shopify_basic_product');
}


/*
===========================================================
INSERT A SHOPIFY PRODUCT CARD INFO WITH BUY BUTTON WITH SHORTCODE [shopify_info_product product_id="ID" product_link="src_of_product_detail" swipe="false"]
=========================================================== */
function ssp_sc_shopify_info_product_init()
{
    function ssp_sc_shopify_info_product($atts)
    {

        $price_setted = sanitize_option('ssp_shopify_field_price_text', get_option('ssp_shopify_field_price_text', "")) != ""
            ? ' setted'
            : '';

        $price_text = sanitize_option('ssp_shopify_field_price_text', get_option('ssp_shopify_field_price_text', "")) != ""
            ? sanitize_option('ssp_shopify_field_price_text', get_option('ssp_shopify_field_price_text', ""))
            : '$00.00';

        $price_tag = sanitize_option('ssp_shopify_field_price_show', get_option('ssp_shopify_field_price_show', 1)) != 1
            ? ''
            : '<p class="sh-i-product-price center-text' . $price_setted . '">' . $price_text . '</p>';

        return
            '
        <div class="shopify-info-cell ' . (rest_sanitize_boolean($atts['swipe']) === true ? '' : 'card-col-md-3 card-col-sm-6') . '" data-product-id="' . esc_attr($atts['product_id']) . '" >
            <a class="sh-i-product-info" href="' . esc_attr($atts['product_link']) . '" id="sh-i-product-' . esc_attr($atts['product_id']) . '" data-product-id="' . esc_attr($atts['product_id']) . '" >
                <div class="sh-i-product-image center-text" style="background-image: url(' . esc_url(plugins_url('public/img/placeholder.jpg', __FILE__)) . ')"></div>
                <h3 class="sh-i-product-title center-text">Title of the product</h3>' .
            $price_tag .
            '</a>' .

            ($atts['buy-button'] == "true" && sanitize_option('ssp_shopify_field_card_buy_btn', get_option('ssp_shopify_field_card_buy_btn', true))
                ? '<p class="sh-i-buy-button center-text">
                        <button id="sh-i-buy-button-' . esc_attr($atts['product_id']) . '" class="buy-now-button js-prevent-cart-listener">Buy Now</button>
                   </p>'
                : "")

            . ' </div>';
    }

    add_shortcode('shopify_info_product', 'ssp_sc_shopify_info_product');
}

/* ======================================================== */
