<?php

class CustomPostTypes {

    protected $args = array();
    protected $slug = '';

    function __construct($slug, $name, $namePlural, $icon, $i18nDomain = 'sls-eventservice') {

        $this->slug = $slug;

        $labels = array(
            'name'                       => __( $namePlural, $i18nDomain . '-post-type' ),
            'singular_name'              => __( $name, $i18nDomain . '-post-type' ),
            'menu_name'                  => __( $namePlural, 'admin menu', $i18nDomain . '-post-type' ),
            'name_admin_bar'             => __( $name, 'add new on admin bar', $i18nDomain . '-post-type' ),
            'add_new'                    => __( 'Neue hinzufügen', $name, $i18nDomain . '-post-type' ),
            'add_new_item'               => __( 'Neue '.$name.' hinzufügen', $i18nDomain . '-post-type' ),
            'new_item'                   => __( 'Neue '.$name, $i18nDomain . '-post-type' ),
            'edit_item'                  => __( 'Bearbeite '.$name, $i18nDomain . '-post-type' ),
            'view_item'                  => __( 'Zeige '.$name, $i18nDomain . '-post-type' ),
            'all_items'                  => __( 'Alle '.$namePlural, $i18nDomain . '-post-type' ),
            'search_items'               => __( 'Suche '.$namePlural, $i18nDomain . '-post-type' ),
            'parent_item_colon'          => __( 'Parent '.$namePlural, $i18nDomain . '-post-type' ),
            'not_found'                  => __( 'Keine '.$namePlural.' gefunden.', $i18nDomain . '-post-type' ),
            'not_found_in_trash'         => __( 'Keine '.$namePlural.' gefunden im Papierkorb.', $i18nDomain . '-post-type' )
        );

        $this->args = array(
            'labels'                 => $labels,
            'description'            => '',
            'public'                 => true,
            'show_ui'                => true,
            'has_archive'                   => true,
            'show_in_menu'                   => true,
            'show_in_nav_menus'       => true,
            'exclude_from_search'       => false,
            'capability_type'             => 'post',
            'map_meta_cap'                   => true,
            'hierarchical'                   => false,
            'rewrite'                         => array( 'slug' => $slug, 'with_front' => true ),
            'query_var'                     => true,
            'menu_icon'                     => $icon,
            'show_in_rest'               => true,
            'rest_base'                  => $slug,
            'rest_controller_class'   => 'WP_REST_Posts_Controller',
            'supports'                  => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' )
        );

        $this->register();
    }

    public function register() {
        register_post_type( $this->slug, $this->args );
    }
}
