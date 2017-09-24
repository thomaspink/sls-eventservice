<?php
  /*
   * Template Name: Referenzen
   */

  $args = array(
    'post_type' => 'references',
    'posts_per_page' => 4
  );

  $gallery = array(
    'post_type' => 'gallery',
    'posts_per_page' => '-1'
  );


  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['page'] = new Timber\Post();
  $context['gallery'] = Timber::get_posts($gallery);
  $template = array( 'pages/references.twig' );

  Timber::render( $template, $context );
