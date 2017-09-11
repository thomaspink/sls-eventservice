<?php
  /*
   * Template Name: Referenzen
   */

  get_header();
  // $args = array(
  //   'post_type' => 'references',
  //   'posts_per_page' => 2,
  //   'paged' => $paged
  // );

  $context = Timber::get_context();
  // $context['references'] = new Timber\PostQuery($args);
  // $context['hero'] = array(
  //   'image' => array('url' => 'http://placehold.it/900x400'),
  //   'title' => 'SLS Eventservice<br>BLOG',
  //   'style' => 'hero--outline'
  // );
  $template = array( 'pages/reference-detail.twig' );

  Timber::render( $template, $context );


  get_footer();
