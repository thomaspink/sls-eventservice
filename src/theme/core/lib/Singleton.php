<?php

namespace theme\lib;

class Singleton {

    protected static $instance = null;

    public static function getInstance() {
        if (!isset(static::$instance)) {
            static::$instance = new static;
        }
        return static::$instance;
    }

    public static function inject() {
        return static::getInstance();
    }

    protected function __construct() { }

    protected function __clone() { }

}
