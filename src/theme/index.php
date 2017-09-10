<?php

  get_header();

  $header['style'] = array('hero--large');
  $header['image'] = get_field('header_image');
  $header['title'] = get_field('header_text');

  $blog = array(
    'post_type' => 'post',
    'posts_per_page' => '3'
  );

  $context = Timber::get_context();
  $context['posts'] = Timber::get_posts($blog);
  $posts = array( 'components/post-overview.twig' );

  $swiper = array();

  Timber::render( array( 'components/hero.twig' ), $header );

  printf('<div class="container">');

  if(have_posts()) : while(have_posts()) : the_post();

    the_content();

  endwhile; endif;

  printf('</div>');

  Timber::render( array( 'components/swiper.twig' ), $swiper );

  printf('<div class="container">');

  printf('<h2>SLS – Blog</h2>');

  Timber::render( $posts , $context );

  printf('</div>');

  get_footer();
?>
