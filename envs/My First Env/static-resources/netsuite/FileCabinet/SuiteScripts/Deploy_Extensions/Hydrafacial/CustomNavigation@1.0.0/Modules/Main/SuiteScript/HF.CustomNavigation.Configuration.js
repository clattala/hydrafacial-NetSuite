define('HF.CustomNavigation.Configuration', [
    'Configuration',
    'HF.CustomNavigation.Model'
], function HFCustomNavigationConfiguration(
    Configuration,
    Model
) {
    'use strict';

    var publish = Configuration.get('publish', []);

    publish.push({
        key: 'HFCustomNavigation',
        model: 'HF.CustomNavigation.Model',
        call: 'loadCustomNavigationData'
    });

    Configuration.set('publish', publish);
});
