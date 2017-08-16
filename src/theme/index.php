<!--
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
          get_template_part( 'template-parts/post/content', 'none' );
        endwhile;
      else :
        get_template_part( 'template-parts/post/content', 'none' );
      endif;
      ?>
    </main>
    <?php get_template_part( 'template-parts/drawer/drawer', '' ); ?>
    <?php get_template_part( 'template-parts/footer/footer', '' ); ?>
  </div>
-->
