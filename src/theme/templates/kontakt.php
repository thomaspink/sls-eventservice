<?php
  /*
   * Template Name: Kontakt
   */

  get_header();

  ?>

<div class="container">
    <h2>24 Stunden, 7 Tage die Woche<br>für Sie erreichbar.</h2>

    <grid-row gutter='medium' class="island-1">
      <grid-column medium-3>
        <h3>SLS EVENTSERVICE</h3>
        Johann irgenwas strasse 3 <br>
        4020 Linz
      </grid-column>
      <grid-column medium-3>
        <h3>SLS EVENTSERVICE (LAGER)</h3>
        Johann irgenwas strasse 3 <br>
        4020 Linz
      </grid-column>
      <grid-column medium-3>
        <h3>SLS EVENTSERVICE</h3>
        Johann irgenwas strasse 3 <br>
        4020 Linz
      </grid-column>
      <grid-column medium-3>
        <div class="card">
          <h3>INFOHOTLINE</h3>
          <strong>0800 800 133</strong>
        </div>
      </grid-column>
    </grid-row>


    <grid-row gutter='medium'>
      <grid-column medium-8>
        <form action="" class="contact-form">
          <grid-row gutter='medium'>
              <grid-column medium-6>
                <input type="text" placeholder="Vorname Nachname" required>
              </grid-column>
              <grid-column medium-6>
                <input type="text" placeholder="E-Mail Adresse" required>
              </grid-column>
          </grid-row>
          <input type="text" placeholder="Betreff">
          <textarea placeholder="Ihre Nachricht ..."></textarea>
          <button class="btn btn--black btn--block" type="submit">Senden</button>
        </form>
      </grid-column>
      <grid-column medium-4>

      </grid-column>
    </grid-row>
  </div>

  <?php

  get_footer(); ?>
