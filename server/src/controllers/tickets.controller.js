import { supabaseAdmin } from '../config/supabaseClient.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getTickets(req, res, next) {
    try {
        const { page = 1, limit = 20, status, category, priority } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('tickets')
            .select(`
                *,
                requester:profiles!tickets_requester_id_fkey(full_name, email, department),
                assignee:profiles!tickets_assigned_to_fkey(full_name, email)
            `, { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (status)   query = query.eq('status', status);
        if (category) query = query.eq('category', category);
        if (priority) query = query.eq('priority', priority);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getTicketById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tickets')
            .select(`
                *,
                requester:profiles!tickets_requester_id_fkey(full_name, email, department),
                assignee:profiles!tickets_assigned_to_fkey(full_name, email)
            `)
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Ticket no encontrado', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createTicket(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tickets')
            .insert({ ...req.body, requester_id: req.user.id })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updateTicket(req, res, next) {
    try {
        const updates = { ...req.body };
        if (updates.status === 'resolved' && !updates.resolved_at) {
            updates.resolved_at = new Date().toISOString();
        }
        if (updates.status === 'closed' && !updates.closed_at) {
            updates.closed_at = new Date().toISOString();
        }

        const { data, error } = await supabaseAdmin
            .from('tickets')
            .update(updates)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function getComments(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('ticket_comments')
            .select(`*, author:profiles!ticket_comments_author_id_fkey(full_name, email)`)
            .eq('ticket_id', req.params.id)
            .order('created_at', { ascending: true });
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function addComment(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('ticket_comments')
            .insert({
                ticket_id:   req.params.id,
                author_id:   req.user.id,
                body:        req.body.body,
                is_internal: req.body.is_internal || false,
            })
            .select().single();
        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}