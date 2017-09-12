<?php

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
  $context['hero'] = array(
    'image' => array('url' => 'http://placehold.it/900x400'),
    'title' => 'SLS Eventservice<br>BLOG',
    'style' => 'hero--outline'
  );
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );

?>
