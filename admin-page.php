<?php


/*
===========================================================
ACTION HOOKS
=========================================================== */

add_action('admin_menu', 'ssp_menu_entry');


/*
===========================================================
DECLARE PLUGIN ENTRY FOR THE ADMIN MENU
=========================================================== */
function ssp_menu_entry()
{
    add_menu_page('Smart Shopify Product Settings', 'S. Shopify Product', 'administrator', 'smart-shopify-product-settings', 'ssp_settings_page', 'dashicons-products');
}


/*
===========================================================
RENDER PLUGIN ADMIN PAGE
=========================================================== */
function ssp_settings_page()
{
    if (!current_user_can('administrator')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ?>
    <div id="ssp_admin_page" class="wrap">
        <h2>Smart Shopify Product Settings</h2>
        <hr>

        <h2 class="nav-tab-wrapper">
            <a class="nav-tab nav-tab-active" href="#">Shopify API</a>
            <a class="nav-tab" href="#">Post Type of Product</a>
            <a class="nav-tab" href="#">Shopify fields options</a>
        </h2>

        <form method="post" action="options.php">
            <?php settings_fields('smart-shopify-product-settings-group'); ?>
            <?php do_settings_sections('smart-shopify-product-settings-group'); ?>

            <div id='sections'>
                <section>

                    <table class="form-table">

                        <tr valign="top">
                            <th scope="row">API url</th>
                            <td>
                                <input type="text" name="ssp_api_url" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_api_url')); ?>"/>
                                <br/>
                                <small><strong>Eg:</strong> https://apikey:password@my-shop.myshopify.com</small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Shop url</th>
                            <td>
                                <input type="text" name="ssp_shop_url" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_shop_url')); ?>"/>
                                <br/>
                                <small><strong>Eg:</strong> my-shop.myshopify.com</small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Access Token</th>
                            <td>
                                <input type="text" name="ssp_access_token" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_access_token')); ?>"/>
                                <br/>
                                <small>A long randomize string provided by Shopify.</small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">App ID Number</th>
                            <td>
                                <input type="text" name="ssp_app_id" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_app_id')); ?>"/>
                                <br/>
                                <small>For Buy Button, usually is 6.</small>
                            </td>
                        </tr>

                    </table>

                </section>


                <section>

                    <table class="form-table">

                        <tr valign="top">
                            <th scope="row">Post Type Slug</th>
                            <td>
                                <input type="text" name="ssp_product_post_type_slug" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_product_post_type_slug')); ?>"/>
                                <br/>
                                <small>
                                    Slug of the Post Type for Products you have had created, using Toolset or another
                                    plugin for management of custom Post Type.
                                    <br/> <strong>Eg:</strong> product, shopify-product, sh-product.
                                </small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Product ID Meta Slug</th>
                            <td>
                                <input type="text" name="ssp_product_id_meta_slug" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_product_id_meta_slug')); ?>"/>
                                <br/>
                                <small>
                                    Slug of the custom field type (or meta) of Shopify Product ID, for the Product Post
                                    Type you have had created, using Toolset or another plugin for management of custom
                                    Post Type.
                                    <br/> <strong>Eg:</strong> product-id, shopify-product-id, sh-product-id.
                                    <br/> <strong>Note:</strong> Custom field created with Toolset plugin have a "wpcf-"
                                    prefix. Eg: wpcf-product-id.
                                </small>
                            </td>
                        </tr>
                    </table>

                </section>

                <section>

                    <table class="form-table">

                        <tr valign="top">
                            <th scope="row">Show Shopify price field</th>
                            <td>
                                <input type="checkbox"
                                       value="1" <?php echo checked(get_option('ssp_shopify_field_price_show', 1), 1); ?>
                                       name="ssp_shopify_field_price_show"/>
                                <br/>
                                <small>
                                    Mean that the price of Shopify products will be shown or not.
                                </small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Replacing text for Shopify price field</th>
                            <td>
                                <input type="text" name="ssp_shopify_field_price_text" size="100"
                                       value="<?php echo esc_attr(get_option('ssp_shopify_field_price_text', "")); ?>"/>
                                <br/>
                                <small>
                                    If it's not empty, the price of the Shopify products will be replaced with your
                                    replacing text. It's ideal when you don't want to show the prices to users.
                                </small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Show card Buy Button</th>
                            <td>
                                <input type="checkbox"
                                       value="1" <?php echo checked(get_option('ssp_shopify_field_card_buy_btn', 1), 1); ?>
                                       name="ssp_shopify_field_card_buy_btn" size="100"/>
                                <br/>
                                <small>
                                    If checked, the Buy Button will be shown on the product cards, for collection views
                                    or sections.
                                </small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Show details page Buy Button</th>
                            <td>
                                <input type="checkbox"
                                       value="1" <?php echo checked(get_option('ssp_shopify_field_details_buy_btn', 1), 1); ?>
                                       name="ssp_shopify_field_details_buy_btn" size="100"/>
                                <br/>
                                <small>
                                    If checked, the Buy Button will be shown on product detail pages.
                                </small>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row">Show Variant Options selector</th>
                            <td>
                                <input type="checkbox"
                                       value="1" <?php echo checked(get_option('ssp_shopify_field_variant_selector', 1), 1); ?>
                                       name="ssp_shopify_field_variant_selector" size="100"/>
                                <br/>
                                <small>
                                    If checked, the selector of the Variant Options for Shopify products will be shown.
                                    <br/> <strong>Note:</strong> Be careful. If checked and the product that is
                                    currently shown has no items available in stock for the first Variant Option, it
                                    will cause you not able to choice another variant to make shop.
                                </small>
                            </td>
                        </tr>
                    </table>

                </section>

            </div>

            <?php submit_button(); ?>

        </form>

        <?php /* Only draw 'refresh' section if plugin is linked to Shopify store */
        if (!empty(sanitize_option('ssp_api_url', get_option('ssp_api_url')))
            and !empty(sanitize_option('ssp_shop_url', get_option('ssp_shop_url')))
            and !empty(sanitize_option('ssp_app_id', get_option('ssp_app_id')))
        ) : ?>

            <hr>
            <h3>Import all products</h3>

            <form method="POST" id="refresh">

                <p class="auto-approve-wrap">
                    <input type="checkbox" name="auto_approve" value="1" id="auto_approve" checked>

                    <label for="auto_approve">Publish new products right away (set to Pending Review if
                        unchecked)</label>
                </p>

                <p class="submit">
                    <input type="hidden" name="ssp_product_id_meta_slug" id="ssp_product_id_meta_slug"
                           value="<?php echo esc_attr(get_option('ssp_product_id_meta_slug')) ?>">
                    <input type="submit" name="refresh-button" id="ssp-refresh-button" class="button"
                           value="Refresh Shopify Products">
                </p>
            </form>

            <ul class="refresh-message">

            </ul>

            <?php

        endif;

        ?>
    </div>
    <?php

}

/* ======================================================== */