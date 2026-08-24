import { supabaseAdmin } from '../config/supabaseClient.js';
import { generateResponsivaPDF } from '../services/pdf.service.js';
import { ok, err, paginated } from '../utils/responseHelper.js';

export async function getResponsivas(req, res, next) {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const from = (page - 1) * limit;
        const to   = from + Number(limit) - 1;

        let query = supabaseAdmin
            .from('responsivas')
            .select(`
                *,
                user:profiles!responsivas_user_id_fkey(full_name, email, department),
                asset:assets(asset_tag, brand, model, asset_type),
                phone:phones(phone_tag, brand, model)
            `, { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error, count } = await query;
        if (error) throw error;
        paginated(res, { data, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) { next(e); }
}

export async function getResponsivaById(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('responsivas')
            .select(`
                *,
                user:profiles!responsivas_user_id_fkey(full_name, email, department),
                asset:assets(asset_tag, brand, model, asset_type, serial_number, specs),
                phone:phones(phone_tag, brand, model, imei1, imei2, phone_number, carrier, plan)
            `)
            .eq('id', req.params.id)
            .single();
        if (error) return err(res, 'Responsiva no encontrada', 404);
        ok(res, data);
    } catch (e) { next(e); }
}

export async function createResponsiva(req, res, next) {
    try {
        const { user_id, asset_id, phone_id, notes, signed_at } = req.body;

        // Generar folio automático
        const year  = new Date().getFullYear();
        const { count } = await supabaseAdmin
            .from('responsivas')
            .select('*', { count: 'exact', head: true });
        const folio = `RESP-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

        // Obtener datos para PDF
        const { data: userProfile } = await supabaseAdmin
            .from('profiles').select('*').eq('id', user_id).single();

        let assetData = null;
        let phoneData = null;

        if (asset_id) {
            const { data } = await supabaseAdmin
                .from('assets').select('*').eq('id', asset_id).single();
            assetData = data;
        }
        if (phone_id) {
            const { data } = await supabaseAdmin
                .from('phones').select('*').eq('id', phone_id).single();
            phoneData = data;
        }

        // Generar PDF en memoria
        const pdfBuffer = await generateResponsivaPDF({
            responsiva: { folio, signed_at: signed_at || new Date().toISOString(), notes },
            user:  userProfile,
            asset: assetData,
            phone: phoneData,
        });

        // Subir PDF a Supabase Storage
        const pdfPath = `${year}/${folio}.pdf`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('responsivas-pdf')
            .upload(pdfPath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('responsivas-pdf')
            .getPublicUrl(pdfPath);

        // Guardar en BD
        const { data, error } = await supabaseAdmin
            .from('responsivas')
            .insert({
                folio,
                user_id,
                asset_id:   asset_id  || null,
                phone_id:   phone_id  || null,
                notes,
                signed_at:  signed_at || new Date().toISOString(),
                pdf_url:    publicUrl,
                pdf_path:   pdfPath,
                created_by: req.user.id,
            })
            .select().single();

        if (error) throw error;
        ok(res, data, 201);
    } catch (e) { next(e); }
}

export async function updateResponsiva(req, res, next) {
    try {
        const { data, error } = await supabaseAdmin
            .from('responsivas')
            .update(req.body)
            .eq('id', req.params.id)
            .select().single();
        if (error) throw error;
        ok(res, data);
    } catch (e) { next(e); }
}

export async function downloadPDF(req, res, next) {
    try {
        const { data: responsiva, error } = await supabaseAdmin
            .from('responsivas')
            .select('pdf_path, folio')
            .eq('id', req.params.id)
            .single();

        if (error || !responsiva?.pdf_path) {
            return err(res, 'PDF no encontrado', 404);
        }

        const { data: fileData, error: dlError } = await supabaseAdmin.storage
            .from('responsivas-pdf')
            .download(responsiva.pdf_path);

        if (dlError) throw dlError;

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="${responsiva.folio}.pdf"`);
        res.send(buffer);
    } catch (e) { next(e); }
}