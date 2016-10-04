import {NotImplementedException} from '../../core/exceptions';


export default class BrowserPermissions {
    request(permissions, origins) {
        throw new NotImplementedException();
    }

    remove(permissions, origins) {
        throw new NotImplementedException();
    }

    contains(permissions, origins) {
        throw new NotImplementedException();
    }
}
