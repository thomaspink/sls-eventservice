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
  $template = array( 'pages/references.twig' );

  Timber::render( $template, $context );
