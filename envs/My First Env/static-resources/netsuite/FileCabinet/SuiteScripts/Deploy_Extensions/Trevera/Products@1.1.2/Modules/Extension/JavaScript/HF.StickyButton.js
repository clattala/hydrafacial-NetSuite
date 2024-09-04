define('HF.StickyButton', ['jQuery', 'Utils'], function (jQuery, Utils) {
  var sticky_button;
  var padding_offset = -40;

  jQuery.fn.HFStickyButton = function () {
    hfInit(this);
    // try to update the button position on every scroll, touch start and touch move
    jQuery(document).on('scroll touchstart touchmove', hfCheckStickyPosition);
    return this;
  };

  // initialize the plugin generating required markup and setting the event listeners
  function hfInit(sticky) {
    sticky_button = jQuery(sticky);

    // wrap the original button with a clone into a container. This achieves de desired behavior while scrolling the page
    var button_clone = jQuery('<div class="sticky-button-container-clone hf-sticky-button-container-clone">').append(
      sticky_button.clone(true).removeAttr('data-action')
    );
    sticky_button
      .wrap('<div class="sticky-button-container">')
      .parent()
      .append(button_clone);

    // initialize with "unsticked" state
    hfUnStickIt();
  }

  // checks if the button should be sticked or unsticked
  function hfCheckStickyPosition() {
    var document_scroll_top = jQuery(document).scrollTop();
    var is_sticked          = sticky_button.hasClass('sticked');
    var current_offset      = sticky_button.offset();
    var current_offset_top = current_offset ? (current_offset.top - padding_offset) : 0;
    if (!is_sticked && document_scroll_top >= current_offset_top) {
      hfStickIt();
    } else if (is_sticked && document_scroll_top <= current_offset_top) {
      hfUnStickIt();
    }
  }

  function hfStickIt() {
    var clone = sticky_button
      .parent()
      .find('.sticky-button-container-clone')
      .first();
    clone.addClass('sticked');
    sticky_button.addClass('sticked');
  }

  function hfUnStickIt() {
    var clone = sticky_button
      .parent()
      .find('.sticky-button-container-clone')
      .first();
    clone.removeClass('sticked');
    sticky_button.removeClass('sticked');
  }
});
