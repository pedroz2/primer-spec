import Sidebar from './Sidebar';
import MainContent from './MainContent';
import Topbar from './Topbar';
import Utilities from './Utilities';
import SubthemeSettings from './SubthemeSettings';
import LocalStorage from './LocalStorage';

/**
 * Delegates component logic to various other modules, and serves as a bridge
 * between them.
 */
export default class NodeManager {
  storage: LocalStorage;
  sidebar: Sidebar;
  main_content: MainContent;
  topbar: Topbar;
  settings: SubthemeSettings;

  constructor() {
    const $NODES = {
      sidebar: $('.primer-spec-sidebar'),
      sidebar_toggle_buttons: $('.primer-spec-sidebar-toggle'),
      main_content: $('.markdown-body'),
      topbar: $('.primer-spec-topbar'),
      headings: $('h1, h2, h3, h4, h5, h6'),

      subtheme_selector_dropdown: $('select.primer-spec-subtheme-selector'),
      subtheme_stylesheet: $('#primer-spec-subtheme-style'),
      subtheme_settings_pane: $('.primer-spec-settings'),
      subtheme_settings_toggle_buttons: $('.primer-spec-settings-toggle'),
    };

    // Instantiate the components and delegate nodes to them.
    this.sidebar = new Sidebar(this, $NODES['sidebar'],
                               $NODES['sidebar_toggle_buttons'],
                               $NODES['headings']);
    this.main_content = new MainContent(this, $NODES['main_content']);
    this.topbar = new Topbar(this, $NODES['topbar']);
    this.storage = new LocalStorage(this);
    this.settings = new SubthemeSettings(this,
      $NODES['subtheme_settings_pane'],
      $NODES['subtheme_settings_toggle_buttons'],
      $NODES['subtheme_stylesheet'],
      $NODES['subtheme_selector_dropdown']);
  }

  init() {
    this.sidebar.init();
    this.main_content.init();
    this.topbar.init();
    this.storage.init();
    this.settings.init();

    if (Utilities.isSmallScreen()) {
      // Hide the sidebar by default on mobile.
      this.sidebar.hide();
      // Push the main content to make room for the topbar.
      this.main_content.enableMobileMode();
      // Show the topbar and change the link offset.
      this.topbar.enableMobileMode();
    }
    this._registerSpecialEventHandlers();
  }

  /**
   * Register event handlers that span across modules. These are the internal
   * link handler and the print handlers.
   */
  _registerSpecialEventHandlers() {
    this._registerSidebarInternalLinkHandler();
    this._registerPrintHandler();
  }

  /**
   * Register handler when a sidebar item is clicked. The handler closes the
   * settings pane, and accounts for the Topbar on mobile.
   */
  _registerSidebarInternalLinkHandler() {
    const _this = this;
    $('.primer-spec-toc-item > a').on('click', function() {
      // If the settings pane is open, close it.
      if (_this.settings.shown) {
        _this.settings.hide();
      }

      // On mobile, close the sidebar
      if (Utilities.isSmallScreen()) {
        _this.sidebar.hide();
      }
      
      return true;
    });
  }

  /**
   * Register handler when page is previewed for printing. The handler hides
   * the sidebar and settings panes and restores them after the print preview
   * has been generated.
   */
  _registerPrintHandler() {
    // Despite trying to do this with CSS, the JS solution ends up printing
    // with the proper margins.
    let should_undo_sidebar_toggle = false;
    let should_undo_settings_toggle = false;
    const beforePrint = () => {
      if (this.sidebar.shown) {
        should_undo_sidebar_toggle = true;
        this.sidebar.toggle();
      }
      if (this.settings.shown) {
        should_undo_settings_toggle = true;
        this.settings.toggle();
      }
    };
    const afterPrint = () => {
      if (should_undo_sidebar_toggle) {
        should_undo_sidebar_toggle = false;
        this.sidebar.toggle();
      }
      if (should_undo_settings_toggle) {
        should_undo_settings_toggle = false;
        this.settings.toggle();
      }
    };
    // Safari doesn't support onbeforeprint, etc.
    // So this is the "official" work-around for webkit.
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(mql => {
        if (mql.matches) {
          beforePrint();
        } else {
          afterPrint();
        }
      });
    }
    // But most other browsers support this.
    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
  }
}
