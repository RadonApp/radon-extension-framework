import Preferences from 'eon.extension.browser/preferences';


export const OptionTypes = [
    'checkbox',
    'enable',
    'slider'
];

export class Registry {
    constructor() {
        this.plugins = {};
        this.pluginsByType = {};

        this.services = {};
        this.servicesByType = {};
    }

    getPluginById(id) {
        return this.plugins[id] || null;
    }

    getPluginServiceByType(pluginId, type) {
        if(typeof this.servicesByType[type] === 'undefined') {
            return null;
        }

        return this.servicesByType[type][pluginId + ':' + type] || null;
    }

    listPlugins(type, options) {
        options = options || {};
        options.disabled = typeof options.disabled !== 'undefined' ? options.disabled : false;

        if(typeof this.pluginsByType[type] === 'undefined') {
            return [];
        }

        let plugins = [];

        for(let key in this.pluginsByType[type]) {
            if(!this.pluginsByType[type].hasOwnProperty(key)) {
                continue;
            }

            // Retrieve plugin
            let plugin = this.pluginsByType[type][key];

            // Filter by enabled state
            if(!plugin.enabled && options.disabled !== true) {
                continue;
            }

            // Append to result list
            plugins.push(plugin);
        }

        return plugins;
    }

    listServices(type, options) {
        options = options || {};
        options.disabled = typeof options.disabled !== 'undefined' ? options.disabled : false;

        if(typeof this.servicesByType[type] === 'undefined') {
            return [];
        }

        let plugins = [];

        for(let key in this.servicesByType[type]) {
            if(!this.servicesByType[type].hasOwnProperty(key)) {
                continue;
            }

            // Retrieve plugin
            let service = this.servicesByType[type][key];

            // Filter by enabled state
            if(!service.plugin.enabled && options.disabled !== true) {
                continue;
            }

            // Append to result list
            plugins.push(service);
        }

        return plugins;
    }

    registerPlugin(plugin) {
        // Ensure plugin type object has been created
        if(typeof this.pluginsByType[plugin.type] === 'undefined') {
            this.pluginsByType[plugin.type] = {};
        }

        // Ensure plugin hasn't already been registered
        if(typeof this.plugins[plugin.id] !== 'undefined') {
            return false;
        }

        if(typeof this.pluginsByType[plugin.type][plugin.id] !== 'undefined') {
            return false;
        }

        // Register plugin
        this.plugins[plugin.id] = plugin;
        this.pluginsByType[plugin.type][plugin.id] = plugin;

        console.debug('Registered plugin: %o', plugin.id, plugin);
        return true;
    }

    registerService(service) {
        // Ensure plugin type object has been created
        if(typeof this.servicesByType[service.type] === 'undefined') {
            this.servicesByType[service.type] = {};
        }

        // Ensure service hasn't already been registered
        if(typeof this.services[service.id] !== 'undefined') {
            return false;
        }

        if(typeof this.servicesByType[service.type][service.id] !== 'undefined') {
            return false;
        }

        // Register service
        this.services[service.id] = service;
        this.servicesByType[service.type][service.id] = service;

        console.debug('Registered service: %o', service.id, service);

        // Service registration tasks
        try {
            if(service.type === 'configuration') {
                this.registerConfigurationService(service);
            }
        } catch(e) {
            console.error('Unable to register service %o:', service.type, e.stack);
            return false;
        }

        // Ensure plugin has been registered
        this.registerPlugin(service.plugin);
        return true;
    }

    registerConfigurationService(service) {
        // Register options
        for(let i = 0; i < service.options.length; ++i) {
            Preferences.register(service.options[i]);
        }
    }
}

// Construct registry
if(typeof window.eon === 'undefined') {
    window.eon = {};
}

if(typeof window.eon.registry === 'undefined') {
    window.eon.registry = new Registry();
}

export default window.eon.registry;
