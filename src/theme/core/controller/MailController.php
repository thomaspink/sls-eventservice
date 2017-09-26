<?php

  namespace theme\controller;
  use theme\lib as lib;

  class MailController extends lib\Singleton {

    private static $devMailTo = 'lukas.holzer@typeflow.cc';
    private static $prodMailTo = 'office@sls-eventservice.at';
    private static $mailTo;

    private $name;
    private $email;
    private $subject;
    private $message;

    private $headers = array('Content-Type: text/html; charset=UTF-8');

    public function __construct() {
      self::$mailTo = (WP_ENV === 'development')? self::$devMailTo : self:: $prodMailTo;

      if(count($_POST) != 0) {
        $this->getPostQuery();
      }

      add_action('wp_mail_failed', array( $this, 'logErrors'), 10, 1);
    }

    public function getPostQuery() {
      $this->name = $_POST['name'];
      $this->email = $_POST['email'];
      $this->subject = $_POST['subject'];
      $this->message = $_POST['message'];

      echo $this-name;
    }

    public function logErrors(){
      $filePath = get_template_directory() . '/core/logs/';
      $fileName = $filePath . 'mail-error.log';

      $file = fopen($fileName, 'a');
      fputs($file, "\n Mailer Error: " . $mailer->ErrorInfo ."\n");
      fclose($file);
    }

  }
