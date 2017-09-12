<?php
  /*
   * Template Name: Unternehmen
   *
   */

  if( have_rows('content') ):

      // loop through the rows of data
      while ( have_rows('content') ) : the_row();

          if( get_row_layout() == 'grid' ){

              printf('<grid-row>');

              if(have_rows('column')): while ( have_rows('column') ) : the_row();

                $width = get_sub_field('width');

                printf('<grid-column medium-%s>', $width);

                if(get_row_layout() == 'text') {
                  $context['text'] = get_sub_field('text');
                  Timber::render( array( 'components/text.twig' ), $context );
                }

                if(get_row_layout() == 'image') {
                  $context['image'] = new TimberImage(get_sub_field('image'));
                  Timber::render( array( 'components/image.twig' ), $context );
                }


                printf('</grid-column>');

              endwhile; endif;

              printf('</grid-row>');

          } elseif ( get_row_layout() == 'download' ){

              $file = get_sub_field('file');

          }

      endwhile;

  endif;
