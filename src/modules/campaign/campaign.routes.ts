import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { getRegistrationQuerySchema, registerCampaignSchema, updateStatusSchema, updateEligibilitySchema } from "./campaign.schema";
import * as campaignController from "./campaign.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
    "/register",
    validate(registerCampaignSchema),
    campaignController.registerEvent
);

router.get(
    "/summary",
    authenticate, 
    campaignController.getDashboardSummary
);

router.get(
    "/registration/all",
    authenticate,
    validate(getRegistrationQuerySchema),
    campaignController.getAllRegistration
);

router.get(
    "/registration/export",
    authenticate, 
    validate(getRegistrationQuerySchema),
    campaignController.exportAllRegistration
);

router.patch(
    "/registration/eligibility",
    authenticate, 
    validate(updateEligibilitySchema),
    campaignController.updateEligibility
);

router.post(
    "/registration/send-email",
    authenticate, 
    validate(updateStatusSchema),
    campaignController.sendManualEmail
);

export default router;