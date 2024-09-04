define('AnnexCloudApiCall.ServiceController', [
    'ServiceController',
    'AnnexCloud.AnnexCloudExtension.AnnexCloudApiCall'
  ]
  , function (
    ServiceController,
    AnnexCloudApiApiCalls
  ) {
    'use strict';

    return ServiceController.extend({

      name: 'AnnexCloudApiCall.ServiceController'

      // The values in this object are the validation needed for the current service.
      , options: {
        common: {}
      }

      , get: function get() {
        var httpMethod = this.request.getParameter('httpMethod');
        var email      = this.request.getParameter('email');
        var siteId     = this.request.getParameter('siteId');
        var token      = this.request.getParameter('token');
        var rewardId   = this.request.getParameter('rewardId');
        console.error('httpMethod', httpMethod)
        return AnnexCloudApiApiCalls.get(httpMethod, email, siteId, token, rewardId);
      }

      , post: function post() {
        // not implemented
      }

      , put: function put() {
        // not implemented
      }

      , delete: function () {
        // not implemented
      }
    });
  }
);
