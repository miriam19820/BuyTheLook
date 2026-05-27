import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {

  if (err instanceof ZodError) {

    const zodErr = err as ZodError<any>;
    
    res.status(400).json({
      success: false,
      error: "Invalid input data",

      details: zodErr.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
    return;
  }

 
  console.error(`[Error] 💥 ${err.message || 'Unknown error'}`);
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
};