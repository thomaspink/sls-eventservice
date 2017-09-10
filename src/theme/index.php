<?php

  get_header();

  global $paged; // current page
  if (!isset($paged) || !$paged){
      $paged = 1;
  }

  $args = array(
    'post_type' => 'post',
    'posts_per_page' => 2,
    'paged' => $paged
);
  $context = Timber::get_context();
  $context['posts'] = new Timber\PostQuery($args);
  $context['multiple'] = true;
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
