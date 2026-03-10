import bcrypt from 'bcrypt';
import { query } from '../../configs/db';
import jwt, { SignOptions } from 'jsonwebtoken';

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

export const registerUser = async (email: string, password: string, username: string) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
        INSERT INTO users (email, password, username)
        VALUES ($1, $2, $3)
        RETURNING id, email, username, created_at
    `;

    const result = await query(sql, [email, hashedPassword, username]);
    return result.rows[0];
}

export const findUserByEmail = async (email: string) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is missing in environment variables');
    }

    const signOptions: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1d'
    };

    return jwt.sign({ id: userId }, secret, signOptions);
}

export const findUserById = async (id: number) => {
    const sql = 'SELECT id, email, username, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
};