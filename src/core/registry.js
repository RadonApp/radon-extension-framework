export var OptionTypes = [
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

        var plugins = [];

        for(var key in this.pluginsByType[type]) {
            if(!this.pluginsByType[type].hasOwnProperty(key)) {
                continue;
            }

            // Retrieve plugin
            var plugin = this.pluginsByType[type][key];

            // Filter by enabled state
            if(!plugin.enabled && options.disabled != true) {
                continue;
            }

            // Append to result list
            plugins.push(plugin);
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
            console.warn('Service "' + service.id + '" has already been registered');
            return false;
        }

        if(typeof this.servicesByType[service.type][service.id] !== 'undefined') {
            console.warn('Service "' + service.id + '" has already been registered');
            return false;
        }

        // Register service
        this.services[service.id] = service;
        this.servicesByType[service.type][service.id] = service;

        console.debug('Registered service: %o', service.id, service);

        // Ensure plugin has been registered
        this.registerPlugin(service.plugin);
        return true;
    }
}

export default new Registry();
