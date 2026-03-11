import { formatInTimeZone } from 'date-fns-tz';

const TIME_ZONE = 'Asia/Bangkok';

export const convertToBangkokTime = (dateString: string | null) => {
    if (!dateString) return null;

    const utcDate = new Date(dateString + 'Z');

    return formatInTimeZone(utcDate, TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
};

export const bangkokToUtcTimestamp = (dateString: string | null) => {
    if (!dateString) return null;

    const normalized = dateString.trim().replace("T", " ").replaceAll("+", " ");
    const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) {
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return null;
        return formatInTimeZone(d, 'UTC', 'yyyy-MM-dd HH:mm:ss');
    }

    const year = Number(m[1]);
    const monthIndex = Number(m[2]) - 1;
    const day = Number(m[3]);
    const hour = m[4] ? Number(m[4]) : 0;
    const minute = m[5] ? Number(m[5]) : 0;
    const second = m[6] ? Number(m[6]) : 0;

    const utcDate = new Date(Date.UTC(year, monthIndex, day, hour - 7, minute, second));
    return formatInTimeZone(utcDate, 'UTC', 'yyyy-MM-dd HH:mm:ss');
};
