const SHEET_ID = "1VXyaHhX1QOqak1YRs5nss_Uv9UCbll3FbX5iQyS_4Os";
const API_KEY = "AIzaSyBSWX8JyvcZeGr0XiSgofYVdpITUjsviaw";
const RANGE = "baza-sotrudnikov!A1:V100000";
export const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
