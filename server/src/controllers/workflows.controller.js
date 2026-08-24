import { supabase } from '../config/supabase.js'; // Ajusta la ruta a tu cliente de Supabase

export const getWorkflows = async (req, res) => {
    const { data, error } = await supabase.from('maintenance_workflows').select('*').order('title');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export const createWorkflow = async (req, res) => {
    const { data, error } = await supabase.from('maintenance_workflows').insert([req.body]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};

export const deleteWorkflow = async (req, res) => {
    const { error } = await supabase.from('maintenance_workflows').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Eliminado correctamente' });
};