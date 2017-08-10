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
  ));
}
add_action( 'after_setup_theme', 'sls_setup' );

?>
