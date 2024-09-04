function debug(message) {
  nlapiLogExecution('DEBUG', 'Scriptable Cart', message);
}

function customValidateLine(type) {
  if (type = 'item') {
    var itemId = nlapiGetCurrentLineItemValue('item', 'item');
    var promotion = nlapiGetCurrentLineItemValue('item', 'custcol_custom_promotion_used');
    var pricelevel = nlapiGetCurrentLineItemValue('item', 'price');
    if(promotion && promotion.length > 0 && pricelevel != '-1') { // don't have to set it to 0 again
      nlapiSetCurrentLineItemValue('item', 'price', '-1', false, true);
      nlapiSetCurrentLineItemValue('item', 'rate', 0, true, true);
      nlapiSetCurrentLineItemValue('item', 'amount', 0, true, true);
    }
  }
  return true
}

function customRecalc () {
  debug('recalc called!')
}
