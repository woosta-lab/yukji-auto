import * as XLSX from "xlsx";

export interface POSSalesDaily {
  saleDate: string;
  itemCode: string;
  itemName: string;
  qty: number;
  netSales: number;
}

/**
 * 서버용: ArrayBuffer(또는 Buffer)를 받아서 파싱
 */
export async function parsePOSExcelDailyItemFromArrayBuffer(


  arrayBuffer: ArrayBuffer
): Promise<POSSalesDaily[]> {
  // XLSX는 Uint8Array로 읽는 게 안전함
  const data = new Uint8Array(arrayBuffer);

  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("시트를 찾을 수 없습니다");

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
  if (rows.length < 5) throw new Error("데이터가 부족합니다");

  const headerRow = rows[3];

  const itemCodeIdx = headerRow.findIndex((h: any) =>
    String(h).includes("상품코드") || String(h).includes("코드")
  );
  const itemNameIdx = headerRow.findIndex((h: any) =>
    String(h).includes("상품명") || String(h).includes("품목")
  );
  const dateIdx = headerRow.findIndex((h: any) =>
    String(h).includes("일자") || String(h).includes("날짜")
  );
  const qtyIdx = headerRow.findIndex((h: any) => String(h).includes("수량"));
  const netSalesIdx = headerRow.findIndex((h: any) =>
    String(h).includes("실매출액") || String(h).includes("매출액")
  );

  if (
    itemCodeIdx === -1 ||
    itemNameIdx === -1 ||
    dateIdx === -1 ||
    qtyIdx === -1 ||
    netSalesIdx === -1
  ) {
    throw new Error(
      "필수 컬럼을 찾을 수 없습니다. 상품코드, 상품명, 일자, 수량, 실매출액이 필요합니다."
    );
  }

  const results: POSSalesDaily[] = [];

  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row[itemCodeIdx] || !row[dateIdx]) continue;

    const saleDate = formatDate(row[dateIdx]);
    const itemCode = String(row[itemCodeIdx]).trim();
    const itemName = String(row[itemNameIdx] || "").trim();
    const qty = Number(row[qtyIdx] || 0);
    const netSales = Number(row[netSalesIdx] || 0);

    if (!saleDate || Number.isNaN(qty) || Number.isNaN(netSales)) continue;

    results.push({ saleDate, itemCode, itemName, qty, netSales });
  }

  if (results.length === 0) throw new Error("파싱된 데이터가 없습니다");
  return results;
}

/** 날짜 포맷 */
function formatDate(dateValue: any): string {
  if (!dateValue) return "";

  if (typeof dateValue === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateValue)) return dateValue.replace(/\//g, "-");
  }

  if (typeof dateValue === "number") {
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 86400000);
    return date.toISOString().split("T")[0];
  }

  if (dateValue instanceof Date) {
    return dateValue.toISOString().split("T")[0];
  }

  return "";
}
