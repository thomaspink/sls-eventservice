<?php
  /*
   * Template Name: Kontakt
   */

    use theme\controller as controller;

    $mail = new controller\MailController();


    $context = Timber::get_context();
    $context['page'] = new Timber\Post();
    Timber::render( array( 'pages/contact.twig' ), $context );

  ?>
