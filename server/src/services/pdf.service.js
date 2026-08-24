import PDFDocument from 'pdfkit';

/**
 * Genera el PDF de una carta responsiva en memoria (Buffer)
 * @param {Object} data - { responsiva, user, asset|phone, empresa }
 * @returns {Promise<Buffer>}
 */
export function generateResponsivaPDF(data) {
    return new Promise((resolve, reject) => {
        const { responsiva, user, asset, phone, empresa = 'Mi Empresa S.A. de C.V.' } = data;
        const doc    = new PDFDocument({ size: 'LETTER', margin: 60 });
        const chunks = [];

        doc.on('data',  chunk => chunks.push(chunk));
        doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ── Encabezado ────────────────────────────────────────
        doc.fontSize(18).font('Helvetica-Bold')
           .text('CARTA RESPONSIVA DE EQUIPO', { align: 'center' });
        doc.fontSize(11).font('Helvetica')
           .text(empresa, { align: 'center' });
        doc.moveDown();

        // ── Folio y fecha ─────────────────────────────────────
        doc.fontSize(10)
           .text(`Folio: ${responsiva.folio}`, { continued: true })
           .text(`Fecha: ${new Date(responsiva.signed_at).toLocaleDateString('es-MX')}`,
                 { align: 'right' });
        doc.moveDown();

        // ── Datos del usuario ──────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL RESPONSABLE');
        doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica')
           .text(`Nombre completo: ${user.full_name}`)
           .text(`Correo: ${user.email}`)
           .text(`Departamento: ${user.department || 'N/D'}`);
        doc.moveDown();

        // ── Datos del equipo ───────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold')
           .text(asset ? 'DATOS DEL EQUIPO' : 'DATOS DEL TELÉFONO');
        doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');

        if (asset) {
            doc.text(`Etiqueta: ${asset.asset_tag}`)
               .text(`Tipo: ${asset.asset_type}`)
               .text(`Marca / Modelo: ${asset.brand} ${asset.model}`)
               .text(`Número de serie: ${asset.serial_number || 'N/D'}`)
               .text(`Estado: ${asset.status}`);
            if (asset.specs) {
                doc.moveDown(0.5).text('Especificaciones técnicas:');
                Object.entries(asset.specs).forEach(([k, v]) => {
                    doc.text(`  • ${k}: ${v}`, { indent: 10 });
                });
            }
        } else if (phone) {
            doc.text(`Etiqueta: ${phone.phone_tag}`)
               .text(`Marca / Modelo: ${phone.brand} ${phone.model}`)
               .text(`IMEI 1: ${phone.imei1}`)
               .text(`IMEI 2: ${phone.imei2 || 'N/D'}`)
               .text(`Número: ${phone.phone_number || 'N/D'}`)
               .text(`Operador: ${phone.carrier || 'N/D'}`)
               .text(`Plan: ${phone.plan || 'N/D'}`);
        }

        doc.moveDown();
        if (responsiva.notes) {
            doc.text(`Observaciones: ${responsiva.notes}`).moveDown();
        }

        // ── Cláusula ──────────────────────────────────────────
        doc.fontSize(9).font('Helvetica')
           .text(
               'El suscrito declara haber recibido en perfectas condiciones el equipo ' +
               'descrito anteriormente, comprometiéndose a hacer buen uso del mismo, ' +
               'a reportar cualquier daño o extravío de manera inmediata al departamento ' +
               'de TI, y a devolverlo cuando así sea requerido por la empresa.',
               { align: 'justify' }
           );
        doc.moveDown(3);

        // ── Firmas ────────────────────────────────────────────
        const y = doc.y;
        doc.moveTo(80, y).lineTo(250, y).stroke()
           .text('Firma del responsable', 80, y + 5);
        doc.moveTo(320, y).lineTo(490, y).stroke()
           .text('Firma Jefe de TI / Entregó', 320, y + 5);

        doc.end();
    });
}