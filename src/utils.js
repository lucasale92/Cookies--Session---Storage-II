import {fileURLToPath} from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);
export default __dirname;

export function isAdmin (req, res, next){
    if (req.session?.user === 'admin@coder' && req.session?.admin){
        return next ();
    }
    return res.status(401).send ('error de autenticacion')
}