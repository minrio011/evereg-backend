import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AuthRequest } from '../../interface/auth.interface';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน'});
        }

        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email นี้ถูกใช้งานไปแล้ว' });
        }

        const newUser = await authService.registerUser(email, password, username);

        res.status(201).json({
            status: 'success',
            message: 'ลงทะเบียนสำเร็จ',
            data: { user: newUser }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await authService.findUserByEmail(email);
        if(!user) {
            return res.status(401).json({ status: 'fail', message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const isMatch = await authService.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = authService.generateToken(user.id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: { id: user.id, email: user.email, username: user.username }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await authService.findUserById(req.userId!);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};