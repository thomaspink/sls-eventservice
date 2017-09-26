<?php
  /*
   * Template Name: Kontakt
   */

    use theme\controller as controller;

    $mail = controller\MailController::inject();
    $mail->checkForm();

    $context = Timber::get_context();
    $context['page'] = new Timber\Post();
    $context['messages'] = $mail->getResponse();
    Timber::render( array( 'pages/contact.twig' ), $context );

  ?>
