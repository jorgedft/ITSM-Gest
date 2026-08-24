export const ok = (res, data, status = 200) =>
    res.status(status).json({ data });

export const err = (res, message, status = 400) =>
    res.status(status).json({ error: message });

export const paginated = (res, { data, total, page, limit }) =>
    res.json({
        data,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });