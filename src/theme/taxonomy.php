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

  $blog = array(
    'post_type' => 'page',
    'pagename' => 'blog'
  );
  $blog = Timber::get_post($blog);


  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['page'] = new TimberPost();
  $context['multiple'] = true;
  $context['hero'] = $blog->get_field('hero');
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );
