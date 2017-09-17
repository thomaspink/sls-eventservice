<?php
  /*
   * Template Name: Referenzen
   */

  $args = array(
    'post_type' => 'references',
    'posts_per_page' => 4
  );

  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['page'] = new Timber\Post();
  $template = array( 'pages/references.twig' );

  Timber::render( $template, $context );
