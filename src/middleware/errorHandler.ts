import type { Request, Response, NextFunction } from 'express';


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`ERROR, ${err.message}`, err.stack);
    
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: status === 500 ? "Internal Error " : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}