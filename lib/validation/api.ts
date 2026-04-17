import { z } from 'zod';

export const fileUploadSchema = z.object({
  projectId: z.string().min(8),
  milestoneId: z.string().min(8).optional(),
});

export const aiProcessSchema = z.object({
  projectId: z.string().min(8),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(8000),
    })
  ).min(1).max(50),
  context: z.object({
    projectId: z.string().min(8),
  }).optional(),
});

export const fileIdSchema = z.object({
  fileId: z.string().min(8),
});

export const paymentsInitSchema = z.object({
  milestoneId: z.string().min(8),
  provider: z.enum(['flutterwave', 'paystack']),
  amount: z.number().positive().max(1_000_000),
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
});

export const paymentsRouteSchema = z.object({
  provider: z.enum(['flutterwave', 'paystack']),
  data: z.record(z.string(), z.unknown()),
});

export const createProjectSchema = z.object({
  projectData: z.object({
    title: z.string().min(3).max(180),
    description: z.string().min(3).max(10000),
    clientId: z.string().min(8),
    freelancerId: z.string().min(8),
  }),
});

export const notificationSchema = z.object({
  type: z.enum(['contract_sent']),
  email: z.string().email(),
  data: z.object({
    projectName: z.string().min(1).max(200),
  }),
});

export const signatureSendSchema = z.object({
  contractId: z.string().min(8),
  email: z.string().email(),
  projectName: z.string().min(1).max(200),
});

export const signatureSignSchema = z.object({
  contractId: z.string().min(8),
  signatureDataUrl: z.string().startsWith('data:image/'),
});
