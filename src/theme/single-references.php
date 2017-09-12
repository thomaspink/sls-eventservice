<?php

$context = Timber::get_context();
$context['page'] = array(new TimberPost());
$context['hero'] = array(
  'image' => array('url' => 'http://placehold.it/900x400'),
  'title' => 'Referenzen',
  'style' => 'hero--outline'
);
$template = array( 'pages/reference-detail.twig' );

Timber::render( $template, $context );
