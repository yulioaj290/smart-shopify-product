// Update existing products
// Create pages for new products
// Publish if auto_approve is set to 'true'

/*
 ===========================================================
 FUNCTIONS FOR HANDLE SHOPIFY PRODUCTS ON THE ADMIN PAGE

 - Update existing products
 - Create pages for new products
 - Publish if auto_approve is set to 'true'
 =========================================================== */
var sspShopifyRefresh = {

    vars: sspShopifyVars,
    shopClient: null,
    productsLeft: 0,
    processedIDs: [],

    init: function () {
        sspShopifyRefresh.initShopify();
        sspShopifyRefresh.initListener();
    },

    initShopify: function () {
        sspShopifyRefresh.shopClient = ShopifyBuy.buildClient({
            accessToken: sspShopifyVars.apiKey,
            apiKey: sspShopifyVars.apiKey,             // Deprecated
            // Strips out 'http' if user entered it in their options
            domain: sspShopifyVars.domain,
            appId: sspShopifyVars.appId
        });
    },

    initListener: function () {

        jQuery(function ($) {
            var $sspRefreshButton = $('#ssp-refresh-button');

            $sspRefreshButton.on('click', function (e) {
                e.preventDefault();

                // Cancel if already working
                if ($sspRefreshButton.is(':disabled')) return;

                // Disable button
                $sspRefreshButton.prop('disabled', true);

                // Request all products from this user's shop
                sspShopifyRefresh.shopClient.fetchQueryProducts({
                    limit: 1000
                }).then(sspShopifyRefresh.processAllProducts);

            });
        });

    },

    processAllProducts: function (products) {

        // Save products
        sspShopifyRefresh.products = products;

        // How many products do we have total?
        sspShopifyRefresh.totalProducts = products.length;

        // Clear processed IDs
        sspShopifyRefresh.processedIDs.length = 0;

        // Clear message
        jQuery('.refresh-message').html('<li>Received ' + products.length + ' product(s) from Shopify...</li>');

        // Kick off processing loop
        sspShopifyRefresh.processNextProduct();

    },

    processNextProduct: function () {

        // Get first product from remaining products
        var data = sspShopifyRefresh.products.shift();

        // Create the product page
        jQuery.ajax({
                type: 'POST',
                url: sspShopifyRefresh.vars.processLink,
                data: {
                    product_id: data.id,
                    product_title: data.title,
                    auto_publish: jQuery('#auto_approve').is(':checked')
                }
            })

            .fail(function (message) {
                console.log(message);
            })

            .done(function (message) {

                message = JSON.parse(message);

                jQuery('.refresh-message').prepend('<li>(' + (sspShopifyRefresh.totalProducts - sspShopifyRefresh.products.length) + ' / ' + sspShopifyRefresh.totalProducts + ') ' + message.message + '</li>');

                // Strip out the product ID and save it to a list of IDs we've processed
                var processedID = message.id;
                if (processedID.length) {
                    sspShopifyRefresh.processedIDs.push(parseInt(processedID));
                }

                if (sspShopifyRefresh.products.length > 0) {

                    // Do we have more products? If so, process the next one
                    sspShopifyRefresh.processNextProduct();

                } else {

                    // Start removing old products
                    sspShopifyRefresh.removeOldProducts();

                }
            });

    },

    removeOldProducts: function () {

        // Find product IDs without corresponding Shopify products
        jQuery.ajax({
            type: 'POST',
            url: sspShopifyRefresh.vars.getAllProductsLink
        }).done(function (message) {

            // Append message
            jQuery('.refresh-message').prepend('<li>Cleaning up products removed from Shopify...</li>');

            var sspAllProducts = JSON.parse(message);

            var extraProductPages = [];

            var product_id = jQuery('#ssp_product_id_meta_slug').val()

            sspAllProducts.forEach(function (product) {

                var productId = parseInt(product[product_id]);

                // Has this product ID not been processed?
                if (sspShopifyRefresh.processedIDs.indexOf(productId) == -1) {
                    // If it hasn't been processed, mark WP page for removal
                    extraProductPages.push(product.wp_id);
                }
            });

            if (!extraProductPages.length) {
                // No products to remove, so wrap it all up!
                jQuery('.refresh-message').prepend('<li>No old products to clean up.</li>');
                sspShopifyRefresh.completeRefresh();
                return;
            }

            // Delete old products
            jQuery.ajax({
                    type: 'POST',
                    url: sspShopifyRefresh.vars.removeOldProductsLink,
                    data: {
                        to_remove: extraProductPages.join()
                    }
                })
                .done(function (message) {
                    // Add status update and finish the process
                    jQuery('.refresh-message').prepend('<li>Removed ' + extraProductPages.length + ' old product(s).</li>');
                    sspShopifyRefresh.completeRefresh();
                });
        });

    },

    completeRefresh: function () {

        // Reenable the button
        jQuery('#ssp-refresh-button').prop('disabled', false);

        // Append "finished!" message
        jQuery('.refresh-message').prepend('<li>All products updated!</li>');

    }

};

jQuery(document).ready(function ($) {

    $('#ssp_admin_page .nav-tab-wrapper .nav-tab').on('click', function () {
        $('#ssp_admin_page .nav-tab-wrapper .nav-tab.nav-tab-active').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
    });

    sspShopifyRefresh.init();

});

