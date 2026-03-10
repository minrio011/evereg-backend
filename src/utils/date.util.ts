import { formatInTimeZone } from 'date-fns-tz';

const TIME_ZONE = 'Asia/Bangkok';

export const convertToBangkokTime = (dateString: string | null) => {
    if (!dateString) return null;

    const utcDate = new Date(dateString + 'Z');

    return formatInTimeZone(utcDate, TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
};