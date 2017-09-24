<?php

$gallery = array(
  'post_type' => 'gallery',
  'posts_per_page' => '-1'
);

$context = Timber::get_context();
$context['page'] = new TimberPost();
$context['hero'] = array(
  'image' => array('url' => 'http://placehold.it/900x400'),
  'title' => 'Referenzen',
  'style' => 'hero--outline'
);
$context['gallery'] = Timber::get_posts($gallery);
$template = array( 'pages/reference-detail.twig' );

Timber::render( $template, $context );
