<?php

trait TestHelper {
  public function test_helper($var) {
    $html = 'Hello Test ';

    $html .= $var;

    return $html;
  }
}
