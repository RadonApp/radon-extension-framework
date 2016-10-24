import Preferences from 'eon.extension.browser/preferences';
import Log from 'eon.extension.framework/core/logger';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {Page} from 'eon.extension.framework/services/configuration/models';


export const OptionTypes = [
    'checkbox',
    'enable',
    'slider'
];

export class Registry {
    constructor() {
        this.components = {};

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

    registerComponent(component) {
        // Ensure component hasn't already been defined
        if(isDefined(this.components[component.componentId])) {
            return false;
        }

        // Register component
        this.components[component.componentId] = component;

        Log.debug('Registered component: %o', component.componentId, component);
        return true;
    }

    registerPlugin(plugin) {
        // Ensure plugin is valid
        if(!plugin.valid) {
            return false;
        }

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

        Log.debug('Registered plugin: %o', plugin.id, plugin);
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

        Log.debug('Registered service: %o', service.id, service);

        // Service registration tasks
        try {
            if(service.type === 'configuration') {
                this.registerConfigurationService(service);
            }
        } catch(e) {
            Log.error('Unable to register service %o:', service.type, e.stack);
            return false;
        }

        // Ensure plugin has been registered
        this.registerPlugin(service.plugin);
        return true;
    }

    registerConfigurationService(service) {
        if(service.plugin.type !== 'core' && service.options.length > 1) {
            Log.warn(
                '[%s] Plugin configuration services can only contain one page',
                service.plugin.id
            );
            return;
        }

        // Register preference pages
        for(let i = 0; i < service.options.length; ++i) {
            let item = service.options[i];

            if(!(item instanceof Page)) {
                Log.warn(
                    '[%s] Configuration services should only contain pages, found: %o',
                    service.plugin.id, item
                );
                continue;
            }

            // Register page
            Preferences.register(item);
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
