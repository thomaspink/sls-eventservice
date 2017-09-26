<?php

  namespace theme\controller;
  use theme\lib as lib;

  require_once __DIR__ . '/FormValidation.php';
  require_once __DIR__ . '/MessageController.php';


  class MailController extends lib\Singleton {

    private static $devMailTo = 'lukas.holzer@typeflow.cc';
    private static $prodMailTo = 'office@sls-eventservice.at';
    private static $mailTo;

    private $fields;
    private $validation;
    private $response = array('error' => array(), 'success' => array(), 'warning' => array());
    private $headers = array();

    public function __construct() {
      self::$mailTo = (WP_ENV === 'development')? self::$devMailTo : self:: $prodMailTo;

      add_action('wp_mail_failed', array( $this, 'logErrors'), 10, 1);
    }

    public function checkForm() {
      if(count($_POST) === 0) {
        return;
      }

      $this->getPostQuery();

      if(!$this->validate()) {
        return;
      }

      $this->setHeaders();
      $result = wp_mail(self::$mailTo, $this->fields['subject'], $this->fields['message'], $this->headers);

      if($result) {
        $this->response['success'] = __('Ihre Nachricht wurde erfolgreich versandt!', 'sls-2017');
        return;
      }

      $this->response['error'] = __('Es trat ein Fehler beim Absenden der Nachricht auf!', 'sls-2017');
    }

    public function getResponse() {
      return $this->response;
    }

    public function getPostQuery() {
      $this->fields['name'] = $_POST['sls_name'];
      $this->fields['email'] = $_POST['sls_email'];
      $this->fields['subject'] = $_POST['sls_subject'];
      $this->fields['message'] = 'www.sls-eventservice.at <br><hr><br>' . $_POST['sls_message'];
    }

    private function validate() {

      $v = new FormValidation();
      $v->validateEmail($this->fields['email']);
      $v->validateName($this->fields['name']);

      if(!$this->fields['subject']) {
        $this->fields['subject'] = __('Kein Betreff', 'sls-2017');
      }

      if($v->getErrors()) {
        $this->response['error'] = $v->getErrors();
        return false;
      }

      return true;
    }

    private function setHeaders() {
      $this->headers[] = 'Content-Type: text/html; charset=UTF-8';
      $this->headers[] = 'From: ' . $this->fields['name'] . ' <' . $this->fields['email'] . '>';
      $this->headers[] = 'Bcc: ' . $this->fields['name'] . ' <' . $this->fields['email'] . '>';
      $this->headers[] = 'Reply-To: ' . $this->fields['name'] . ' <' . $this->fields['email'] . '>';
    }

    public function logErrors(){
      $filePath = get_template_directory() . '/core/logs/';
      $fileName = $filePath . 'mail-error.log';

      $file = fopen($fileName, 'a');
      fputs($file, "\n Mailer Error: " . $mailer->ErrorInfo ."\n");
      fclose($file);
    }

  }
