export function errorHandler(err, req, res, _next) {
    console.error('❌  Error:', err);
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}