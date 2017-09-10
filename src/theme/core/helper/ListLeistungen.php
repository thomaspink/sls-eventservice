<?php

trait ListLeistungen {
  /**
   * Returns a Array of all Leistungen
   *
   * @return  array
   */
  public function list_leistungen() {

    $terms = get_terms( array(
      'taxonomy' => 'leistungen',
      'hide_empty' => false,
    ) );

    return $terms;
  }
}
