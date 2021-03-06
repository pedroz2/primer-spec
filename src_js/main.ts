import * as AnchorJS from 'anchor-js';
import htmlTableOfContents from './htmlTableOfContents';
import NodeManager from './NodeManager';

const rawHeadTags = require('../_includes/spec_head_tags.html');
const rawBeforeMainContent = require('../_includes/spec_before_main_content.html');

const $main_content = $('#primer-spec-plugin-main-content');

/**
 * Checks whether current HTML page is designed to use Primer Spec as a plugin.
 */
function is_html_compatible_with_primer_spec() {
  // NOTE: This function can make more sophisticated checks in the future.
  return $main_content
    && $main_content.length === 1
    && $main_content.prop('tagName') === 'DIV';
}

function format_main_content() {
  // NOTE: Keep this in sync with the list in _layouts/spec.html
  const class_list = [
    'container-lg',
    'px-3',
    'my-5',
    'markdown-body',
    'primer-spec-content-margin-extra',
  ];
  $main_content.addClass(class_list.join(' '));
}

function inject_theme_html() {
  const $head_links = $(rawHeadTags);
  const $before_main_content = $(rawBeforeMainContent);

  $('head').append($head_links);
  $('body').prepend($before_main_content);

  // Generate the HTML table of contents in the sidebar.
  htmlTableOfContents();
  new NodeManager().init();
}

function main() {
  const anchors = new AnchorJS();
  anchors.add('h1');
  anchors.add();

  if (!is_html_compatible_with_primer_spec()) {
    console.warn(
      "This page included the Primer Spec plugin script, but was not compatible with the plugin!",
    );
  }

  format_main_content();
  inject_theme_html();
}

main();
