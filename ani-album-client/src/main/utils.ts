import * as os from 'os';
import { join } from 'path';

export function getAppDateFolder(): string {
    const home = os.homedir();
    return join(home, 'Library', 'Application Support', 'SmartNotebook');
}
