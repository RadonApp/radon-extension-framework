import StorageArea from './area';


export const LocalStorage = new StorageArea('local');
export const SyncStorage = new StorageArea('sync');

export default {
    Local: LocalStorage,
    Sync: SyncStorage
};
