import {adminSession} from './admin-auth';
// Self-hosted: never trust Sites identity headers arriving from the public internet.
export function moderatorIdentity(request:Request){return adminSession(request)?'local-admin':null}
