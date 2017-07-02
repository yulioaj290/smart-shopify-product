<?php

/*
===========================================================
ACTION HOOKS
=========================================================== */

add_action('wp_ajax_ssp_auto_process_product', 'ssp_auto_process_product');
add_action('wp_ajax_ssp_auto_get_all_products', 'ssp_auto_get_all_products');
add_action('wp_ajax_ssp_auto_remove_products', 'ssp_auto_remove_products');


/*
===========================================================
AUTO PROCESSING AND ADD ALL SHOPIFY PRODUCTS TO WORDPRESS SITE
=========================================================== */
function ssp_auto_process_product()
{

    // Get the ID of the current Product
    $id = sanitize_key($_POST['product_id']);
    // Get the title of the current Product
    $title = sanitize_title($_POST['product_title'], strtolower($_POST['product_title']));
    // Get refresh options
    $auto_publish = rest_sanitize_boolean($_POST['auto_publish']) === true ? 'publish' : 'pending';

    $output = 'Error processing Product ' . $title . '!';

    // Find any existing Products that match the desired ID
    $args = array(
        'posts_per_page' => -1,
        'post_type' => sanitize_option('ssp_product_post_type_slug', get_option('ssp_product_post_type_slug')),
        'meta_key' => sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')),
        'meta_value' => $id,
        'post_status' => 'publish,private,draft,future,pending'
    );
    $posts = get_posts($args);

    if (count($posts) > 0) {

        // We have a matching Product, so let's update it
        $target_post = $posts[0];
        $args = array(
            'ID' => $target_post->ID,
            'post_title' => $title,
            'post_name' => sanitize_title($title, strtolower($title))
        );
        wp_update_post($args);

        $output = 'Updated existing Product ' . $title . '.';

    } else {

        // No matching Product, so let's create one
        $args = array(
            'post_title' => $title,
            'post_type' => sanitize_option('ssp_product_post_type_slug', get_option('ssp_product_post_type_slug')),
            'post_status' => $auto_publish,
            'meta_input' => array(sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')) => $id)
        );
        $post_id = wp_insert_post($args);

        global $wp_version;
        if ($wp_version < 4.4 and $post_id != 0) {

            // Update meta field for ID (for older WP installs)
            update_post_meta($post_id, sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')), $id);
        }

        $output = 'Added new Product ' . $title . ' (ID: ' . $id . ').';

    }

    $output = array(
        'message' => $output,
        'id' => $id
    );

    echo json_encode($output);

    die();

}


/*
===========================================================
AUTO GETTING ALL EXITING SHOPIFY PRODUCTS FROM WORDPRESS SITE
=========================================================== */
function ssp_auto_get_all_products()
{

    // Get all Products
    $args = array(
        'posts_per_page' => -1,
        'post_type' => sanitize_option('ssp_product_post_type_slug', get_option('ssp_product_post_type_slug')),
        'post_status' => 'publish'
    );
    $posts = get_posts($args);

    $output = array();

    // Create an array of WP post IDs and their attached product IDs
    foreach ($posts as $target_post) {
        $output[] = array(
            'wp_id' => $target_post->ID,
            sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')) =>
                get_post_meta($target_post->ID, sanitize_option('ssp_product_id_meta_slug', get_option('ssp_product_id_meta_slug')), true)
        );
    }

    echo json_encode($output);

    die();

}


/*
===========================================================
AUTO REMOVING ALL OLD SHOPIFY PRODUCTS FROM WORDPRESS SITE
=========================================================== */
function ssp_auto_remove_products()
{

    $posts_to_remove = explode(',', sanitize_post($_POST['to_remove']));

    // Remove a list of Products
    foreach ($posts_to_remove as $id_to_remove) {
        echo $id_to_remove;

        wp_delete_post($id_to_remove);
    }

    die();

}

/* ======================================================== */