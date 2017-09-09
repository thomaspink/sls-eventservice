<?php

  get_header();


  $context = Timber::get_context();
  $context['post'] = new TimberPost();
  $template = array( 'components/post-single.twig' );

  Timber::render( $template, $context );


  get_footer();

?>
