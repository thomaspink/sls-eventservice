<?php

  get_header();


  $context = Timber::get_context();
  $context['post'] = new TimberPost();
  $template = array( 'pages/post-single.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
