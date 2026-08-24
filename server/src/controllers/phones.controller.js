import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getPhones(req, res, next) {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('phones')
            .select(`
                *,
                assignee:profiles!phones_assigned_to_fkey(full_name, email, department)
            `, { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getPhoneById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('phones')
            .select(`
                *,
                assignee:profiles!phones_assigned_to_fkey(full_name, email, department)
            `)
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Teléfono no encontrado', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createPhone(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('phones')
            .insert({ ...req.body, created_by: req.user.id })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updatePhone(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('phones')
            .update(req.body)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function deletePhone(req, res, next) {
    try {
        const { error } = await supabaseAdmin
            .from('phones')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (e) { next(e); }
}