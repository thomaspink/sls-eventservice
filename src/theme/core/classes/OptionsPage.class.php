<?php

class OptionsPage {

    protected $args = array(
    'capability'     => 'edit_posts',
    'redirect'     => false
  );

    function __construct($pageTitle, $menuTitle, $menuSlug, $i18nDomain = 'robertholzer-theme') {

    $this->args['page_title'] = __($pageTitle, $i18nDomain);
    $this->args['menu_title'] = __($menuTitle, $i18nDomain);
    $this->args['menu_slug'] = $menuSlug;
    $this->args['capability'] = 'edit_posts';

    add_action('acf/init', array($this, 'addOptionsPage'));
  }

  /**
   * The capability required for this menu to be displayed to the user.
   * Defaults to edit_posts.
     * Read more about capability here: http://codex.wordpress.org/Roles_and_Capabilities
   *
   * @param string
   */
  public function setCapability($capability) {
    $this->args['capability'] = $capability;
  }

  public function addOptionsPage() {

    try {
      if( function_exists('acf_add_options_page') ) {
        acf_add_options_page($this->args);
      } else {
        throw new Error('ACF Options Page does not exist');
      }
    } catch(\Exception $e) {
      echo $e->getMessage();
    }
  }

}
