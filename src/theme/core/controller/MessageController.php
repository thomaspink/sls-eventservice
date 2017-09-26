<?php

namespace theme\controller;

class MessageController {

  protected static $instance = null;

  private static $textDomain = 'sls-2017';
  private $messages = array();

  public function __construct() {}

  public static function getInstance() {
      if (!isset(static::$instance)) {
          static::$instance = new static;
      }
      return static::$instance;
  }

  public function getMessages() {
    return $this->messages;
  }

  private function addMessage($message, $type) {
    if ($this->messages[$type]) {
      $this->messages[$type][] = __($message, self::$textDomain);
      return;
    }
    $this->messages[$type] = array(
      'messages' => array(__($message, self::$textDomain)),
      'style' => 'is--' . $type
    );
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
