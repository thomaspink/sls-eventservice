<?php

  $blog = array(
    'post_type' => 'page',
    'pagename' => 'blog'
  );
  $context = Timber::get_context();
  $blog = Timber::get_post($blog);

  $context['posts'] = array(new TimberPost());
  $context['page'] = new TimberPost();
  $context['hero'] = $blog->get_field('hero');
  $template = array( 'pages/blog.twig' );

  Timber::render( $template, $context );
