<div class="main-header">
  <div class="container">
    <a href="/" role="banner" aria-label="Startseite" class="brand" tabindex="-1">
      <?php get_template_part( 'template-parts/header/header', 'logo' ); ?>
    </a>
    <button class="toggle-drawer"><i class="material-icons">menu</i></button>
    <?php wp_nav_menu( array(
      'theme_location' => 'top',
      'fallback_cb' => false,
      'menu_class' => 'main-nav__list',
      'container' => 'nav',
      'container_id' => 'main-navigation',
      'container_class' => 'main-nav',
    )); ?>
  </div>
</div>
