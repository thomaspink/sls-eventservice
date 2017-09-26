<?php

namespace theme\controller;

require_once __DIR__ . '/MessageController.php';

class FormValidation {

  private $errors = array();

  public function __construct() {
    $this->messages = MessageController::inject();
  }

  public function getErrors() {
    if(count($this->errors) > 0) {
      return $this->errors;
    }

    return false;
  }

  public function validateName($name) {
    if(strlen($name) < 3) {
      $this->messages->addError('Bitte geben Sie einen Namen an!');
      return false;
    }

    // Check for whitespace (First name and last name)
    if(!preg_match('/\s/', $name)) {
      $this->messages->addError('Bitte geben Sie einen Vor- und Nachnamen an.');
      return false;
    }

    return true;
  }

  public function validateEmail($email) {
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return true;
    } else {
      $this->messages->addError('Keine gültige E-Mail Adresse wurde angegeben.');
      return false;
    }
  }
}
