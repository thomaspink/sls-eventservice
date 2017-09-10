<?php

  get_header();

  $blog = array(
    'post_type' => 'post',
    'posts_per_page' => '3'
  );

  $context = Timber::get_context();

  $context['hero']['style'] = array('hero--large');
  $context['hero']['image'] = get_field('header_image');
  $context['hero']['title'] = get_field('header_text');

  $context['page'] = new Timber\Post();
  $context['swiper'] = get_field('slides');
  $context['posts'] = Timber::get_posts($blog);

  Timber::render( array( 'components/home.twig' ), $context );

  get_footer();
?>
