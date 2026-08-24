import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getLicenses(req, res, next) {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('software_licenses')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getLicenseById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('software_licenses')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Licencia no encontrada', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createLicense(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('software_licenses')
            .insert({ ...req.body, created_by: req.user.id })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updateLicense(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('software_licenses')
            .update(req.body)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function deleteLicense(req, res, next) {
    try {
        const { error } = await supabaseAdmin
            .from('software_licenses')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (e) { next(e); }
}