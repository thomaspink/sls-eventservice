<?php get_header(); ?>

<nav class="skiplinks" role="navigation">
  <a href="#main-navigation" class="visuallyhidden focusable"><?php _e( 'Zur Hauptnavigation springen', 'sls-2017' ); ?></a>
  <a href="#main" class="visuallyhidden focusable"><?php _e( 'Zum Seiteninhalt springen', 'sls-2017' ); ?></a>
</nav>
<div class="root">

  <?php get_template_part( 'template-parts/header/header', '' ); ?>

  <main id="main" role="main">

  </main>

  <?php  get_template_part( 'template-parts/drawer/drawer', '' ); ?>
  <?php  get_template_part( 'template-parts/footer/footer', '' ); ?>

</div>

<?php get_footer(); ?>
