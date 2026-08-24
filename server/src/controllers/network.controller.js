import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getIPs(req, res, next) {
    try {
        const { page = 1, limit = 50, status, segment } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('network_ips')
            .select(`
                *,
                asset:assets(asset_tag, brand, model),
                assignee:profiles!network_ips_assigned_to_fkey(full_name, department)
            `, { count: 'exact' })
            .range(from, to)
            .order('ip_address', { ascending: true });

        if (status)  query = query.eq('status', status);
        if (segment) query = query.eq('network_segment', segment);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getIPById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('network_ips')
            .select(`
                *,
                asset:assets(asset_tag, brand, model),
                assignee:profiles!network_ips_assigned_to_fkey(full_name, department)
            `)
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'IP no encontrada', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createIP(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('network_ips')
            .insert({ ...req.body, created_by: req.user.id })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updateIP(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('network_ips')
            .update(req.body)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function deleteIP(req, res, next) {
    try {
        const { error } = await supabaseAdmin
            .from('network_ips')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (e) { next(e); }
}