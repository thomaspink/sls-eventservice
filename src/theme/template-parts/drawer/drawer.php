<side-drawer aria-hidden="true">
  <?php wp_nav_menu( array(
      'theme_location' => 'top',
      'fallback_cb' => false,
      'menu_class' => 'side-drawer__list',
      'container' => 'nav',
      'container_class' => 'side-drawer__nav',
    )); ?>
</side-drawer>
