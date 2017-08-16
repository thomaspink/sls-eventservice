<?php
  /*
   * Template Name: Unternehmen
   */



if( have_rows('content') ):

     // loop through the rows of data
    while ( have_rows('content') ) : the_row();

        if( get_row_layout() == 'grid' ){

            printf('<grid-row>');

            if(have_rows('column')): while ( have_rows('column') ) : the_row();

              printf('<grid-column>');

              if(get_row_layout() == 'text') {
                the_sub_field('text');
              }


              printf('</grid-column>');

            endwhile; endif;

            printf('</grid-row>');

        } elseif ( get_row_layout() == 'download' ){

            $file = get_sub_field('file');

        }

    endwhile;

endif;
