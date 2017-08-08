<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta http-equiv="X-UA-Compatible" content="IE=EDGE">
  <meta name="viewport" content="width=device-width,minimal-ui,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="theme-color" content="#fff">
  <meta name="description" content="SLS Eventservice ist Ihr professioneller Partner für die gesamte Technik rund um Ihre Veranstaltungen. Wir freuen uns auf die Zusammenarbeit mit Ihnen!">
  <meta name="keywords" content="">
  <link rel="canonical" href="https://www.sls-eventservice.at/">
  <title><? wp_title('&raquo;', true, 'right' ); ?></title>
  <meta property="og:locale" content="de_DE">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Ihr Event - unsere Aufgabe - SLS Eventservice">
  <meta property="og:description" content="SLS Eventservice ist Ihr professioneller Partner für die gesamte Technik rund um Ihre Veranstaltungen. Wir freuen uns auf die Zusammenarbeit mit Ihnen!">
  <meta property="og:url" content="http://www.sls-eventservice.at/">
  <meta property="og:site_name" content="SLS Eventservice">
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body <?php body_class(); ?>>
  <nav class="skiplinks" role="navigation">
    <a href="#main-navigation" class="visuallyhidden focusable"><?php _e( 'Zur Hauptnavigation springen', 'sls-2017' ); ?></a>
    <a href="#main" class="visuallyhidden focusable"><?php _e( 'Zum Seiteninhalt springen', 'sls-2017' ); ?></a>
  </nav>
  <div class="root">
    <?php get_template_part( 'template-parts/header/header', '' ); ?>
    <main id="main" role="main">
      <?php
      if ( have_posts() ) :
        /* Start the Loop */
        while ( have_posts() ) : the_post();
          // Include the Post-Format-specific template for the content.
          // If you want to override this in a child theme, then include a file
          // called content-___.php (where ___ is the Post Format name) and that will be used instead.
          // get_template_part( 'template-parts/post/content', get_post_format() );
        endwhile;
      else :
        get_template_part( 'template-parts/post/content', 'none' );
      endif;
      ?>
    </main>
  </div>
</body>
</html>
