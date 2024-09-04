// AnnexCloud.AnnexCloudExtension.AnnexCloudApiCall.js
// Load all your starter dependencies in backend for your extension here
// ----------------

define('AnnexCloud.AnnexCloudExtension.AnnexCloudApiCall', [
    'AnnexCloud.AnnexCloudExtension.AnnexCloudApiCall.ServiceController',
    'SC.Model',
    'underscore'
], function(
    AnnexCloudApiCallServiceController,
    SCModel,
    _
) {
    'use strict';

    return SCModel.extend({
        get: function get(httpMethod, email, siteId, token, rewardId) {
            if (httpMethod == 'GET') {
                var url = 'https://s15.socialannex.net/api/3.0/users/' + email + '/reward';
                var header = {
                    "Authorization": "Bearer " + token,
                    "X-SC-Touchpoint": undefined,
                    "X-AnnexCloud-Site": siteId,
                };
                var response = nlapiRequestURL(url, null, header, httpMethod);
                console.error('response', response.getBody())

                return response.getBody();
            } else if (httpMethod == 'POST') {
                var url = 'https://s15.socialannex.net/api/3.0/points';
                var header = {
                    "Authorization": "Bearer " + token,
                    "X-AnnexCloud-Site": siteId,
                    "Content-Type": "application/json"
                };

                var body = {
                    "id": email,
                    "email": email,
                    "rewardId": rewardId,
                    "activity": "DEBIT",
                    "reason": "claim"
                };
                console.error('body', body)
                console.error('header', JSON.stringify(header))

                var response = nlapiRequestURL(url, JSON.stringify(body), header, httpMethod);
                console.error('response', response.getBody())

                return response.getBody();

            }

        }
    });
});