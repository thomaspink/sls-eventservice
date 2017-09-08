<?php

  get_header();

  $header['style'] = array('hero--large');
  $header['image'] = get_field('header_image');
  $header['title'] = get_field('header_text');

  Timber::render( array( 'components/hero.twig' ), $header );

  get_footer();
?>
