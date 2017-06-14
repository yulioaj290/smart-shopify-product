## Smart Shopify Product
This Wordpress plugin allows add some shortcodes on post to insert Shopify products. Also allow to retrieve/update/remove automatically all products from the shopify store (like a sync function).

### Shortcodes
* **[shopify_basic_product product_id="ID"]:** Allows to insert all product basic information and an **add to cart** button. This last, change its appearance accordingly the choices of the product variants that customers selects. this view is ideal for a product detail page.
* **[shopify_info_product product_id="ID" product_link="src_of_product_detail"]:** Insert a basic product card with the main image, title and price. Ideal for a collection page.

### Button for shopping cart
To get access to the shopping cart you can insert this code on the place of your preference:
Note: You must have `Font Awesome` to get the `fa-shopping-cart` icon.

```html
<button class="btn--cart-tab js-prevent-cart-listener">
	<span class="btn__counter"></span>
	<span class="fa fa-shopping-cart"></span>
</button>
```

### Shopify Cart
To get a Shopify Cart where to see all products added to cart, you can insert this code on the place of your preference. It's a good practice to locate it just next to the open `<body>` HTML tag:

```html

<!-- Shopify Cart HTML -->
<!-- ================================================================================== -->

<!-- .cart begin -->
<div class="cart">

<!-- .cart-section begin // cart header -->
<div class="cart-section cart-section--top">
	<h2 class="cart-title">Your cart</h2>
	<button class="btn--close">
		<span aria-role="hidden">×</span>
		<span class="visuallyhidden">Close</span>
	</button>
</div>
<!-- .cart-section end -->

<!-- .cart-form begin // cart body -->
<div class="cart-form">
	<div class="cart-item-container cart-section">
	</div>
	<!-- .cart-bottom begin -->
	<div class="cart-bottom">
		<div class="cart-info clearfix cart-section">
			<div class="type--caps cart-info__total cart-info__small">Total</div>
			<div class="cart-info__pricing">
				<span class="cart-info__small cart-info__total">CAD</span>
				<span class="pricing pricing--no-padding"></span>
			</div>
		</div>
		<div class="cart-actions-container cart-section type--center">
			<div class="cart-discount-notice cart-info__small">Shipping and discount codes are added at checkout.</div>
			<input type="submit" class="btn--cart-checkout" id="checkout" name="checkout" value="Checkout">
		</div>
	</div>
	<!-- .cart-bottom end -->
</div>
<!-- .cart-form end -->

</div>
<!-- .cart end -->

<script id="CartItemTemplate" type="text/template">
	<div class="cart-item">
		<div id="cart-item-id" class="hidden"></div>
		<div class="cart-item__img"></div>
		<div class="cart-item__content">
			<div class="cart-item__content-row">
				<div class="cart-item__variant-title"></div>
				<span class="cart-item__title"></span>
			</div>
			<div class="cart-item__content-row">
				<div class="cart-item__quantity-container">
					<button class="btn--seamless quantity-decrement" type="button"><span>-</span><span class="visuallyhidden"><!-- Decrement --></span></button>
					<input class="cart-item__quantity" type="number" min="0" aria-label="Quantity">
					<button class="btn--seamless quantity-increment" type="button"><span>+</span><span class="visuallyhidden"><!-- Increment --></span></button>
				</div>
				<span class="cart-item__price"></span>
			</div>
		</div>
	</div>
</script>

<!-- END - Shopify Cart HTML -->
<!-- ================================================================================== -->

```

### Settings

You can access to the Smart Shopify Product setting through the **S. Shopify Product** item menu in the Wordpress admin menu.

#### Shopify Tag
* **API url:** The url of Shopify API for your Shopify app. This look like: `https://apikey:password@my-shop.myshopify.com`.
* **Shop url:** The url of your Shopify store. This look like: `my-shop.myshopify.com`.
* **Access Token:** This is a long random string of your Shopify app. This is knew as the `API Key` too.
* **App ID Number:** Usually this number is `6`, for the Buy Button.

#### Post Type of Product Tag
On this section you will configure the post type in your Wordpress website you use to represent a Shopify product. It usually works fine with post types created with Toolset plugin (the free version of this, allow to create this post types :)).

* **Post Type Slug:** Slug of the Post Type for Products you have had created, using `Toolset` or another plugin for management of custom Post Type. **Eg:** product, shopify-product, sh-product. 
* **Product ID Meta Slug:** Slug of the custom field type (or meta) of Shopify Product ID, for the Product Post Type you have had created, using Toolset or another plugin for management of custom Post Type. **Eg:** product-id, shopify-product-id, sh-product-id. **Note:** Custom field created with Toolset plugin have a "wpcf-" prefix. Eg: wpcf-product-id.


### Refresh function
You can make some kind on **sync** with the products of your Shopify store. On the setting of the plugin, you will find a **Refresh Shopify Product** button, it will retrieve all the Shopify products and will remove of your website the Shopify products that don't exist anymore.
* If you check the `Publish new products right away (set to Pending Review if unchecked)` option, post types created from Shopify products will publish automatically.


### Browser Testing

We are using [BrowserStack][1] for testing the plugin's functions in the most popular moders browsers. 
With BrowserStack you can automate all web and mobile browser tests. It offers you a chance to keep attention to the real functionalities of your products and to fit the needs of your customers without worrying about browser testings.

[1]: https://www.browserstack.com