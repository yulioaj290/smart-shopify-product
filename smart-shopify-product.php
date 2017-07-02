<?php
/**
 * Plugin Name: Smart Shopify Product
 * Plugin URI: https://github.com/yulioaj290/smart-shopify-product
 * Description: This plugin allows add some shortcodes on post to insert Shopify products. Also allow to retrieve automatically all products on the shopify store.
 * Version: 1.0.2
 * Author: Yulio Aleman Jimenez
 * Author URI: https://www.linkedin.com/in/yulioaj290/
 * License: GPL2
 */


/*
===========================================================
ACTION HOOKS
=========================================================== */

add_action('wp_enqueue_scripts', 'ssp_enqueued_assets');
add_action('admin_enqueue_scripts', 'ssp_admin_enqueued_assets');
add_action('admin_init', 'ssp_settings_options');
add_action('wp_head', 'ssp_deactivate_iphone_auto_detection');


/*
===========================================================
REQUIRED PLUGIN FILES
===========================================================
ajax-functions.php  -> Contain all functions for sync and process Shopify products automatically.
shortcodes.php      -> Contain all shortcodes to insert Shopify product info into Wordpress.
admin-page.php      -> Contain all functions to insert the admin page of the plugin.
=========================================================== */

require_once('ajax-functions.php');
require_once('shortcodes.php');
require_once('admin-page.php');

/* ======================================================== */


/*
===========================================================
ENQUEUE FRONTEND ASSETS
=========================================================== */
function ssp_enqueued_assets()
{
    wp_enqueue_style('ssp-shopify-styles', plugin_dir_url(__FILE__) . 'public/css/shopify-styles.css');

    wp_enqueue_script('ssp-shopify-cdn', '//sdks.shopifycdn.com/js-buy-sdk/v0/latest/shopify-buy.umd.polyfilled.min.js', array('jquery'), '1.0', true);
    wp_enqueue_script('bts-button', plugin_dir_url(__FILE__) . 'public/js/button.js', false, '1.0', true);
    wp_enqueue_script('ssp-shopify-scripts', plugin_dir_url(__FILE__) . 'public/js/shopify-scripts.js', array(
        'jquery',
        'ssp-shopify-cdn'
    ), '1.0', true);

    wp_localize_script('ssp-shopify-scripts', 'sspShopifyVars', array(
        'apiKey' => sanitize_option('ssp_access_token', get_option('ssp_access_token')),
        'domain' => ssp_remove_protocol(esc_url(get_option('ssp_shop_url'))),
        'appId' => sanitize_option('ssp_app_id', get_option('ssp_app_id'))
    ));
}


/*
===========================================================
ENQUEUE ADMIN ASSETS
=========================================================== */
function ssp_admin_enqueued_assets()
{
    wp_enqueue_style('ssp-css-tabed-admin-menu', plugin_dir_url(__FILE__) . 'public/css/tabed-admin-menu.css');

    wp_enqueue_script('jquery');
    wp_enqueue_script('ssp-js-tabed-admin-menu', plugin_dir_url(__FILE__) . 'public/js/tabed-admin-menu.js', array('jquery'), '1.0.0', true);

    wp_enqueue_script('ssp-shopify-sdk', '//sdks.shopifycdn.com/js-buy-sdk/latest/shopify-buy.polyfilled.globals.min.js', 'jquery', '1.0', true);
    wp_enqueue_script('ssp-js-shopify-refresh', plugin_dir_url(__FILE__) . 'public/js/shopify-refresh.js', array(
        'jquery',
        'ssp-shopify-sdk'
    ), '1.0', true);

    wp_localize_script('ssp-js-shopify-refresh', 'sspShopifyVars', array(
        'apiKey' => sanitize_option('ssp_access_token', get_option('ssp_access_token')),
        'domain' => ssp_remove_protocol(esc_url(get_option('ssp_shop_url'))),
        'appId' => sanitize_option('ssp_app_id', get_option('ssp_app_id')),
        'processLink' => get_admin_url(null, '/admin-ajax.php?action=ssp_auto_process_product'),
        'getAllProductsLink' => get_admin_url(null, '/admin-ajax.php?action=ssp_auto_get_all_products'),
        'removeOldProductsLink' => get_admin_url(null, '/admin-ajax.php?action=ssp_auto_remove_products')
    ));
}


/*
===========================================================
REGISTER ALL SETTING OPTIONS FOR THE PLUGIN
=========================================================== */
function ssp_settings_options()
{
    register_setting('smart-shopify-product-settings-group', 'ssp_api_url');
    register_setting('smart-shopify-product-settings-group', 'ssp_shop_url');
    register_setting('smart-shopify-product-settings-group', 'ssp_access_token');
    register_setting('smart-shopify-product-settings-group', 'ssp_app_id');

    register_setting('smart-shopify-product-settings-group', 'ssp_product_post_type_slug');
    register_setting('smart-shopify-product-settings-group', 'ssp_product_id_meta_slug');

    register_setting('smart-shopify-product-settings-group', 'ssp_shopify_field_price_show');
    register_setting('smart-shopify-product-settings-group', 'ssp_shopify_field_price_text');
    register_setting('smart-shopify-product-settings-group', 'ssp_shopify_field_card_buy_btn');
    register_setting('smart-shopify-product-settings-group', 'ssp_shopify_field_details_buy_btn');
    register_setting('smart-shopify-product-settings-group', 'ssp_shopify_field_variant_selector');

    // register_setting( 'smart-shopify-product-settings-group', 'ssp_product_id_meta_slug' );
}


/*
===========================================================
DEACTIVATE iPHONE AUTO DETECTION OF TELEPHONE NUMBERS
=========================================================== */

function ssp_deactivate_iphone_auto_detection()
{
    ?>
    <meta name="format-detection" content="telephone=no">
    <?php

    // <!-- Use phone links to explicitly create a link. -->
    // <p>A phone number: <a href="tel:1-408-555-5555">1-408-555-5555</a></p>
}


/*
===========================================================
REMOVE HTTP/HTTPS PROTOCOL OF A LINK
=========================================================== */
function ssp_remove_protocol($domain)
{
    $domain = preg_replace('/^https?:\/\//', '', $domain);

    return $domain;
}

function ssp_auto_import_shopify_products($id, $title)
{

    // auto create product

    $args = array(
        'fields' => 'ids',
        'post_type' => 'product',
        'meta_query' => array(
            array(
                'key' => 'wpcf-product-id',
                'value' => $id
            )
        )
    );

    $my_query = new WP_Query($args);

    if (empty($my_query->have_posts())) {

        $today = date("F j, Y, g:i a");
        $post_ID = get_the_ID();
        $create_record_fields = array(
            'post_title' => $title,
            'post_type' => sanitize_option('ssp_product_post_type_slug', get_option('ssp_product_post_type_slug')),
            'post_status' => 'publish'
        );

        if ($_POST["log_time"] = "true") {
            $new_post_id = wp_insert_post($create_record_fields);
            update_post_meta($new_post_id, 'wpcf-post_title', $title);
            update_post_meta($new_post_id, 'wpcf-post_type', sanitize_option('ssp_product_post_type_slug', get_option('ssp_product_post_type_slug')));
            update_post_meta($new_post_id, 'wpcf-post-status', 'publish');
            update_post_meta($new_post_id, sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')), $id);

        }

    }
}

/* ======================================================== */
