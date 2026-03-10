import { convertToBangkokTime } from "../../utils/date.util";
import { getRegistrationQuerySchema, updateEligibilitySchema, updateStatusSchema } from "./campaign.schema";
import * as campaignService from "./campaign.service";
import { Request, Response } from "express";

export const registerEvent = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).json({ message: "Data is missing" });
        }
        const newRegister = await campaignService.registerEvent(data);

        return res.status(201).json({ message: "Registration successful", newRegister });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Error" });
    }
};

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const summary = await campaignService.getDashboardSummary();
        res.status(200).json({ 
            success: true, 
            data: summary 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Error" });
    }
};

export const getAllRegistration = async (req: Request, res: Response) => {
    try {
        const validatedQuery = getRegistrationQuerySchema.parse(req.query);

        const result = await campaignService.getAllRegistration(validatedQuery);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid Request or Filter" });
    }
};

export const exportAllRegistration = async (req: Request, res: Response) => {
    try {
        const validatedQuery = getRegistrationQuerySchema.parse(req.query);
        const data = await campaignService.getAllRegistrationForExport(validatedQuery);

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data to export" });
        }

        const csvHeaders = ["First Name", "Last Name", "Email", "Phone", "Register", "Fan Zone", "สิทธิ์ Fan Zone", "Send Email", "Timestamp"];

        const csvRows = data.map(row => [
            row.first_name,
            row.last_name,
            row.email,
            `'${row.phone_number}`,
            convertToBangkokTime(row.event_date),
            row.event_name,
            row.is_eligible,
            row.is_sent,
            convertToBangkokTime(row.created_at)
        ].join(','));

        const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=registrations_export.csv");

        res.status(200).send("\uFEFF" + csvContent);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Export failed" });
    }
};

export const updateEligibility = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const updatedRegistration = await campaignService.updateEligibility(id);
        res.status(200).json({
            success: true,
            message: "Eligibility updated successfully",
            data: updatedRegistration
        });
    } catch (error: any) {
        if (error.message === "Registration not found") {
            return res.status(404).json({ success: false, message: (error as Error).message });
        }
        res.status(400).json({ success: false, message: "Invalid Request" });
    }
};

export const sendManualEmail = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const updatedRegistration = await campaignService.sendManualEmail(id);
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
            data: updatedRegistration
        });
    } catch (error: any) {
        if (error.message === "Registration not found") {
            return res.status(404).json({ success: false, message: (error as Error).message });
        }
        if (error.message === "Email already sent") {
            return res.status(400).json({ success: false, message: (error as Error).message });
        }
        res.status(500).json({ success: false, message: "Internal Error" });
    }
};