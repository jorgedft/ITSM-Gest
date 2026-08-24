import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getUsers(req, res, next) {
    try {
        const { page = 1, limit = 60, role, department } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, role, department, phone_ext, is_active, created_at',
                    { count: 'exact' })
            .range(from, to)
            .order('full_name', { ascending: true });

        if (role)       query = query.eq('role', role);
        if (department) query = query.eq('department', department);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getUserById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, role, department, phone_ext, is_active, created_at')
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Usuario no encontrado', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function updateUser(req, res, next) {
    try {
        // Solo admin puede cambiar roles
        const allowedFields = ['full_name', 'department', 'phone_ext', 'avatar_url'];
        const isAdmin = req.user.role === 'admin';
        if (isAdmin) allowedFields.push('role', 'is_active');

        const filtered = Object.fromEntries(
            Object.entries(req.body).filter(([k]) => allowedFields.includes(k))
        );

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(filtered)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}