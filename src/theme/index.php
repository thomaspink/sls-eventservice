<?php

  get_header();

  $header['style'] = array('hero--large');
  $header['image'] = get_field('header_image');
  $header['title'] = get_field('header_text');

  Timber::render( array( 'components/hero.twig' ), $header );

  printf('<div class="container">');

  if(have_posts()) : while(have_posts()) : the_post();

    the_content();

  endwhile; endif;

  printf('</div>');

  Timber::render( array( 'components/swiper.twig' ), $header );

  get_footer();
?>
