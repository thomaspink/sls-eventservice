<?php

  get_header();


  $context = Timber::get_context();
  $context['posts'] = array(new TimberPost());
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
