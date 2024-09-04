<div class="sc-item-comparison-widget-container {{#if showWidget}} shown{{/if}}">
  <div class="sc-widget-desktop">
    <div class="sc-widget-header" data-view="WidgetHeader.View"></div>
    <div class="sc-widget-placeholders-container animated-ease{{#unless showItemCells}} hide-placeholders{{/unless}}"
         data-view="ItemCells.View">
    </div>
  </div>
  <div class="sc-widget-non-desktop">
    <div class="sc-allowed-items-message-mobile" data-view="LimitMessage.View"></div>
    <div class="sc-widget-placeholders-container animated-ease{{#unless showItemCells}} hide-placeholders{{/unless}}"
         data-view="ItemCells.View">
    </div>
    <div class="sc-widget-header" data-view="WidgetHeader.View"></div>
  </div>
</div>

