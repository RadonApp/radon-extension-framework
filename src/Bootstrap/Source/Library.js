import Log from 'neon-extension-framework/Core/Logger';
import Registry from 'neon-extension-framework/Core/Registry';
import {Services} from 'neon-extension-framework/Core/Constants';


function initialize() {
    if(typeof Registry.servicesByType[Services.Source.Library] === 'undefined') {
        Log.error('No "library" service available');
        return;
    }

    // Retrieve registered service identifiers
    let serviceIds = Object.keys(Registry.servicesByType[Services.Source.Library]);

    // Ensure only one service is defined
    if(serviceIds.length !== 1) {
        Log.error('Exactly one "library" service should be defined');
        return;
    }

    // Retrieve service
    let service = Registry.servicesByType[Services.Source.Library][serviceIds[0]];

    // Ensure service hasn't already been initialized
    if(service.initialized) {
        return;
    }

    // Initialize service
    Log.debug('Initializing "library" service "%s"...', service.id);

    try {
        service.initialize();

        Log.info('Initialized "library" service "%s"', service.id);
    } catch(err) {
        Log.error('Unable to initialize "library" service "%s": %s', service.id, err && err.message, err);
    }
}

// Initialize library service
initialize();
