<div class="sitemap-footer">
  <div class="container">
    <grid-row gutter="medium">
      <grid-column medium-6 large-3>
        <h3><?php _e( 'Kontakt', 'sls-2017' ); ?></h3>
        <v-card class="vcard" itemscope="" itemtype="http://microformats.org/profile/hcard">
          <div>
            <span itemprop="org">SLS Eventservice</span><br>
            <span itemprop="adr" itemscope="">
              <meta itemprop="type" content="work">
              <span itemprop="street-address">Johann-Pürstinger-Straße 9</span>,<br>
              <span itemprop="country-name">A</span>-
              <span itemprop="postal-code">4540</span>
              <span class="locality">Pfarrkirchen bei Bad Hall</span>
            </span>
          </div>
          <div>
            <div class="desktop-hidden" itemprop="tel" itemscope="">
              <meta itemprop="type" content="work">
              <span itemprop="cell">T: <a href="tel:+43720310311">+43 (0)720 310 311 (VOIP)</a></span>
            </div>
            <div class="desktop-hidden" itemprop="tel" itemscope="">
              <meta itemprop="type" content="work">
              <span itemprop="fax">F: <a href="tel:+4372031031110">+43 (0)720 310 311 - 10</a></span>
            </div>
            <div class="desktop-hidden" itemprop="tel" itemscope="">
              <meta itemprop="type" content="work">
              <span itemprop="fax">M: <a href="tel:+4369910465844">+43 (0)699 104 65 844</a></span>
            </div>
          </div>

          <a class="hidden" itemscope="email" href="mailto:info@hoeglinger.bmw.at">info@hoeglinger.bmw.at</a>
        </v-card>
      </grid-column>
      <grid-column medium-6 large-3>
        <h3><?php _e( 'Jobs', 'sls-2017' ); ?></h3>
        <p>Aktuell keine Stellenausschreibungen.<br>Schicke mir eine Initiativbewerbung an:</p>
        <p><a href="mailto:office@sls-eventservice.at">office@sls-eventservice.at</a></p>
      </grid-column>
      <grid-column medium-6 large-3>
        <h3><?php _e( 'Partner', 'sls-2017' ); ?></h3>
        <?php wp_nav_menu( array(
          'theme_location' => 'partner',
          'fallback_cb' => false,
          'menu_class' => 'link-list',
          'container' => false
        )); ?>
      </grid-column>
      <grid-column medium-6 large-3>
        <h3><?php _e( 'Downloads', 'sls-2017' ); ?></h3>
        <?php wp_nav_menu( array(
          'theme_location' => 'downloads',
          'fallback_cb' => false,
          'menu_class' => 'link-list',
          'container' => false
        )); ?>
      </grid-column>
    </grid-row>
  </div>
</div>
