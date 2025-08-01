import { z } from "zod";

// ============================================================
// MARKSHEET COLUMN SCHEMAS
// ============================================================

// Base marksheet column schema
export const marksheetColumnSchema = z.object({
  id: z.string().uuid("Invalid marksheet column ID"),
  column_name: z.string()
    .min(2, "Column name must be at least 2 characters")
    .max(100, "Column name must be less than 100 characters")
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Column name must start with a letter or underscore and contain only letters, numbers, and underscores"),
  type: z.enum(["identifier", "score", "text", "number"], {
    errorMap: () => ({ message: "Type must be identifier, score, text, or number" })
  }),
  required: z.boolean().default(false),
  order_index: z.number()
    .int("Order index must be an integer")
    .min(0, "Order index must be at least 0"),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Marksheet column creation schema (without ID and timestamps)
export const createMarksheetColumnSchema = marksheetColumnSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Marksheet column update schema (all fields optional except ID)
export const updateMarksheetColumnSchema = createMarksheetColumnSchema.partial().extend({
  id: z.string().uuid("Invalid marksheet column ID"),
});

// Marksheet column search/filter schema
export const marksheetColumnSearchSchema = z.object({
  type: z.enum(["identifier", "score", "text", "number"]).optional(),
  required: z.boolean().optional(),
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Bulk marksheet column creation schema
export const bulkMarksheetColumnSchema = z.object({
  columns: z.array(createMarksheetColumnSchema)
    .min(1, "At least one column is required")
    .max(50, "Maximum 50 columns can be created at once"),
}).strict();

// Marksheet column reorder schema
export const marksheetColumnReorderSchema = z.object({
  columns: z.array(z.object({
    id: z.string().uuid("Invalid column ID"),
    order_index: z.number().int().min(0, "Order index must be at least 0"),
  }))
    .min(1, "At least one column is required")
    .max(50, "Maximum 50 columns can be reordered at once"),
}).strict();

// Marksheet template schema
export const marksheetTemplateSchema = z.object({
  name: z.string()
    .min(2, "Template name must be at least 2 characters")
    .max(100, "Template name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  columns: z.array(createMarksheetColumnSchema)
    .min(1, "At least one column is required")
    .max(50, "Maximum 50 columns allowed"),
  is_active: z.boolean().default(true),
}).strict();

// Marksheet template creation schema
export const createMarksheetTemplateSchema = marksheetTemplateSchema;

// Marksheet template update schema
export const updateMarksheetTemplateSchema = marksheetTemplateSchema.partial().extend({
  id: z.string().uuid("Invalid template ID"),
});

// Marksheet template search schema
export const marksheetTemplateSearchSchema = z.object({
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type MarksheetColumnInput = z.infer<typeof marksheetColumnSchema>;
export type CreateMarksheetColumnInput = z.infer<typeof createMarksheetColumnSchema>;
export type UpdateMarksheetColumnInput = z.infer<typeof updateMarksheetColumnSchema>;
export type MarksheetColumnSearchInput = z.infer<typeof marksheetColumnSearchSchema>;
export type BulkMarksheetColumnInput = z.infer<typeof bulkMarksheetColumnSchema>;
export type MarksheetColumnReorderInput = z.infer<typeof marksheetColumnReorderSchema>;
export type MarksheetTemplateInput = z.infer<typeof marksheetTemplateSchema>;
export type CreateMarksheetTemplateInput = z.infer<typeof createMarksheetTemplateSchema>;
export type UpdateMarksheetTemplateInput = z.infer<typeof updateMarksheetTemplateSchema>;
export type MarksheetTemplateSearchInput = z.infer<typeof marksheetTemplateSearchSchema>; 