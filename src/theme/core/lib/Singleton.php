<?php

namespace theme\lib;

class Singleton {

    protected static $instance = null;

    public static function getInstance() {
        if (null === static::$instance) {
            static::$instance = new static();
        }
        return static::$instance;
    }

    public static function inject() {
        return static::getInstance();
    }

    protected function __construct() {
        return static::getInstance();
    }
}
