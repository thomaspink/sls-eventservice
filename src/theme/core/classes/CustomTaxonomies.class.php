<?php

class CustomTaxonomies {

  protected $args = array();
  protected $slug = '';
  protected $registerFor;
  protected $hirarchy;

    function __construct($slug, $name, $namePlural, $hirarchy = false, $registerFor = array('post'), $i18nDomain = 'sls-eventservice') {
      $this->slug = $slug;
      $this->registerFor = $registerFor;
      $this->hirarchy = $hirarchy;

      $labels = array(
        'menu_name' => __( $namePlural, $i18nDomain . '-taxonomy' ),
        'name' => _x( $namePlural, $i18nDomain . '-taxonomy'  ),
        'singular_name' => _x( $name, $i18nDomain . '-taxonomy'  ),
        'search_items' =>  __( 'Search ' . $namePlural, $i18nDomain . '-taxonomy'  ),
        'popular_items' => __( 'Popular ' . $namePlural, $i18nDomain . '-taxonomy'  ),
        'all_items' => __( 'All ' . $namePlural, $i18nDomain . '-taxonomy'  ),
        'parent_item' => null,
        'parent_item_colon' => null,
        'edit_item' => __( 'Edit ' . $name, $i18nDomain . '-taxonomy'  ),
        'update_item' => __( 'Update ' . $name, $i18nDomain . '-taxonomy'  ),
        'add_new_item' => __( 'Add New ' . $name, $i18nDomain . '-taxonomy'  ),
        'new_item_name' => __( 'New ' . $name. ' Name', $i18nDomain . '-taxonomy'  ),
        'separate_items_with_commas' => __( 'Separate ' . $namePlural . ' with commas', $i18nDomain . '-taxonomy'  ),
        'add_or_remove_items' => __( 'Add or remove ' . $namePlural, $i18nDomain . '-taxonomy'  ),
        'choose_from_most_used' => __( 'Choose from the most used ' . $namePlural, $i18nDomain . '-taxonomy'  )
      );

      $this->args = array(
        'hierarchical' => $this->hirarchy,
        'labels' => $labels,
        'show_ui' => true,
        'public' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_admin_column' => false,
        'update_count_callback' => '_update_post_term_count',
        'query_var' => true
      );

      $this->register();
    }

    public function register() {
      register_taxonomy($this->slug, $this->registerFor, $this->args);
    }
}
