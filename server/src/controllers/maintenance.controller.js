import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getLogs(req, res, next) {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('maintenance_logs')
            .select(`
                *,
                asset:assets(asset_tag, brand, model),
                phone:phones(phone_tag, brand, model),
                technician:profiles!maintenance_logs_performed_by_fkey(full_name)
            `, { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (type) query = query.eq('maintenance_type', type);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getLogById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('maintenance_logs')
            .select(`
                *,
                asset:assets(asset_tag, brand, model),
                phone:phones(phone_tag, brand, model),
                technician:profiles!maintenance_logs_performed_by_fkey(full_name, email)
            `)
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Registro no encontrado', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createLog(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('maintenance_logs')
            .insert({ ...req.body, created_by: req.user.id })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updateLog(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('maintenance_logs')
            .update(req.body)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function deleteLog(req, res, next) {
    try {
        const { error } = await supabaseAdmin
            .from('maintenance_logs')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (e) { next(e); }
}