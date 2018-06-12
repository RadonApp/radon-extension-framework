/* globals jasmine */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;

// Import all modules in context
function importAll(r) {
    r.keys().forEach(r);
}

// Import source directories
importAll(require.context('./Bootstrap', true, /.js$/));
importAll(require.context('./Components', true, /.js$/));
importAll(require.context('./Core', true, /.js$/));
importAll(require.context('./Document', true, /.js$/));
importAll(require.context('./Messaging', true, /.js$/));
importAll(require.context('./Models', true, /.js$/));
importAll(require.context('./Preferences', true, /.js$/));
importAll(require.context('./Properties', true, /.js$/));
importAll(require.context('./Services', true, /.js$/));
importAll(require.context('./Storage', true, /.js$/));
importAll(require.context('./Utilities', true, /.js$/));
