export const PERMISSIONS=[
 ['sell','Tạo và sửa đơn hàng'],['checkout','Thanh toán đơn hàng'],['editPrice','Sửa giá và lưu giá riêng'],['manageCustomers','Thêm / sửa khách hàng'],['viewDebts','Xem công nợ khách hàng'],['allowDebt','Cho khách nợ / nợ lại'],['collectDebt','Thu tiền công nợ'],['recordExpense','Ghi khoản thu / chi'],['viewCash','Xem sổ thu chi'],['viewReports','Xem báo cáo, doanh thu'],['cancelOrder','Hủy đơn chưa thanh toán'],['moveTables','Chuyển / gộp bàn'],['manageMenu','Quản lý món và topping'],['manageTables','Thêm / sửa danh sách bàn']
] as const;
export type Permission=typeof PERMISSIONS[number][0];
export type Permissions=Record<Permission,boolean>;
export const defaultPermissions=():Permissions=>Object.fromEntries(PERMISSIONS.map(([key])=>[key,['sell','checkout','manageCustomers','moveTables'].includes(key)])) as Permissions;
export function normalizePermissions(input:any):Permissions{const defaults=defaultPermissions();for(const [key]of PERMISSIONS)if(typeof input?.[key]==='boolean')defaults[key]=input[key];if(defaults.collectDebt)defaults.viewDebts=true;return defaults}
export function can(user:{role:string;permissions?:any}|null|undefined,key:Permission){return !!user&&(user.role==='admin'||normalizePermissions(user.permissions)[key])}
