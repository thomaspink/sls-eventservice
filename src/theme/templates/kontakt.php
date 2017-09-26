<?php
  /*
   * Template Name: Kontakt
   */

    use theme\controller as controller;

    $mail = controller\MailController::inject();
    $mail->checkForm();


    $messages = controller\MessageController::getInstance();

    // var_dump($messages->getMessages());

    $context = Timber::get_context();
    $context['page'] = new Timber\Post();
    $context['messages'] = $messages->getMessages();
    Timber::render( array( 'pages/contact.twig' ), $context );

  ?>
