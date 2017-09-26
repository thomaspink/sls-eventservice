<?php

trait GetLeistungIcon {
  /**
   * Returns the icon of the Service by a given Tax ID
   *
   * @param   number    $id // ID of the Taxonomy
   * @return  string
   */
  public function get_leistung_icon($id) {

    if(gettype($id) === 'string' || gettype($id) === 'integer') {
      return get_field('icon', 'leistungen_' . $id);
    }


    return '';
    }
}
