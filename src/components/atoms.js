import { atom } from 'recoil';

const schemaState = atom({ key: 'schema', default: null });
const protocolState = atom({ key: 'protocol', default: 'https' });

export default {
    schemaState,
    protocolState
};