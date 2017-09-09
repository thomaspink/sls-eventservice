<?php

trait GetLeistungen {
  /**
   * Returns the name of the Service by a given Tax ID
   *
   * @param   number    $id // ID of the Taxonomy
   * @return  string
   */
  public function get_leistungen($id) {

    if(gettype($id) === 'string' || gettype($id) === 'integer') {
      return get_term( $id, $taxonomy = 'leistungen')->name;
    }

    if(gettype($id) === 'array') {
      $arr = array();
      for($i = 0, $max = count($id); $i < $max; $i++) {
        $term = get_term( $id[$i], $taxonomy = 'leistungen')->name;
        array_push($arr, $term);
      }

      return join($arr, ', ');
    }

    return '';
    }
}
