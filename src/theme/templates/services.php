<?php
  /*
   * Template Name: Leistungen
   */

  $args = array(
    'post_type' => 'services',
    'posts_per_page' => '-1'
  );

  $context = Timber::get_context();
  $context['page'] = new TimberPost();
  $context['services'] = Timber::get_posts($args);

  $template = array( 'pages/services.twig' );

  Timber::render( $template, $context );
