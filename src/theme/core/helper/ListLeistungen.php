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

    foreach($terms as $term) {
      $slug = $term->taxonomy . '_' . $term->term_id;
      $term->icon = get_field('icon', $slug);
      $term->title = get_field('titel', $slug);
    }

    return $terms;
  }
}
