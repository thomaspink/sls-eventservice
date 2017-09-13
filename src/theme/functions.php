<?php

require_once __DIR__ . '/core/vendor/autoload.php';
require_once __DIR__ . '/core/requireDir.php';


$timber = new \Timber\Timber();

if ( !class_exists( 'Timber' ) ) {
    add_action( 'admin_notices',
        function () {
            echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
        } );
    return;
}

if (class_exists('Timber')) {

  includeDir(  __DIR__ . '/core/helper/' );

  require_once __DIR__ . '/core/classes/CustomPostTypes.class.php';
  require_once __DIR__ . '/core/classes/CustomTaxonomies.class.php';
  require_once __DIR__ . '/core/classes/OptionsPage.class.php';
  require_once __DIR__ . '/core/classes/WordpressSetup.class.php';
  require_once __DIR__ . '/core/classes/TimberSetup.class.php';

  includeDir(  __DIR__ . '/core/classes/Timber/' );

  // Setting Environments
  if($_SERVER['SERVER_NAME'] === 'localhost') {
    define('WP_ENV', 'development');
  } else {
    define('WP_ENV', 'production');
  }

  Timber::$dirname = array('templates', 'views');

  $GLOBALS["theme"] = new TimberSetup();

  // Routes::map('api/v1/track/:id', function($params){
  //   $query = 'post_type=song&p='.$params['id'];
  //   Routes::load('core/api/Track.class.php', null, $query, 200);
  // });

}

?>
