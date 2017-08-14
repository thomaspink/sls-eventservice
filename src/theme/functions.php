<?php

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function sls_setup() {
  // Make theme available for translation.
  // Translations can be filed at WordPress.org. See: https://translate.wordpress.org/projects/wp-themes/twentyseventeen
  load_theme_textdomain( 'sls-2017' );

  // Let WordPress manage the document title.
  // By adding theme support, we declare that this theme does not use a
  // hard-coded <title> tag in the document head, and expect WordPress to
  // provide it for us.
  add_theme_support( 'title-tag' );

  // Switch default core markup for search form, comment form, and comments
  // to output valid HTML5.
  add_theme_support( 'html5', array(
    'comment-form',
    'comment-list',
    'gallery',
    'caption',
  ));

  // This theme uses wp_nav_menu() in multiple locations.
  register_nav_menus( array(
    'top'    => __( 'Top Menu', 'sls-2017' ),
    'drawer' => __( 'Drawer Menu', 'sls-2017' ),
    'social' => __( 'Social Links Menu', 'sls-2017' ),
    'legal' => __( 'Footer Legal Links', 'sls-2017' ),
    'partner' => __( 'Footer Partner Links', 'sls-2017' ),
    'downloads' => __( 'Footer Download Links', 'sls-2017' ),
  ));
}
add_action( 'after_setup_theme', 'sls_setup' );


// Register Custom Post Type Leistung
// Post Type Key: leistung
function create_services_cpt() {
  $labels = array(
    'name' => __( 'Leistungen', 'Post Type General Name', 'sls-2017' ),
    'singular_name' => __( 'Leistung', 'Post Type Singular Name', 'sls-2017' ),
    'menu_name' => __( 'Leistungen', 'sls-2017' ),
    'name_admin_bar' => __( 'Leistung', 'sls-2017' ),
    'archives' => __( 'Leistung Archive', 'sls-2017' ),
    'attributes' => __( 'Leistung Attribute', 'sls-2017' ),
    'parent_item_colon' => __( 'Eltern Leistung:', 'sls-2017' ),
    'all_items' => __( 'Alle Leistungen', 'sls-2017' ),
    'add_new_item' => __( 'Leistung erstellen', 'sls-2017' ),
    'add_new' => __( 'Erstellen', 'sls-2017' ),
    'new_item' => __( 'Leistung erstellen', 'sls-2017' ),
    'edit_item' => __( 'Bearbeite Leistung', 'sls-2017' ),
    'update_item' => __( 'Aktualisiere Leistung', 'sls-2017' ),
    'view_item' => __( 'Leistung anschauen', 'sls-2017' ),
    'view_items' => __( 'Leistungen anschauen', 'sls-2017' ),
    'search_items' => __( 'Suche Leistung', 'sls-2017' ),
    'not_found' => __( 'Keine Leistungen gefunden.', 'sls-2017' ),
    'not_found_in_trash' => __( 'Keine Leistungen im Papierkorb gefunden.', 'sls-2017' ),
    'featured_image' => __( 'Beitragsbild', 'sls-2017' ),
    'set_featured_image' => __( 'Beitragsbild festlegen', 'sls-2017' ),
    'remove_featured_image' => __( 'Beitragsbild entfernen', 'sls-2017' ),
    'use_featured_image' => __( 'Als Beitragsbild verwenden', 'sls-2017' ),
    'insert_into_item' => __( 'In Leistung einfügen', 'sls-2017' ),
    'uploaded_to_this_item' => __( 'Zu diesem Leistung hochgeladen', 'sls-2017' ),
    'items_list' => __( 'Leistungen Liste', 'sls-2017' ),
    'items_list_navigation' => __( 'Leistungen Liste Navigation', 'sls-2017' ),
    'filter_items_list' => __( 'Filter Leistungen Liste', 'sls-2017' ),
  );
  $args = array(
    'label' => __( 'Leistung', 'sls-2017' ),
    'description' => __( '', 'sls-2017' ),
    'labels' => $labels,
    'menu_icon' => 'dashicons-star-filled',
    'supports' => array('title', 'editor', 'thumbnail', ),
    'taxonomies' => array(),
    'public' => true,
    'show_ui' => true,
    'show_in_menu' => true,
    'menu_position' => 5,
    'show_in_admin_bar' => true,
    'show_in_nav_menus' => true,
    'can_export' => true,
    'has_archive' => false,
    'hierarchical' => false,
    'exclude_from_search' => true,
    'show_in_rest' => true,
    'publicly_queryable' => true,
    'capability_type' => 'post',
  );
  register_post_type( 'service', $args );
}
add_action( 'init', 'create_services_cpt', 0 );

?>
