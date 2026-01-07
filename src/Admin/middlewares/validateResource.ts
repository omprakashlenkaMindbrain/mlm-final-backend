import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

const validateResource =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        errors: error.errors ?? error.message,
      });
    }
  };

export default validateResource;
