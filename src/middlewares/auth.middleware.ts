import { Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest } from "../interface/auth.interface";

interface JwtPayload {
  id: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'ไม่มีสิทธิ์เข้าถึง กรุณา Login ก่อน' });
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as JwtPayload;

        req.userId = decoded.id;

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token ไม่ถูกต้อง หรือหมดอายุ' });
    }
}