<?php
  /*
   * Template Name: Kontakt
   */

    $context = Timber::get_context();
    $context['page'] = new Timber\Post();
    Timber::render( array( 'pages/contact.twig' ), $context );

  ?>
