import { NextRequest, NextResponse } from "next/server";
console.log("SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SERVICE_ROLE =", process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING");
import { createClient } from "@supabase/supabase-js";
import { parsePOSExcelDailyItemFromArrayBuffer } from "@/lib/parsers/posExcelParser";




// (중요) 서버 런타임 강제: edge에서 꼬이는 경우 방지
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1) env 체크 (비어있으면 바로 터뜨려서 원인 명확히)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL 누락" }, { status: 500 });
    }
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY 누락" }, { status: 500 });
    }

    // 2) 서버용 supabase (service role)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 3) 파일 받기
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });
    }

    // 기본 검증
    const name = file.name?.toLowerCase() || "";
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      return NextResponse.json({ error: "엑셀 파일(.xlsx, .xls)만 업로드 가능합니다" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다" }, { status: 400 });
    }

    // 4) 파일 -> ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 5) 엑셀 파싱 (서버용)
    const parsedData = await parsePOSExcelDailyItemFromArrayBuffer(arrayBuffer);

    // 6) 스토리지 업로드 (Node에선 Buffer로)
    // 6) 스토리지 업로드 (Node에선 Buffer로)
const originalName = file.name || "upload.xlsx";
const ext = originalName.includes(".") ? originalName.split(".").pop() : "xlsx";

// 한글/공백/특수문자 제거 → 안전한 파일명으로 변환
const safeBase = originalName
  .replace(/\.[^/.]+$/, "")              // 확장자 제거
  .replace(/[^a-zA-Z0-9._-]+/g, "_")     // 안전하지 않은 문자들을 _로
  .replace(/_+/g, "_")                   // __ 연속 정리
  .replace(/^_+|_+$/g, "")               // 앞뒤 _ 제거
  .slice(0, 50) || "file";               // 너무 길면 자르고, 비면 file

const fileName = `pos/${Date.now()}_${safeBase}.${ext}`;
const fileBuffer = Buffer.from(arrayBuffer);



    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("documents") // 버킷 이름 정확히 확인!
      .upload(fileName, fileBuffer, {
        contentType: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `파일 저장 실패: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7) pos_reports 기록
    const { data: reportData, error: reportError } = await supabaseAdmin
      .from("pos_reports")
      .insert({
        type: "product_daily_item",
        file_path: uploadData?.path,
        uploaded_by: "00000000-0000-0000-0000-000000000000",

        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reportError) {
      console.error("Report insert error:", reportError);
      return NextResponse.json(
        { error: `리포트 저장 실패: ${reportError.message}` },
        { status: 500 }
      );
    }

    const reportId = reportData.id;

    // 8) pos_sales_daily_item 저장
    const insertData = parsedData.map((item) => ({
      sale_date: item.saleDate,
      item_code: item.itemCode,
      item_name: item.itemName,
      qty: item.qty,
      net_sales: item.netSales,
      source_report_id: reportId,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabaseAdmin
      .from("pos_sales_daily_item")
      .insert(insertData);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: `데이터 저장 실패: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 9) audit_log (실패해도 업로드 성공 자체는 유지해도 되니까 에러는 로그만)
    const { error: auditError } = await supabaseAdmin.from("audit_log").insert({
      actor_user_id: "00000000-0000-0000-0000-000000000000",

      action: "upload",
      entity: "pos_report",
      entity_id: reportId,
      details: { file_name: file.name, record_count: parsedData.length },
      created_at: new Date().toISOString(),
    });

    if (auditError) console.error("Audit insert error:", auditError);

    return NextResponse.json({
      success: true,
      message: `${parsedData.length}개의 판매 기록이 저장되었습니다`,
      recordCount: parsedData.length,
      reportId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message ? `업로드 처리 중 오류: ${error.message}` : "업로드 처리 중 오류" },
      { status: 500 }
    );
  }
}
