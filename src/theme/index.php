<?php

  get_header();


  $blog = array(
    'post_type' => 'post',
    'posts_per_page' => '2'
  );

  $context = Timber::get_context();
  $context['posts'] = Timber::get_posts($blog);
  $context['pagination'] = Timber::get_pagination();
  $context['multiple'] = true;
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
