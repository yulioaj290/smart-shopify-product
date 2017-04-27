<?php


// Alow to insert a Shopify product Buy Button using [shopify_basic_product product_id="ID"] shortcode
// =======================================================================================================

function sc_shopify_basic_product($atts) {
	return 
	'
	<div class="shopify-basic-container row">
		<div id="sh-product-id" class="hidden">'. $atts['product_id'] .'</div>
		<div id="sh-product-'. $atts['product_id'] .'" class="shopify-product col-lg-12">
			<div class="sh-images center-text col-md-7">
				<div class="sh-images-main" id="sh-images-main">
				</div>
				<div class="sh-images-gallery">
				</div>
			</div>
			<div class="sh-info center-text col-md-5">
				<h1 class="sh-title"></h1>
	    		<h2 class="variant-title"></h2>
				<h3 class="sh-price"></h3>
				<div class="sh-variant-types"></div>
				<div class="sh-add-cart">
					<button class="buy-button js-prevent-cart-listener">Add To Cart</button>
				</div>
				<div class="sh-content-body"></div>
			</div>
		</div>
	</div>
	';
}
add_shortcode( 'shopify_basic_product', 'sc_shopify_basic_product' );


// Allow to insert a Shopify product Buy Info using [shopify_info_product product_id="ID" product_link="src_of_product_detail" swipe="false"] shortcode
// ======================================================================================================================================================

function sc_shopify_info_product($atts) {
	return 
	'
	<div class="shopify-info-cell ' . ($atts['swipe'] == "true" ? '' : 'col-md-3 col-sm-6' ) .'" data-product-id="'. $atts['product_id'] .'" >
		<a class="sh-i-product-info" href="' . $atts['product_link'] . '" id="sh-i-product-'. $atts['product_id'] .'" data-product-id="'. $atts['product_id'] .'" >
			<div class="sh-i-product-image center-text" style="background-image: url(http://localhost/Pruebas/assets/images/eyeglases.jpg)"></div>
			<h3 class="sh-i-product-title center-text">Title of the product</h3>
			<p class="sh-i-product-price center-text">$00.00</p>
		</a>' .

		($atts['buy-button'] == "true" ? 
	   '<p class="sh-i-buy-button center-text">
			<button id="sh-i-buy-button-'. $atts['product_id'] .'" class="buy-now-button js-prevent-cart-listener">Buy Now</button>
		</p>' 
		: "")

. '	</div>';
}
add_shortcode( 'shopify_info_product', 'sc_shopify_info_product' );

 
