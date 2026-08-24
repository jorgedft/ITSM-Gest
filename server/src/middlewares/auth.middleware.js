import { supabase } from '../config/supabaseClient.js';

export async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = user;
    next();
}