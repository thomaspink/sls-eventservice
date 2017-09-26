<?php

namespace theme\controller;
use theme\lib as lib;

class MessageController extends lib\Singleton {

  private static $textDomain = 'sls-2017';
  private $messages = array();

  public function __construct() {}

  public function getMessages() {
    return $this->messages;
  }

  private function addMessage($message, $type) {
    if ($this->messages[$type]) {
      $this->messages[$type][] = __($message, self::$textDomain);
      return;
    }
    $this->messages[$type] = __($message, self::$textDomain);
  }

  public function addSuccess($message) {
    $this->addMessage($message, 'success');
  }

  public function addWarning($message) {
    $this->addMessage($message, 'warning');
  }

  public function addError($message) {
    $this->addMessage($message, 'error');
  }
}
