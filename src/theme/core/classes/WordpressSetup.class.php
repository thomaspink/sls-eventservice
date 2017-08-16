<?php

class WordpressSetup {
  protected $version;
  protected $assets_path;
  protected $theme_path;
  protected $theme_uri;
  protected $assets_manifest;

  private static $ACF_PATH = '/core/acf';

  function __construct() {
    $this->theme_path = get_template_directory() . '/assets/';
    $this->theme_uri = get_template_directory_uri() . '/assets/';
    $this->assets_manifest = (WP_ENV === 'development')? '' : $this->getHashes();

    $this->version = wp_get_theme()->get( 'Version' );
    $this->assets_path = (WP_ENV === 'development')? 'http://localhost:4000/assets/': $this->theme_uri;

    load_theme_textdomain( 'sls-2017' );

    add_theme_support( 'title-tag' );
    add_theme_support( 'post-formats' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'menus' );
    add_theme_support( 'html5', array(
      'comment-form',
      'comment-list',
      'gallery',
      'caption',
    ));


    add_action('init', array($this, 'register_custom_post_types'));
    add_action('init', array($this, 'register_custom_taxonomies'));
    add_action('init', array($this, 'register_menus'));

    add_action( 'after_setup_theme', array($this, 'custom_header_setup'));
    add_action('wp_enqueue_scripts',  array($this, 'add_theme_scripts_and_styles'));


    // currently out of function -> does not work in case of any reasons…
    wp_enqueue_script( 'polyfills-defer', $this->assets('polyfills.js'), array(), $this->version, true );
    wp_enqueue_script( 'vendor-defer', $this->assets('vendor.js'), array('polyfills-defer'), $this->version, true );
    wp_enqueue_script( 'app-defer', $this->assets('app.js'), array('vendor-defer'), $this->version, true );

    // // in development use .js files for HMR reloading styles

    if(!is_admin()) {
      if(WP_ENV === 'development') {
        wp_enqueue_script( 'inline', $this->assets('inline.js'), array('app-defer'), $this->version, true );
        wp_enqueue_script( 'main', $this->assets('main.js'), array('inline'), $this->version, true );
      } else {
        wp_enqueue_style( 'inline', $this->assets('inline.css'), array(), $this->version);
        wp_enqueue_style( 'main', $this->assets('main.css'), array(), $this->version);
      }
    }

    add_action( 'admin_menu', array($this, 'remove_menus'));
    add_action( 'admin_menu', array($this, 'remove_unused_menu_pages'));


    // clean up wordpress
    add_theme_support('soil-clean-up');
    add_theme_support('soil-disable-asset-versioning');
    add_theme_support('soil-disable-trackbacks');
    add_theme_support('soil-google-analytics', 'UA-XXXXX-Y');
    add_theme_support('soil-jquery-cdn');
    add_theme_support('soil-js-to-footer');
    add_theme_support('soil-nav-walker');
    add_theme_support('soil-nice-search');
    add_theme_support('soil-relative-urls');

    add_filter('acf/settings/save_json', array($this, 'change_acf_path'));
    add_filter('acf/settings/load_json',  array($this, 'sync_acf_settings'));

    if(!is_admin()) {
      add_filter('script_loader_tag', array($this, 'async_defer_scripts'), 10, 3);
      add_filter('style_loader_tag', array($this, 'inline_styles'), 10, 4);
    }

    // $options = new OptionsPage('Allgemeine Theme Konfiguration', 'Theme Konfiguration', 'theme-options');
    // $function = $options->addOptionsPage();
    // var_dump($options);
  }

  public function get_version() {
    return $this->version;
  }

  public function register_menus() {
    register_nav_menus(
      array(
        'top'    => __( 'Top Menu', 'sls-2017' ),
        'drawer' => __( 'Drawer Menu', 'sls-2017' ),
        'social' => __( 'Social Links Menu', 'sls-2017' ),
        'legal' => __( 'Footer Legal Links', 'sls-2017' ),
        'partner' => __( 'Footer Partner Links', 'sls-2017' ),
        'downloads' => __( 'Footer Download Links', 'sls-2017' ),
      )
    );
  }

  // Remove menus from the admin page
  public function remove_menus(){
      remove_menu_page('edit-tags.php?taxonomy=post_tag'); // Post tags
      remove_menu_page('edit-tags.php?taxonomy=category'); // categories
  }

  public function remove_unused_menu_pages() {
    remove_menu_page('link-manager.php');
    // remove_menu_page('tools.php');
    remove_menu_page('edit-comments.php');
  }

  public function register_custom_post_types() {
    $repertoire = new CustomPostTypes('services', 'Leistung', 'Leistungen', 'dashicons-testimonial');
    $press = new CustomPostTypes('jobs', 'Job', 'Jobs', 'dashicons-testimonial');
    $gallery = new CustomPostTypes('references', 'Referenz', 'Referenzen', 'dashicons-format-gallery');
  }

  public function register_custom_taxonomies() {

  }

  public function change_acf_path( $path ) {
    $path = get_template_directory() . self::$ACF_PATH;
    return $path;
  }

  public function sync_acf_settings( $path ) {
    unset($path[0]);
    $path[] = get_template_directory() . self::$ACF_PATH;
    return $path;
  }

  public function add_theme_scripts_and_styles() {
    wp_enqueue_script( 'polyfills-defer', $this->assets('polyfills.js'), array(), $this->version, true );
    wp_enqueue_script( 'vendor-defer', $this->assets('vendor.js'), array('polyfills-defer'), $this->version, true );
    wp_enqueue_script( 'app-defer', $this->assets('app.js'), array('vendor-defer'), $this->version, true );

    // in development use .js files for HMR reloading styles
    if(WP_ENV === 'development') {
      wp_enqueue_script( 'inline', $this->assets('inline.js'), array('app-defer'), $this->version, true );
      wp_enqueue_script( 'main', $this->assets('main.js'), array('inline'), $this->version, true );
    } else {
      wp_enqueue_style( 'inline', $this->assets('inline.css'), array(), $this->version);
      wp_enqueue_style( 'main', $this->assets('main.css'), array(), $this->version);
    }
  }

  public function async_defer_scripts($tag, $handle, $src) {
    if(WP_ENV === 'development') {
      return $tag;
    }
    $param = '';
    if ( strpos($handle, '-async') !== false ) $param = 'async ';
    if ( strpos($handle, '-defer') !== false ) $param .= 'defer ';
    if ( $param ) {
        $tag = sprintf("<script %s type=\"text/javascript\" src=\"%s\"></script>\n", $param, $src);
    }
    return $tag;
  }

  public function inline_styles($html, $handle, $href, $media) {
    if(WP_ENV === 'development') {
      return $html;
    }
    if($handle === 'inline') {
      $inline = file_get_contents($this->theme_path . $this->assets_manifest['inline.css']);
      $html = sprintf("\n<style type=\"text/css\">\n%s\n</style>\n", $inline);
    }
    return $html;
  }

  private function getHashes() {

    $hashstring = file_get_contents( get_template_directory() . '/assets/build-manifest.json');
    $hashfile = json_decode($hashstring, true);

    return $hashfile;
  }

  private function assets($filename) {
    if(WP_ENV === 'development') {
      return $this->assets_path . $filename;
    } else {
      return $this->assets_path . $this->assets_manifest[$filename];
    }
  }

  public function get_menu_items($menu_name){
    if ( ( $locations = get_nav_menu_locations() ) && isset( $locations[ $menu_name ] ) ) {
      $menu = wp_get_nav_menu_object( $locations[ $menu_name ] );
      $menu_items = wp_get_nav_menu_items($menu->term_id);
      $theidlist = array();
      foreach ( (array) $menu_items as $key => $menu_item ) {
        $theidlist[] = $menu_item->object_id;
      }
      return $theidlist;
    } else {
      throw new \Exception('Menu: <b>'.$menu_name.'</b> not set or can\'t get locaction');
    }
  }

  public function extract_component_name_from_template_file() {
    $template_file = get_page_template();
    $from = '/';
    $to = '.';
    $string = substr($template_file, strrpos($template_file, $from) + strlen($from));
    if (strstr ($string, $to, true) !== false) {
        $string = strstr($string, $to, true);
    }
    return $string;
  }

  public function custom_header_setup() {
    $args = array(
     // 'default-image'         => $this->assets('default_header.jpg'), // Default Header Image to display
      'width'                 => 1442, // Header image width (in pixels)
      'flex-height'           => true,
      'height'                => 1026, // Header image height (in pixels)
    );
    add_theme_support( 'custom-header', $args );
  }
}
