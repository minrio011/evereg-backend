import { bangkokToUtcTimestamp, convertToBangkokTime } from "../../utils/date.util";
import { query } from "../../configs/db";
import { sendConfirmationEmail } from "../email/email.service";
import { GetRegistrationQuerySchema, RegisterCampaignSchema } from "./campaign.schema";

export const registerEvent = async ( data: RegisterCampaignSchema ) => {
    const { first_name, last_name, email, phone_number, event_id } = data;

    const sql = `
        INSERT INTO registrations (first_name, last_name, email, phone_number, event_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    try {
        const result = await query(sql, [first_name, last_name, email, phone_number, event_id]);
        const newRegister = result.rows[0];

        try {
            await sendConfirmationEmail(email, first_name);

            const updateSql = `
                UPDATE registrations
                SET is_sent = true
                WHERE id = $1
            `;

            await query(updateSql, [newRegister.id]);
            return { ...newRegister, is_sent: true };
        } catch (error) {
            return newRegister;
        }
    } catch (error) {
        throw new Error("Failed to register event.");
    }
};

export const getDashboardSummary = async () => {
    const sql = `
        SELECT
            -- 1. Total number of registrations
            (SELECT COUNT(*) FROM registrations) AS total_registrations,

            -- 2. Total number of fan zone eligible registrations
            (SELECT COUNT(*) FROM registrations WHERE is_eligible = true) as eligible_count,
            (SELECT SUM(max_capacity) FROM events) as total_capacity,

            -- 3. Total number of registrations that have been email sent
            (SELECT COUNT(*) FROM registrations WHERE is_sent = true) as email_sent_count
    `;

    const result = await query(sql);
    const row = result.rows[0];
    return {
        total_registrations: row.total_registrations,
        fan_zone: {
            current: row.eligible_count,
            total: row.total_capacity,
        },
        email_sent: {
            sent: row.email_sent_count,
            total: row.total_registrations,
        }
    };
};

export const getAllRegistration = async (params: GetRegistrationQuerySchema) => {
    const { page, limit, event_id, search, email, start_date, end_date } = params;
    const offset = (page - 1) * limit;

    let filterSql = " FROM registrations r LEFT JOIN events e ON r.event_id = e.id WHERE 1=1";
    const values: any[] = [];

    if (event_id) {
        values.push(event_id);
        filterSql += ` AND r.event_id = $${values.length}`;
    }

    if (start_date && end_date) {
        if (start_date === end_date) {
            const utcDate = bangkokToUtcTimestamp(start_date);
            values.push(utcDate);
            filterSql += ` AND e.event_date = $${values.length}::timestamp`;
        } else {
            const utcStartDate = bangkokToUtcTimestamp(start_date);
            const utcEndDate = bangkokToUtcTimestamp(end_date);
            values.push(utcStartDate, utcEndDate);
            filterSql += ` AND e.event_date BETWEEN $${values.length - 1}::timestamp AND $${values.length}::timestamp`;
        }
    }

    if (search) {
        values.push(`%${search}%`);
        filterSql += ` AND (r.first_name ILIKE $${values.length} OR r.last_name ILIKE $${values.length})`;
    }

    if (email) {
        values.push(`%${email}%`);
        filterSql += ` AND r.email ILIKE $${values.length}`;
    }

    const countSql = `
        SELECT COUNT(*)
        ${filterSql}
    `;
    const totalResult = await query(countSql, values);
    const totalItems = parseInt(totalResult.rows[0].count);

    const dataSql = `SELECT r.*, e.event_name, e.event_date ${filterSql} ORDER BY r.created_at ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const result = await query(dataSql, [...values, limit, offset]);

    const formattedList = result.rows.map(row => ({
        ...row,
        event_date: convertToBangkokTime(row.event_date),
        created_at: convertToBangkokTime(row.created_at),
    }));

    return {
        list: formattedList,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            limit
        }
    };
};

export const getAllRegistrationForExport = async (params: GetRegistrationQuerySchema) => {
    const { event_id, search, email, start_date, end_date } = params;

    let filterSql = " FROM registrations r LEFT JOIN events e ON r.event_id = e.id WHERE 1=1";
    const values: any[] = [];

    if (event_id) {
        values.push(event_id);
        filterSql += ` AND r.event_id = $${values.length}`;
    }
    if (start_date && end_date) {
        if (start_date === end_date) {
            const utcDate = bangkokToUtcTimestamp(start_date);
            values.push(utcDate);
            filterSql += ` AND e.event_date = $${values.length}::timestamp`;
        } else {
            const utcStartDate = bangkokToUtcTimestamp(start_date);
            const utcEndDate = bangkokToUtcTimestamp(end_date);
            values.push(utcStartDate, utcEndDate);
            filterSql += ` AND e.event_date BETWEEN $${values.length - 1}::timestamp AND $${values.length}::timestamp`;
        }
    }
    if (search) {
        values.push(`%${search}%`);
        filterSql += ` AND (r.first_name ILIKE $${values.length} OR r.last_name ILIKE $${values.length})`;
    }
    if (email) {
        values.push(`%${email}%`);
        filterSql += ` AND r.email ILIKE $${values.length}`;
    }

    const sql = `SELECT r.first_name, r.last_name, r.email, r.phone_number, e.event_date, e.event_name, r.is_eligible, r.is_sent, r.created_at ${filterSql} ORDER BY r.created_at ASC`;
    const result = await query(sql, values);
    
    return result.rows;
};

export const updateEligibility = async (id: number) => {
    const sql = `
        UPDATE registrations
        SET is_eligible = NOT is_eligible
        WHERE id = $1
        RETURNING *
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
        throw new Error("Registration not found");
    }
    return result.rows[0];
};

export const sendManualEmail = async (id: number) => {
    const userResult = await query("SELECT id, first_name, email, is_sent FROM registrations WHERE id = $1", [id]);

    const user = userResult.rows[0];
    if (!user) {
        throw new Error("Registration not found");
    }
    if (user.is_sent) {
        throw new Error("Email already sent");
    }

    await sendConfirmationEmail(user.email, user.first_name);

    const updateSql = `
        UPDATE registrations
        SET is_sent = true
        WHERE id = $1
        RETURNING *
    `;
    const updateResult = await query(updateSql, [id]);
    return updateResult.rows[0];
};
