<?php

  $term_slug = get_query_var( 'term' );
  $taxonomyName = get_query_var( 'taxonomy' );
  $term = get_term_by( 'slug', $term_slug, $taxonomyName );

  $args = array(
    'post_type' => 'post',
    'posts_per_page' => -1,
    'paged' => 1,
    'tax_query' => array(
      array(
          'taxonomy' => $term->taxonomy,
          'field' => 'term_id',
          'terms' => $term->term_id,
      )
    )
  );

  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['page'] = new TimberPost();
  $context['multiple'] = true;
  $context['hero'] = array(
    'image' => array('url' => 'http://placehold.it/900x400'),
    'title' => 'SLS Eventservice<br>BLOG',
    'style' => 'hero--outline'
  );
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );
