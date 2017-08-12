<side-drawer aria-hidden="true">
  <nav class="side-drawer__nav">
    <button class="side-drawer__close"></button>
    <?php wp_nav_menu( array(
        'theme_location' => 'top',
        'fallback_cb' => false,
        'menu_class' => 'side-drawer__list',
        'container' => false
      )); ?>
  </nav>
</side-drawer>
