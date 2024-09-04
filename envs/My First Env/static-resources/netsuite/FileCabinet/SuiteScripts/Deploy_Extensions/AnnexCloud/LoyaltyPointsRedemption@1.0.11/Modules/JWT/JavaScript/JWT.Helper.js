define('JWT.Helper'
    ,	[
        'CryptoJs'
    ]
    ,	function (
        CryptoJs
    )
    {
        'use strict';

        return {
            generateJWT: function generateJWT(requestData, configurations) {
                var JWT = '';

                try {

                    var timestamp = new Date();
                    var UTCseconds = (timestamp.getTime() + timestamp.getTimezoneOffset() * 60 * 1000)/ 1000;
                    UTCseconds = UTCseconds + 360000;

                    var requestDataStbase64 = btoa(JSON.stringify(requestData));
                    var hash = CryptoJs.HmacSHA256(requestDataStbase64, configurations.key);
                    var hashInBase64 = CryptoJs.enc.Base64.stringify(hash);

                    var header = {
                        "typ": "JWT",
                        "alg": "HS256"
                    };

                    var payload = {
                        "sub": configurations.clientName,
                        "exp": UTCseconds,
                        "site_id": configurations.siteId,
                        "hmac":hashInBase64
                    };

                    var headerStbase64 = btoa(JSON.stringify(header));
                    var payloadStbase64 = btoa(JSON.stringify(payload));

                    var s_sing = CryptoJs.HmacSHA256(headerStbase64 + "." + payloadStbase64, configurations.key);

                    var base64Sign = CryptoJs.enc.Base64.stringify(s_sing);

                    base64Sign = base64Sign.replace('+', '-');
                    base64Sign = base64Sign.replace('/', '_');

                    JWT = headerStbase64 + "." + payloadStbase64 + "." + base64Sign;

                } catch (e) {
                    console.log('Error generating JWT')
                }

                return JWT;
            }
        }
    });