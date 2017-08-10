<?php
$legalMenu = wp_nav_menu( array(
  'theme_location' => 'legal',
  'fallback_cb' => false,
  'container' => false,
  'echo' => false,
  'items_wrap' => '%3$s',
  'depth' => 0,
));
?>
<div class="legal-footer">
  <div class="container">
    <span><?= strip_tags($legalMenu, '<a>' );?></span>
    &copy; 2017 SLS EVENTSERVICE
  </div>
</div>


