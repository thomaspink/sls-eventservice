<?php
  /*
   * Template Name: Leistungen
   */

  get_header();

  $args = array(
    'post_type' => 'services',
    'posts_per_page' => '-1'
  );

  $context = Timber::get_context();
  $context['page'] = new TimberPost();
  $context['services'] = Timber::get_posts($args);

  $template = array( 'components/services-overview.twig' );

  Timber::render( $template, $context );

  get_footer(); ?>
