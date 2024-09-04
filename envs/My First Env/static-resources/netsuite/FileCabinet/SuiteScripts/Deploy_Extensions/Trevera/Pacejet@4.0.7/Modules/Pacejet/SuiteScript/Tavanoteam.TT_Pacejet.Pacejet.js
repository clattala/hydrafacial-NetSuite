// Tavanoteam.TT_Pacejet.Pacejet.js
// Load all your starter dependencies in backend for your extension here
// ----------------

define('Tavanoteam.TT_Pacejet.Pacejet'
  , [
    'Tavanoteam.TT_Pacejet.Pacejet.ServiceController', 'Application', 'Models.Init', 'Profile.Model', 'Pacejet.Model', 'Configuration', 'Utils', 'underscore'
  ]
  , function (
    PacejetServiceController, Application, ModelsInit, ProfileModel, PacejetModel, Configuration, Utils, _
  ) {
    'use strict';

    var pacejetConfig        = Configuration.get().pacejet;
    var totalWeight          = 0;
    var flatRateAmount       = 0;
    var flateRateFieldId     = pacejetConfig.flatRateFieldId,
        heightFieldId        = pacejetConfig.heightFieldId,
        lengthFieldId        = pacejetConfig.lengthFieldId,
        widthFieldId         = pacejetConfig.widthFieldId,
        commodityFieldId     = pacejetConfig.commodityFieldId,
        showLtlOver          = parseInt(pacejetConfig.showLtlOver),
        createFile           = false,
        isSingleSecureDomain = true;


    function createLogFile(ret) {
      try {

        var pacejetResponse        = JSON.parse(ret.pacejetData).ratingResultsList;
        var defaultShippingMethods = ret.shipmethods;
        var address                = getCustomerAddress(ret);
        var items                  = getOrderItems(ret.lines);

        if (!address)
          return


        var data = {
          "pacejetResponse"       : pacejetResponse,
          "defaultShippingMethods": defaultShippingMethods,
          "address"               : address,
          "items"                 : items,
          "user"                  : address.Email
        };

        var jsonBody = JSON.stringify(data);

        var url = nlapiResolveURL('SUITELET', 'customscript_tt_create_log_file', 'customdeploy_tt_create_log_file', true);

        nlapiRequestURL(url, { data: jsonBody });


      } catch (e) {
        nlapiLogExecution("ERROR", "ERROR on create file", e)
      }

    }

    function getCustomerAddress(ret) {

      // Find selected Address
      var shipAddress = _.find(ret.addresses, function (address) {
        return address.internalid == ret.shipaddress
      });

      if (shipAddress) {

        var profile = ProfileModel.get();

        return {

          "CompanyName"        : profile.firstname,
          "Address1"           : shipAddress.addr1,
          "City"               : shipAddress.city,
          "StateOrProvinceCode": shipAddress.state,
          "PostalCode"         : shipAddress.zip,
          "CountryCode"        : shipAddress.country,
          "ContactName"        : profile.firstname,
          "Email"              : profile.email,
          "Phone"              : shipAddress.phone,
          "Residential"        : shipAddress.isresidential == "T" ? true : false
        }
      }

      return

    }

    function getTotalWeight(lines) {

      var totalWeight = 0;


      _.each(lines, function (line) {
        var lineItemWeight = line.item.weight || 0;
        totalWeight        = totalWeight + (parseFloat(lineItemWeight) * parseInt(line.quantity));
      })

      return totalWeight;
    }

    function getOrderItems(lines) {

      totalWeight = 0;

      // TODO: review var at the begining
      flatRateAmount = 0;

      var filteredLines = _.filter(lines, function (line) {

        var lineItemWeight = line.item.weight || 0;

        totalWeight = totalWeight + (parseFloat(lineItemWeight) * parseInt(line.quantity));

        // First add the amount to the global scrope
        if (line.item[flateRateFieldId] && line.item[flateRateFieldId] != "") {

          flatRateAmount = parseFloat(flatRateAmount) + (parseFloat(line.item[flateRateFieldId]) * parseInt(line.quantity));
        }

        // Exclude items that are of the type flat rate
        return !line.item[flateRateFieldId]

      });

      var dataItems = _.map(filteredLines, function (line) {


        return {

          "Number"     : line.item.internalid,
          "Description": line.item.storedisplayname2,
          "Weight"     : line.item.weight || 0,
          "AutoPack"   : "true",
          "Dimensions" : {

            "Length": line.item[lengthFieldId] || 1,
            "Width" : line.item[widthFieldId] || 1,
            "Height": line.item[heightFieldId] || 1,
            "Units" : "IN"

          },
          // Value of N indicates this item is packed in current package
          "packUIRmngItem": "N",
          "Quantity"      : {
            "Units": line.item.stockunit || "EA",
            "Value": line.quantity
          },
          "Cost"          : {
            "Currency": "USD",
            "Amount"  : line.rate
          },
          "Price"         : {
            "Currency": "USD",
            "Amount"  : line.item.rate
          },
          "commodityName" : line.item[commodityFieldId]
        }
      });

      return dataItems;
    }

    function getLinesIdsHash(ret) {
      var lineIds = _.map(ret.lines, function (line) {
        return line.internalid
      });

      return lineIds.toString();
    }

    function getAddressHash(ret) {

      var customerAddress = getCustomerAddress(ret);
      return JSON.stringify(customerAddress);

    }

    /**
     * If the user select a shipping method, update the field custbody_tt_pj_shipping_cost with the amount of the shipping cost returned by PJ
     */
    function addShippingCost(data) {
      try {
        if (data.shipmethod) {
          var ctx = ModelsInit.context;

          // We assume that the pacejet response is already cached
          var pacejetResponse = JSON.parse(ctx.getSessionObject('pacejetResponse'));

          if (pacejetResponse && pacejetResponse.ratingResultsList && pacejetResponse.ratingResultsList.length > 0) {
            var pjShippingMethod = _.find(pacejetResponse.ratingResultsList, function (pjShipMethod) {
              return pjShipMethod.shipCodeXRef === data.shipmethod
            })
            if (pjShippingMethod) {
              //Added by shelby.severin@trevera.com
              //if there is a shipping promotion, don't add on pacejet cost, use NS Cost.
              var shippingPromotions   = _.filter(data.promocodes, function (promo) {
                return promo.type === "SHIPPING" && promo.isvalid && promo.applicabilitystatus === "APPLIED";
              });
              var shippingItems        = ['1725', '1730', '1742', '1747', '1740', '1741', '1743', '1749'];
              var currentShipmethod    = data.shipmethod;
              var flatRateAmount       = 0;
              var pjShippingMethodCost = 0;

              if (shippingPromotions.length > 0 && shippingItems.indexOf(currentShipmethod) > -1) {
                pjShippingMethodCost                      = flatRateAmount + pjShippingMethodCost;
                pjShippingMethodCost                      = parseFloat(pjShippingMethodCost).toFixed(2);
                data.options.custbody_tt_pj_shipping_cost = parseFloat(flatRateAmount + pjShippingMethodCost).toFixed(2).toString();
              }
              else {
                flatRateAmount                            = parseFloat(ctx.getSessionObject('flatRateAmount'));
                pjShippingMethodCost                      = pjShippingMethod[pacejetConfig.priceFieldToUse] || 0;
                pjShippingMethodCost                      = flatRateAmount + pjShippingMethodCost;
                pjShippingMethodCost                      = parseFloat(pjShippingMethodCost).toFixed(2);
                data.options.custbody_tt_pj_shipping_cost = parseFloat(flatRateAmount + pjShippingMethodCost).toFixed(2).toString();
              }
            }
          }
        }
      } catch (e) {
        nlapiLogExecution("ERROR", "Error trying to set shipping cost", e);
      }
    }

    /**
     * In case of the user have a selected ship address and the request to PJ for that selected ship address have never being done
     * a request is made to PJ to pull the shipping methods available for that address.
     * Also add the response to the context session, this will perform a better UX by not doing multiple request to PJ for the same address
     * @param {Object} ret - returned value of the LiveOrder.Model.get method
     */
    function addPacejetData(ret) {

      flatRateAmount = 0;

      var ctx                     = ModelsInit.context;
      // Last Ship Address Used by the user
      var lastShipAddress         = ctx.getSessionObject('lastShipAddress') || "";
      var lastLinesIds            = ctx.getSessionObject('lastLinesIds') || "";
      var lastSelectedLiftGate    = ctx.getSessionObject('lastSelectedLiftGate') || "";
      var lastSelectedAddressHash = ctx.getSessionObject('lastSelectedAddressHash') || "";
      var lineIds                 = getLinesIdsHash(ret);
      var isAddressFieldsUpdated  = false;

      // Current Selected Ship Address
      var currentShipAddress      = ret.shipaddress;
      var currentSelectedLiftGate = ret.options.custbody_tt_lift_gate || "";

      // If there a selected ship address
      if (currentShipAddress) {

        var currentAddressHash = getAddressHash(ret);

        // If the shipping address or the lines doesn't change
        if (currentShipAddress !== lastShipAddress || (currentAddressHash !== lastSelectedAddressHash) || (lastLinesIds !== lineIds) || (lastSelectedLiftGate !== currentSelectedLiftGate)) {

          // if the use change only the current address, we need to re-calculate shipping cost
          isAddressFieldsUpdated = currentAddressHash !== lastSelectedAddressHash;

          // Set the last address used
          ctx.setSessionObject('lastShipAddress', currentShipAddress);
          ctx.setSessionObject('lastLinesIds', lineIds);
          ctx.setSessionObject('lastSelectedLiftGate', currentSelectedLiftGate);
          ctx.setSessionObject('lastSelectedAddressHash', currentAddressHash);

          var orderItems = getOrderItems(ret.lines);

          var customerAddress = getCustomerAddress(ret);

          if (customerAddress) {
            var calculatedWeight = getTotalWeight(ret.lines);

            ret.pacejetData = PacejetModel.get(customerAddress, orderItems, calculatedWeight, currentSelectedLiftGate);
            ctx.setSessionObject('pacejetResponse', ret.pacejetData);
          }
        }
        else {
          flatRateAmount  = parseFloat(ctx.getSessionObject('flatRateAmount'));
          ret.pacejetData = ctx.getSessionObject('pacejetResponse');
        }

      }

      // add amount to global scope
      ret.flateRateAmount = flatRateAmount;
      ctx.setSessionObject('flatRateAmount', flatRateAmount);
      createFile && createLogFile(ret);

      try {

        // After add the pacejet information, we merge the shipping methods of PC with the default ns
        var pacejetResponse = JSON.parse(ret.pacejetData);

        if (pacejetResponse) {
          // Sort by price low to high
          pacejetResponse.ratingResultsList = _.sortBy(pacejetResponse.ratingResultsList, function (pjShipMethod) {
            return pjShipMethod.consigneeFreight;
          })

          if (pacejetResponse && pacejetResponse.ratingResultsList && pacejetResponse.ratingResultsList.length > 0) {

            _.each(ret.shipmethods, function (shipMethod) {
              // find the correspoding ship method on the PC Response
              var pcShipMethod = _.find(pacejetResponse.ratingResultsList, function (pcShipMethod) {
                return pcShipMethod.shipCodeXRef == shipMethod.internalid
              })

              shipMethod.pacejetData = pcShipMethod

              // Change the rate of the Shipping Method
              if (pcShipMethod) {
                var accumPrice            = (pcShipMethod[pacejetConfig.priceFieldToUse]) + flatRateAmount;
                shipMethod.rate_formatted = "$" + parseFloat(accumPrice).toFixed(2);
                shipMethod.crudRate       = parseFloat(accumPrice).toFixed(2);
                shipMethod.shipMode       = pcShipMethod.shipMode;
                shipMethod.rate           = parseFloat(shipMethod.crudRate).toFixed(2);
              }
            })

            ret.shipmethods = _.filter(ret.shipmethods, function (shipMethod) {
              return shipMethod.pacejetData
            })

            // If total weight is lower than showLtlOver we need to hide the shipmethods LTL
            var calculatedWeightLoop = getTotalWeight(ret.lines);

            if (calculatedWeightLoop < showLtlOver) {
              ret.shipmethods = _.filter(ret.shipmethods, function (shipMethod) {
                return shipMethod.shipMode !== "LTL"
              })
            }

            // Sort Shipping options L to H
            ret.shipmethods = _.sortBy(ret.shipmethods, function (shipMethod) {
              return shipMethod.crudRate
            });

            try {

              var orderShipMethod = ModelsInit.order.getFieldValues(["shipmethod"]);

              ret.shipmethodSelected = orderShipMethod && orderShipMethod.shipmethod && orderShipMethod.shipmethod.shipmethod || "";

              var pcShipMethod = _.find(pacejetResponse.ratingResultsList, function (pcShipMethod) {
                return parseInt(pcShipMethod.shipCodeXRef) === parseInt(ret.shipmethodSelected)
              })
              if (pcShipMethod) {
                var shipping_cost_ns = ret.summary.shippingcost;

                //Added by shelby.severin@trevera.com
                //if there is a shipping promotion, don't add on pacejet cost, use NS Cost.
                var shippingPromotions = _.filter(ret.promocodes, function (promo) {
                  return promo.type === "SHIPPING" && promo.isvalid && promo.applicabilitystatus === "APPLIED";
                });
                var shippingItems      = ['1725', '1730', '1742', '1747', '1740', '1741', '1743', '1749'];
                var currentShipmethod  = ret.shipmethod;
                nlapiLogExecution("ERROR", "shippingPromotions", JSON.stringify(shippingPromotions));
                nlapiLogExecution("ERROR", "give free shipping", shippingPromotions.length > 0 && shippingItems.indexOf(currentShipmethod) > -1);
                if (shippingPromotions.length > 0 && shippingItems.indexOf(currentShipmethod) > -1) {
                  ret.summary.shippingcost           = 0;
                  ret.summary.shippingcost_formatted = "$0.00";
                }
                else {
                  ret.summary.shippingcost           = Math.round((pcShipMethod[pacejetConfig.priceFieldToUse]) * 100) / 100;
                  ret.summary.shippingcost           = parseFloat(ret.summary.shippingcost).toFixed(2);
                  ret.summary.shippingcost_formatted = "$" + (ret.summary.shippingcost).toString();
                }

                ret.summary.total                       = ret.summary.total - parseFloat(shipping_cost_ns) + parseFloat(ret.summary.shippingcost);
                ret.summary.total                       = Math.round(ret.summary.total * 100) / 100;
                ret.summary.total_formatted             = "$" + parseFloat(ret.summary.total).toFixed(2);
                ret.summary.estimatedshipping           = 0;
                ret.summary.estimatedshipping_formatted = "$0,00";
              }
              else {

              }
            } catch (e) {
              nlapiLogExecution("ERROR", "ERROR", e)
            }
          }
          else {
            // Manage pacejet empty response
            ret.shipmethods = [];
          }
        }

      } catch (e) {
        nlapiLogExecution("ERROR", "error trying to get pacejet data", e)
        // If error happens, we return empty shipping mthods
        ret.shipmethods = [];
      }
    }

    /**
     * Get
     * Wrap LiveOrder.get method to add the pacejet information to the live Order response
     */
    Application.on('after:LiveOrder.get', function (Model, response) {
      try {
        var isMyAccount = request.getHeader('X-SC-Touchpoint') == 'myaccount';
        var isCheckout  = Utils.isInCheckout(request) && ModelsInit.session.isLoggedIn2() && !isMyAccount;
        isCheckout && addPacejetData(response);
      } catch (e) {
        nlapiLogExecution('DEBUG', 'ERROR Extension', JSON.stringify(e));
      }
    });

    /**
     * Update
     * If the user select a shipping method, update the field custbody_tt_pj_shipping_cost with the amount of the shipping cost returned by PJ
     */

    Application.on('before:LiveOrder.update', function (Model, data) {
      try {
        addShippingCost(data);
      } catch (e) {
        nlapiLogExecution('DEBUG', 'ERROR Extension', JSON.stringify(e));
      }
    });

  });
