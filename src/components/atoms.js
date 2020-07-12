import { atom } from 'recoil';

const schemaState = atom({ key: 'schema', default: null });

export default {
    schemaState
};