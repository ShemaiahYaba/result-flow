// Supabase Edge Functions for ResultFlow (Deno Runtime)
// ======================================================
// This file contains skeleton code for the 4 main Edge Functions:
// 1. bulk_upload_students
// 2. bulk_upload_results
// 3. download_broadsheet
// 4. generate_transcript
// Each function uses Supabase client for DB operations and Deno APIs for file handling.

// -----------------------------
// Shared Imports
// -----------------------------
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

// Utility: Parse CSV or Excel buffer
async function parseFile(file) {
  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

// 1️⃣ BULK UPLOAD STUDENTS
export async function bulk_upload_students(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

    const rows = await parseFile(file);
    let success = 0, failed = [];

    for (const row of rows) {
      const { matric_number, full_name, level, department_id, session_id } = row;
      if (!matric_number || !full_name) {
        failed.push(row);
        continue;
      }
      const { error } = await supabase.from("students").insert([{ matric_number, full_name, level, department_id, session_id }]);
      if (error) failed.push({ row, error }); else success++;
    }

    return new Response(JSON.stringify({ success, failed }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2️⃣ BULK UPLOAD RESULTS
export async function bulk_upload_results(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const submitted_by = form.get("submitted_by");
    const department_id = form.get("department_id");
    const session_id = form.get("session_id");

    if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

    const rows = await parseFile(file);
    let processed = 0, failed = [];

    for (const row of rows) {
      const { student_id, course_id, score } = row;
      if (!student_id || !course_id || score === undefined) {
        failed.push(row);
        continue;
      }
      const { error } = await supabase.from("results").insert([{ student_id, course_id, score, session_id, submitted_by, status: 'pending' }]);
      if (error) failed.push({ row, error }); else processed++;
    }

    // Create result submission record
    await supabase.from("result_submissions").insert([{
      department_id,
      submitted_by,
      session_id,
      status: 'pending',
      total_records: rows.length,
      processed_records: processed,
      failed_records: failed.length
    }]);

    return new Response(JSON.stringify({ processed, failed }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 3️⃣ DOWNLOAD BROADSHEET (Excel)
export async function download_broadsheet(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department_id = searchParams.get("department_id");
    const session_id = searchParams.get("session_id");
    const level = searchParams.get("level");

    const { data, error } = await supabase.from("results")
      .select("student_id, course_id, score, grade")
      .eq("session_id", session_id);

    if (error) throw error;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Broadsheet");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=broadsheet.xlsx"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 4️⃣ GENERATE TRANSCRIPT (PDF)
export async function generate_transcript(req) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get("student_id");

    const { data: results, error } = await supabase.from("results")
      .select("*, courses(course_title, unit)")
      .eq("student_id", student_id);

    if (error) throw error;

    // TODO: Use a PDF library to layout transcript (placeholder here)
    const pdfContent = `Transcript for ${student_id}\n\n` + JSON.stringify(results, null, 2);

    return new Response(pdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=transcript.pdf"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Export as HTTP handler for Supabase Edge runtime
serve(async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/bulk_upload_students") return bulk_upload_students(req);
  if (url.pathname === "/bulk_upload_results") return bulk_upload_results(req);
  if (url.pathname === "/download_broadsheet") return download_broadsheet(req);
  if (url.pathname === "/generate_transcript") return generate_transcript(req);
  return new Response("Not Found", { status: 404 });
});
