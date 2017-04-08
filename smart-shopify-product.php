<?php
/**
 * Plugin Name: Smart Shopify Product
 * Plugin URI: http://www.com
 * Description: This plugin allows add some shortcodes on post to insert Shopify products. Also allow to retrieve automatically all products on the shopify store.
 * Version: 1.0.0
 * Author: Yulio Aleman Jimenez
 * Author URI: http://yulioaj290.com
 * License: GPL2
 */ 

add_action('admin_menu', 'ssp_menu');

function ssp_menu() {
	add_menu_page('Smart Shopify Product Settings', 'Smart Shopify Product', 'administrator', 'smart-shopify-product-settings', 'ssp_settings_page', 'dashicons-products');
}

function ssp_settings_page() {
   if ( !current_user_can( 'administrator' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
   
   ?>
   <div class="wrap">
      <h2>Staff Details</h2>

      <form method="post" action="options.php">
         <?php settings_fields( 'smart-shopify-product-settings-group' ); ?>
         <?php do_settings_sections( 'smart-shopify-product-settings-group' ); ?>
         <table class="form-table">
            <tr valign="top">
               <th scope="row">API url</th>
               <td>
                  <input type="text" name="api_url" size="60" value="<?php echo esc_attr( get_option('api_url') ); ?>" />
                  <br />
                  <small>Eg: https://apikey:password@my-shop.myshopify.com</small>
               </td>
            </tr>

            <tr valign="top">
               <th scope="row">Shop url</th>
               <td>
                  <input type="text" name="shop_url" value="<?php echo esc_attr( get_option('shop_url') ); ?>" />
                  <br />
                  <small>Eg: my-shop.myshopify.com</small>
               </td>
            </tr>

            <tr valign="top">
               <th scope="row">Access Token</th>
               <td>
                  <input type="text" name="access_token" value="<?php echo esc_attr( get_option('access_token') ); ?>" />
                  <br />
                  <small>A long randomize string provided by Shopify.</small>
               </td>
            </tr>

            <tr valign="top">
               <th scope="row">App ID Number</th>
               <td>
                  <input type="text" name="app_id" value="<?php echo esc_attr( get_option('app_id') ); ?>" />
                  <br />
                  <small>For Buy Button, usually is 6.</small>
               </td>
            </tr>
         </table>

         <?php submit_button(); ?>

      </form>
   </div>
<?php
   
}

add_action( 'admin_init', 'ssp_settings' );
	
function ssp_settings() {
   register_setting( 'smart-shopify-product-settings-group', 'api_url' );
   register_setting( 'smart-shopify-product-settings-group', 'shop_url' );
   register_setting( 'smart-shopify-product-settings-group', 'access_token' );
   register_setting( 'smart-shopify-product-settings-group', 'app_id' );
}
