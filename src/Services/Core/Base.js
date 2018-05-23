import Log from 'neon-extension-framework/Core/Logger';
import Plugin from 'neon-extension-framework/Core/Plugin';


export default class Service {
    constructor(plugin, key, type) {
        this.plugin = plugin;
        this.key = key;
        this.type = type;

        // Generate global identifier
        this.id = plugin.id + ':' + key;

        // Expose messaging channel
        this.messaging = Plugin.messaging;

        // Construct preferences context
        this.preferences = this.plugin.preferences.context(this.key);

        // Private variables
        this._initialized = false;
    }

    get enabled() {
        throw new Error('Use the Service.isEnabled() method instead');
    }

    get initialized() {
        return this._initialized;
    }

    isEnabled() {
        // Retrieve plugin enabled state
        return this.plugin.isEnabled().then((enabled) => {
            if(!enabled) {
                return false;
            }

            // Retrieve service enabled state
            if(!this.preferences.exists('enabled')) {
                Log.warn('Unable to find an "enabled" option for %o', this.id);
                return Promise.resolve(true);
            }

            return this.preferences.getBoolean('enabled');
        });
    }

    initialize() {
        this._initialized = true;
    }
}
