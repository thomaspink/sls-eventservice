<?php

  get_header();


  $args = array(
    'post_type' => 'post',
    'posts_per_page' => 1,
    'paged' => 1
);
  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['multiple'] = true;
  $template = array( 'pages/blog.twig' );


  Timber::render( $template, $context );


  get_footer();

?>
