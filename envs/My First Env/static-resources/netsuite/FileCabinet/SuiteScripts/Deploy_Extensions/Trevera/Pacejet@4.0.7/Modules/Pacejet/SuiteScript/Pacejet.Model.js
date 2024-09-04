/**
 * Connector between netsuite and pacejet
 * @module PacejetModel
 * @extends SC.Model
 */

define(
  'Pacejet.Model'
  , [
    'SC.Model'
    , 'Application'
    , 'Configuration'
  ]
  , function (
    SCModel
    , Application
    , Configuration
  ) {
    'use strict';

    var pacejetConfig = Configuration.get().pacejet;

    return SCModel.extend({


      createLogFile: function (content) {

        nlapiLogExecution("ERROR", "ERROR on create file", "create log file");

        try {

          var url = nlapiResolveURL('SUITELET', 'customscript_tt_create_log_file', 'customdeploy_tt_create_log_file', true);

          nlapiRequestURL(url, {body: content});


        } catch (e) {
          nlapiLogExecution("ERROR", "ERROR on create file PJ Model", e)
        }
      },

      name: 'Pacejet'
      /**
       * Return a list of available shipping methods for the address "address" and the list of items "items"
       * @param {Object} address - Address of the customer
       * @param {Array} products - Array of products to use with PJ Api
       * @returns {Array} Pacejet Response
       */
      , get: function get(address, products, totalWeight, isLiftGate) {


        try {
          var apiUrl = pacejetConfig.apiUrl;
          var subsidiary = pacejetConfig.subsidiaryId;

          var body = {
            // SAMPLE: Items and Quantity Fully Packed in Packages
            "Location"    : pacejetConfig.pacejetLocation,
            "LicenseID"   : pacejetConfig.pacejetLicenseKey,
            "UpsLicenseID": pacejetConfig.upsLicenseId,
            // Customer address
            "Destination": address,
            // Product information of order items
            "PackageDetailsList": [
              {
                "ProductDetailsList": products
              }
            ]
          };

          if (subsidiary != "-1") {
            body.billingDetails = {
              "subsidiary": subsidiary
            }
          }
          else {
            body.billingDetails = {
              "subsidiary": null
            }
          }

          if (pacejetConfig.useLocation) {
            body.Origin = {
              "LocationType": pacejetConfig.locationType,
              "LocationSite": pacejetConfig.locationSite,
              "LocationCode": pacejetConfig.locationCode
            }
          }
          else {
            body.Origin = {
              "CompanyName"        : pacejetConfig.companyName,
              "Address1"           : pacejetConfig.address1,
              "City"               : pacejetConfig.city,
              "StateOrProvinceCode": pacejetConfig.state,
              "PostalCode"         : pacejetConfig.postalCode,
              "CountryCode"        : pacejetConfig.countryCode,
              "ContactName"        : pacejetConfig.contactName,
              "Email"              : pacejetConfig.email,
              "Phone"              : pacejetConfig.phone
            }
          }

          body.CustomFields = [{
            "name" : "AutoPackShipment",
            "value": "TRUE"
          }]

          if (totalWeight > parseInt(pacejetConfig.showLtlOver) && isLiftGate == "T") {
            body.ShipMentDetail = {
              "ltlOptions": {
                "liftGate": 1
              }
            }
          }

          //Setting up Headers
          var headers = {
            "User-Agent-x"     : "SuiteScript-Call",
            "Content-Type"     : "application/json",
            "PacejetLocation"  : pacejetConfig.pacejetLocation,
            "PacejetLicenseKey": pacejetConfig.pacejetLicenseKey
          };

          var jsonBody = JSON.stringify(body);

          var response = nlapiRequestURL(apiUrl, jsonBody, headers);

          return response.getBody();

        } catch (e) {

          return e;
        }
      }

    });
  });
