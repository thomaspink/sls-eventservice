<?php

  get_header();


  $context = Timber::get_context();
  $context['posts'] = array(new TimberPost());
  $context['hero'] = array(
    'image' => array('url' => 'http://placehold.it/900x400'),
    'title' => 'SLS Eventservice<br>BLOG',
    'style' => 'hero--outline'
  );
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
