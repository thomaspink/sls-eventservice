<?php

namespace theme\controller;

require_once __DIR__ . '/MessageController.php';

class FormValidation {

  private $messages;
  private $error = false;

  public function __construct() {
    $this->messages = MessageController::getInstance();
  }

  public function getErrors() {
    if($this->error) {
      return true;
    }

    return false;
  }

  public function validateName($name) {
    if(strlen($name) < 3) {
      $this->messages->addError('Bitte geben Sie einen Namen an!');
      $this->error = true;
      return false;
    }

    // Check for whitespace (First name and last name)
    if(!preg_match('/\s/', $name)) {
      $this->messages->addError('Bitte geben Sie einen Vor- und Nachnamen an.');
      $this->error = true;
      return false;
    }

    return true;
  }

  public function validateEmail($email) {
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return true;
    } else {
      $this->messages->addError('Keine gültige E-Mail Adresse wurde angegeben.');
      $this->error = true;
      return false;
    }
  }
}
